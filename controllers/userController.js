const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const {
  getUserByEmail,
  findAddress,
  insertAddress,
  insertUser,
  getUnverifiedUsers,
  verifyUserById,
} = require('../queries/userQueries');

// Register a new user
async function registerUser(req, res) {
  const {
    name,
    email,
    phone,
    password,
    division,
    district,
    ward,
    area,
    house_and_road,
  } = req.body;
  console.log('registerUser body:', req.body);
  
  try {
    // Check if user with the same email already exists
    console.log("Gopal checking for existing user with email:", email);
    
    const userCheck = await pool.query(getUserByEmail, [email]);
    console.log('User check result:', userCheck.rows);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if address already exists
    let addressId;
    const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

    if (addressCheck.rows.length > 0) {
      addressId = addressCheck.rows[0].address_id;
    } else {
      const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
      addressId = addressInsert.rows[0].address_id;
    }

    // Insert new user
    await pool.query(insertUser, [
      name,
      email,
      phone,
      hashedPassword,
      addressId,
      house_and_road,
    ]);
    console.log(name, email, phone, hashedPassword, addressId, house_and_road);
    

    return res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({ error: 'User registration failed' });
  }
}

// Admin: Get all unverified users
async function getUsersToVerify(req, res) {
  console.log('Fetching unverified users');
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

async function getinfoUser(req, res) {
  const userId = req.params.userId;
  console.log('Fetching user info for userId:', userId);
  try {
    const userInfo = await pool.query('SELECT * FROM "User" WHERE user_id = $1', [userId]);
    if (userInfo.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(userInfo.rows[0]);
  } catch (error) {
    console.error('getinfoUser error:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}

module.exports = {
  registerUser,
  getUsersToVerify,
  verifyUser,
  getinfoUser
};
