const express = require("express");
const pool = require("../db");

const router = express.Router();

const MAX_LISTING_ID_LENGTH = 255;
const LISTING_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const ALLOWED_QUERY_PARAMS = new Set([
  "city",
  "zipcode",
  "minPrice",
  "maxPrice",
  "beds",
  "baths",
  "limit",
  "offset",
  "sortBy",
  "sortOrder",
]);

const SORT_COLUMNS = new Set([
  "L_SystemPrice",
  "ListingContractDate",
  "LM_Int2_3",
  "L_Keyword2",
]);

function parseWholeNumber(value, name, { min, max } = {}) {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || !/^\d+$/.test(value)) {
    throw new Error(`${name} must be a whole number`);
  }

  const parsed = Number(value);

  if (min !== undefined && parsed < min) {
    throw new Error(`${name} must be at least ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new Error(`${name} must be at most ${max}`);
  }

  return parsed;
}

function parseDecimalNumber(value, name, { min } = {}) {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || value.trim() === "") {
    throw new Error(`${name} must be a number`);
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${name} must be a number`);
  }

  if (min !== undefined && parsed < min) {
    throw new Error(`${name} must be at least ${min}`);
  }

  return parsed;
}

function parseText(value, name) {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value) || value.trim() === "") {
    throw new Error(`${name} cannot be empty`);
  }

  return value;
}

function isValidListingId(id) {
  return (
    typeof id === "string" &&
    id.length > 0 &&
    id.length <= MAX_LISTING_ID_LENGTH &&
    LISTING_ID_PATTERN.test(id)
  );
}

function sendInvalidListingId(res) {
  return res.status(400).json({
    error: `Listing ID must be 1-${MAX_LISTING_ID_LENGTH} characters and contain only letters, numbers, hyphens, or underscores`,
  });
}

router.get("/", async (req, res) => {
  try {
    for (const param of Object.keys(req.query)) {
      if (!ALLOWED_QUERY_PARAMS.has(param)) {
        return res.status(400).json({
          error: `Unknown query parameter: ${param}`,
        });
      }
    }

    const city = parseText(req.query.city, "city");
    const zipcode = parseText(req.query.zipcode, "zipcode");
    const minPrice = parseWholeNumber(req.query.minPrice, "minPrice", { min: 0 });
    const maxPrice = parseWholeNumber(req.query.maxPrice, "maxPrice", { min: 0 });
    const beds = parseWholeNumber(req.query.beds, "beds", { min: 0 });
    const baths = parseDecimalNumber(req.query.baths, "baths", { min: 0 });
    const limit = parseWholeNumber(req.query.limit, "limit", {
      min: 1,
      max: 100,
    }) || 20;
    const offset = parseWholeNumber(req.query.offset, "offset", { min: 0 }) || 0;
    const sortBy = req.query.sortBy || "ListingContractDate";
    const sortOrder = (req.query.sortOrder || "desc").toLowerCase();

    if (Array.isArray(req.query.sortBy) || !SORT_COLUMNS.has(sortBy)) {
      return res.status(400).json({ error: "sortBy must be one of: L_SystemPrice, ListingContractDate, LM_Int2_3, L_Keyword2" });
    }
    if (Array.isArray(req.query.sortOrder) || !["asc", "desc"].includes(sortOrder)) {
      return res.status(400).json({ error: "sortOrder must be asc or desc" });
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({
        error: "minPrice cannot be greater than maxPrice",
      });
    }

    // SQL fragments are selected only by server code while user values stay in
    // placeholders. This preserves flexible filtering without making SQL injection
    // possible through a filter value.
    const conditions = [];
    const values = [];

    if (city !== undefined) {
      conditions.push("L_City = ?");
      values.push(city.trim());
    }

    if (zipcode !== undefined) {
      conditions.push("L_Zip = ?");
      values.push(zipcode);
    }

    if (minPrice !== undefined) {
      conditions.push("L_SystemPrice >= ?");
      values.push(minPrice);
    }

    if (maxPrice !== undefined) {
      conditions.push("L_SystemPrice <= ?");
      values.push(maxPrice);
    }

    if (beds !== undefined) {
      conditions.push("L_Keyword2 = ?");
      values.push(beds);
    }

    if (baths !== undefined) {
      conditions.push("LM_Dec_3 = ?");
      values.push(baths);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const countSql = `
      SELECT COUNT(*) AS total
      FROM rets_property
      ${whereClause}
    `;

    const dataSql = `
      SELECT *
      FROM rets_property
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}, id ${sortOrder.toUpperCase()}
      LIMIT ?
      OFFSET ?
    `;

    const [countRows] = await pool.query(countSql, values);
    const [results] = await pool.query(dataSql, [...values, limit, offset]);

    res.json({
      total: countRows[0].total,
      limit,
      offset,
      sortBy,
      sortOrder,
      results,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Fixed route must stay above /:id so "favorites" is not treated as an ID.
router.get("/favorites", async (req, res) => {
  if (Array.isArray(req.query.ids) || typeof req.query.ids !== "string") {
    return res.status(400).json({ error: "ids must be a comma-separated list" });
  }
  const ids = [...new Set(req.query.ids.split(",").map((id) => id.trim()).filter(Boolean))];
  if (!ids.length) return res.json([]);
  if (ids.length > 100 || ids.some((id) => !isValidListingId(id))) {
    return res.status(400).json({ error: "Provide 1-100 valid listing IDs" });
  }
  try {
    const placeholders = ids.map(() => "?").join(",");
    const [properties] = await pool.query(
      `SELECT * FROM rets_property WHERE L_ListingID IN (${placeholders})`, ids
    );
    const order = new Map(ids.map((id, index) => [id, index]));
    properties.sort((a, b) => order.get(String(a.L_ListingID)) - order.get(String(b.L_ListingID)));
    return res.json(properties);
  } catch (error) {
    console.error("Failed to retrieve favorite properties:", error);
    return res.status(500).json({ error: "Failed to retrieve favorite properties" });
  }
});

// Keep this more-specific route before /:id so it is matched first.
router.get("/:id/openhouses", async (req, res) => {
  const { id } = req.params;

  if (!isValidListingId(id)) {
    return sendInvalidListingId(res);
  }

  try {
    const [properties] = await pool.query(
      "SELECT L_ListingID FROM rets_property WHERE L_ListingID = ? LIMIT 1",
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        error: `Property with listing ID ${id} was not found`,
      });
    }

    const [openHouses] = await pool.query(
      `SELECT *
       FROM rets_openhouse
       WHERE L_ListingID = ?
       ORDER BY COALESCE(OH_StartDate, OpenHouseDate) ASC,
                OH_StartTime ASC`,
      [id]
    );

    // all_data is deliberately returned as stored. Parsing malformed legacy JSON
    // here could make one bad row crash the entire request.
    return res.json(openHouses);
  } catch (error) {
    console.error(`Failed to retrieve open houses for ${id}:`, error);
    return res.status(500).json({
      error: "Failed to retrieve open houses",
    });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidListingId(id)) {
    return sendInvalidListingId(res);
  }

  try {
    const [properties] = await pool.query(
      "SELECT * FROM rets_property WHERE L_ListingID = ? LIMIT 1",
      [id]
    );

    if (properties.length === 0) {
      return res.status(404).json({
        error: `Property with listing ID ${id} was not found`,
      });
    }

    return res.json(properties[0]);
  } catch (error) {
    console.error(`Failed to retrieve property ${id}:`, error);
    return res.status(500).json({
      error: "Failed to retrieve property",
    });
  }
});

module.exports = router;
