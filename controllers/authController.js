
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  getUserByEmail,
  getAdminByEmail,
  getDeliveryByCompanyNameAndTradeLicense,
  getDeliveryManByEmail
} = require('../queries/authQueries');

const SECRET_KEY = "PASSword";

async function userLogin(req, res) {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(getUserByEmail, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    console.log(password, user.password, isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token, user_id: user.user_id, name: user.name, email: user.email ,isverified: user.isverified});
  } catch (error) {
    console.error('userLogin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(getAdminByEmail, [email]);
    const admin = rows[0];
    // console.log(admin);


    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = password === admin.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.admin_id, email: admin.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    // After successful login ,store the admin_id in localStorage for later use
    // localStorage.setItem("admin_id", response.data.admin.admin_id);
    // console.log("Admin ID:", admin.user_id);
    // res.status(200).json({ token });
    res.status(200).json({ token, admin_id: admin.admin_id });
  } catch (error) {
    console.error('adminLogin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deliveryServiceLogin(req, res) {
  const { companyName, tradeLicense } = req.body;

  try {
    const { rows } = await pool.query(getDeliveryByCompanyNameAndTradeLicense, [
      companyName,
      tradeLicense,
    ]);
    const deliveryCompany = rows[0];

    if (!deliveryCompany) {
      return res.status(401).json({ message: 'Invalid Company or tradeLicense' });
    }

    const token = jwt.sign(
      { id: deliveryCompany.company_id, company_name: deliveryCompany.company_name },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token, company_id: deliveryCompany.company_id });
  } catch (error) {
    console.error('deliveryServiceLogin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deliveryManlogin(req, res) {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query(getDeliveryManByEmail, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = user.password == password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.deliveryman_id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.status(200).json({ token, deliveryman_id: user.deliveryman_id });
  } catch (error) {
    console.error('userLogin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  userLogin,
  adminLogin,
  deliveryServiceLogin,
  deliveryManlogin
};
