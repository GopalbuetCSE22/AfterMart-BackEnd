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
    profile_picture // This will now be the ImageKit URL (or null)
  } = req.body;

  console.log('registerUser body:', req.body); // Log the full body for debugging

  // Basic validation for required fields
  if (!name || !email || !phone || !password || !division || !district || !ward || !area || !house_and_road) {
    return res.status(400).json({ message: 'All required fields must be provided.' });
  }

  try {
    // Check if user with the same email already exists
    console.log("Checking for existing user with email:", email);
    const userCheck = await pool.query(getUserByEmail, [email]);
    console.log('User check result:', userCheck.rows);
    if (userCheck.rows.length > 0) {
      // Error: User with this email already exists
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if address already exists to avoid duplicates
    let addressId;
    const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

    if (addressCheck.rows.length > 0) {
      addressId = addressCheck.rows[0].address_id;
      console.log('Existing address found, ID:', addressId);
    } else {
      // Insert new address if it doesn't exist
      const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
      addressId = addressInsert.rows[0].address_id;
      console.log('New address inserted, ID:', addressId);
    }

    // Insert new user with all details, including the profile_picture URL
    // IMPORTANT: The 'insertUser' query needs to be updated to accept profile_picture.
    await pool.query(insertUser, [
      name,
      email,
      phone,
      hashedPassword,
      addressId,
      house_and_road,
      profile_picture // Pass the ImageKit URL (or null)
    ]);

    console.log('User registered successfully:', { name, email, phone, addressId, house_and_road, profile_picture });

    return res.status(200).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('registerUser error:', error);
    // Generic error message for internal server errors
    return res.status(500).json({ error: 'User registration failed due to an internal server error.' });
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
    //see  the profile_picture link
    console.log('User profile picture URL:', userInfo.rows[0].profile_picture);
    res.status(200).json(userInfo.rows[0]);
  } catch (error) {
    console.error('getinfoUser error:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}


async function isverifiedUser(req, res) {
  const userId = req.params.userId;
  console.log('Fetching user info for userId:', userId);
  try {
    const userInfo = await pool.query('SELECT isverified FROM "User" WHERE user_id = $1', [userId]);
    if (userInfo.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    //see  the profile_picture link
    console.log(userInfo)
    res.status(200).json(userInfo.rows[0]);
  } catch (error) {
    console.error('getinfoUser error:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}

async function getuserName(req, res) {
  const userId = req.params.userId;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const userInfo = await pool.query('SELECT name FROM "User" WHERE user_id = $1', [userId]);
    if (userInfo.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return the user's name
    res.status(200).json({ name: userInfo.rows[0].name });
  } catch (error) {
    console.error('getuserName error:', error);
    res.status(500).json({ error: 'Failed to fetch user name' });
  }
}

module.exports = {
  registerUser,
  getUsersToVerify,
  verifyUser,
  getinfoUser,
  isverifiedUser,
  getuserName
};
