
const pool = require('../db/pool');
const { getUnverifiedUsers, verifyUserById } = require('../queries/adminQueries');

async function getUsersToVerify(req, res) {
  console.log('getUsersToVerify called');
  try {
    const users = await pool.query(getUnverifiedUsers);
    res.status(200).json(users.rows);
  } catch (error) {
    console.error('getUsersToVerify error:', error);
    res.status(500).json({ error: 'Failed to fetch unverified users' });
  }
}

async function verifyUser(req, res) {
  const userId = req.params.id;

  try {
    await pool.query(verifyUserById, [userId]);
    res.status(200).json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('verifyUser error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
}

module.exports = {
  getUsersToVerify,
  verifyUser,
};
