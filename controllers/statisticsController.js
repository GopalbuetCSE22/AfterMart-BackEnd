const pool = require('../db/pool');
const { getPlatformStatsQuery } = require('../queries/statistics.js');

const getPlatformStats = async (req, res) => {
  try {
    const result = await pool.query(getPlatformStatsQuery);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getPlatformStats };
