const express = require("express");
const pool = require("../db");

const router = express.Router();
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

router.get("/range", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT MIN(oh.OpenHouseDate) AS minDate, MAX(oh.OpenHouseDate) AS maxDate
       FROM rets_openhouse AS oh
       INNER JOIN rets_property AS p ON p.L_ListingID = oh.L_ListingID`
    );
    const [nearest] = await pool.query(
      `SELECT oh.OpenHouseDate AS nearestDate
       FROM rets_openhouse AS oh
       INNER JOIN rets_property AS p ON p.L_ListingID = oh.L_ListingID
       ORDER BY ABS(DATEDIFF(oh.OpenHouseDate, CURRENT_DATE)) ASC
       LIMIT 1`
    );
    return res.json({ ...rows[0], nearestDate: nearest[0]?.nearestDate || null });
  } catch (error) {
    console.error("Failed to retrieve open house range:", error);
    return res.status(500).json({ error: "Failed to retrieve open house date range" });
  }
});

router.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;
  const unknown = Object.keys(req.query).filter((key) => !["startDate", "endDate"].includes(key));
  if (unknown.length) return res.status(400).json({ error: `Unknown query parameter: ${unknown[0]}` });
  if (!validDate(startDate) || !validDate(endDate)) {
    return res.status(400).json({ error: "startDate and endDate must be valid YYYY-MM-DD dates" });
  }
  if (startDate > endDate) return res.status(400).json({ error: "startDate cannot be after endDate" });

  try {
    const [rows] = await pool.query(
      `SELECT oh.*, p.L_Address, p.L_City, p.L_State, p.L_SystemPrice
       FROM rets_openhouse AS oh
       INNER JOIN rets_property AS p ON p.L_ListingID = oh.L_ListingID
       WHERE oh.OpenHouseDate BETWEEN ? AND ?
       ORDER BY oh.OpenHouseDate ASC, oh.OH_StartTime ASC, oh.id ASC`,
      [startDate, endDate]
    );
    return res.json(rows);
  } catch (error) {
    console.error("Failed to retrieve open house calendar:", error);
    return res.status(500).json({ error: "Failed to retrieve open houses" });
  }
});

module.exports = router;
module.exports.validDate = validDate;
