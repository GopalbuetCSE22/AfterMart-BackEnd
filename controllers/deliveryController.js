const pool = require('../db/pool');
const {
  findAddress,
  insertAddress,
  insertDeliveryService,
  getUnverifiedDeliveryServices,
  verifyDeliveryServiceById,
  getDeliveryServiceByCompanyAndTrade,
} = require('../queries/deliveryQueries');

// Register a new delivery company
async function registerDeliveryService(req, res) {
  const { companyName, tradeLicense, division, district, ward, area } = req.body;

  try {
    const existing = await pool.query(getDeliveryServiceByCompanyAndTrade, [companyName, tradeLicense]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Delivery service with this trade license already exists' });
    }

    let addressId;
    const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

    if (addressCheck.rows.length > 0) {
      addressId = addressCheck.rows[0].address_id;
    } else {
      const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
      addressId = addressInsert.rows[0].address_id;
    }

    await pool.query(insertDeliveryService, [companyName, tradeLicense, addressId]);

    res.status(200).json({ message: 'Delivery Service registered successfully, wait for verification' });
  } catch (error) {
    console.error('registerDeliveryService error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// for admin 
async function getDeliveryServicesToVerify(req, res) {
  try {
    const services = await pool.query(getUnverifiedDeliveryServices);
    res.status(200).json(services.rows);
  } catch (error) {
    console.error('getDeliveryServicesToVerify error:', error);
    res.status(500).json({ error: 'Failed to fetch unverified delivery companies' });
  }
}

// for admin
async function verifyDeliveryService(req, res) {
  const companyId = req.params.id;
  const { admin_id } = req.body;

  if (!admin_id) {
    return res.status(400).json({ error: 'adminId is required to verify delivery service' });
  }

  try {
    await pool.query(verifyDeliveryServiceById, [companyId, admin_id]);
    res.status(200).json({ message: 'Delivery company verified successfully' });
  } catch (error) {
    console.error('verifyDeliveryService error:', error);
    res.status(500).json({ error: 'Failed to verify delivery company' });
  }
}

module.exports = {
  registerDeliveryService,
  getDeliveryServicesToVerify,
  verifyDeliveryService,
};
