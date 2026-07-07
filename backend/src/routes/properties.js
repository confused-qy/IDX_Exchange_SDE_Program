const express = require("express");
const pool = require("../db");

const router = express.Router();

const ALLOWED_QUERY_PARAMS = new Set([
  "city",
  "zipcode",
  "minPrice",
  "maxPrice",
  "beds",
  "baths",
  "limit",
  "offset",
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

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({
        error: "minPrice cannot be greater than maxPrice",
      });
    }

    const conditions = [];
    const values = [];

    if (city !== undefined) {
      conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
      values.push(city);
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
      ORDER BY id
      LIMIT ?
      OFFSET ?
    `;

    const [countRows] = await pool.query(countSql, values);
    const [results] = await pool.query(dataSql, [...values, limit, offset]);

    res.json({
      total: countRows[0].total,
      limit,
      offset,
      results,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

module.exports = router;
