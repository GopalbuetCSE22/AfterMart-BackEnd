// controllers/categoryController.js

const pool = require('../db/pool');
const { fetchAllCategories } = require('../queries/categoryQueries');

// GET /api/products/categories
async function getAllCategories(req, res) {
  try {
    console.log('Fetching all categories');
    const result = await pool.query(fetchAllCategories);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getAllCategories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

module.exports = {
  getAllCategories
};
