
const pool = require('../db/pool');
const bcrypt = require('bcrypt');
const {
  findAddress,
  insertAddress,
  insertDeliveryService,
  getUnverifiedDeliveryServices,
  verifyDeliveryServiceById,
  getDeliveryServiceByCompanyAndTrade,
  createDeliveryManQuery,
  showDeliveryManUnderCompanyIdQuery
} = require('../queries/deliveryQueries');

// Register a new delivery company
async function registerDeliveryService(req, res) {
  const { companyName, tradeLicense, password, division, district, ward, area } = req.body;

  try {
    const existing = await pool.query(getDeliveryServiceByCompanyAndTrade, [companyName, tradeLicense]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Delivery service with this trade license already exists' });
    }

    // Address resolution (unchanged)
    let addressId;
    const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

    if (addressCheck.rows.length > 0) {
      addressId = addressCheck.rows[0].address_id;
    } else {
      const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
      addressId = addressInsert.rows[0].address_id;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Updated insert
    await pool.query(insertDeliveryService, [companyName, tradeLicense, addressId, hashedPassword]);

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

async function createDeliveryMan(req, res) {
  // --- CHNAGE 1: Destructure 'areas' as an array
  const { company_id, name, phone, email, password, vehicle_type, division, district, ward, areas } = req.body;

  // --- CHNAGE 2: Updated validation for 'areas'
  if (!company_id || !name || !phone || !email || !password || !vehicle_type || !division || !district || !ward || !Array.isArray(areas) || areas.length === 0) {
    return res.status(400).json({ error: 'All fields (including at least one preferred area) are required.' });
  }

  console.log('createDeliveryMan called with:', { company_id, name, phone, email, password, vehicle_type, division, district, ward, areas });

  let client; // Declare client variable for transaction management
  try {
    client = await pool.connect(); // --- CHNAGE 3: Get a client from the pool
    await client.query('BEGIN'); // --- CHNAGE 4: Start a database transaction

    // 1. Insert the new delivery man into the delivery_man table
    const deliveryManResult = await client.query(createDeliveryManQuery, [company_id, name, phone, email, password, vehicle_type]);
    const currentDeliveryManID = deliveryManResult.rows[0].deliveryman_id;
    console.log('New DeliveryMan ID:', currentDeliveryManID);

    // 2. Process each preferred area from the 'areas' array
    for (const area of areas) {
      let addressIdforDeliveryMan;

      // Check if the exact address (division, district, ward, area) already exists
      const addressCheck = await client.query(findAddress, [division, district, ward, area]);

      if (addressCheck.rows.length > 0) {
        // If address exists, use its ID
        addressIdforDeliveryMan = addressCheck.rows[0].address_id;
      } else {
        // If address does not exist, insert it and get the new ID
        const addressInsert = await client.query(insertAddress, [division, district, ward, area]);
        addressIdforDeliveryMan = addressInsert.rows[0].address_id;
      }

      // Insert the deliveryman_id and address_id into the deliverymanprefarea table
      // This handles the many-to-many relationship
      await client.query(`INSERT INTO deliverymanprefarea (address_id, deliveryman_id) VALUES ($1, $2)`, [addressIdforDeliveryMan, currentDeliveryManID]);
    }

    await client.query('COMMIT'); // --- CHNAGE 5: Commit the transaction if all operations succeed
    res.status(201).json({
      message: "DeliveryMan created and preferred areas assigned successfully",
      deliveryman_id: currentDeliveryManID // You might want to return more info here if needed by frontend
    });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK'); // --- CHNAGE 6: Rollback the transaction on any error
    }
    console.error('createDeliveryMan error:', error);

    // --- CHNAGE 7: Improved error handling for specific PostgreSQL errors
    if (error.code === '23505') { // PostgreSQL unique violation error code
        if (error.constraint === 'delivery_man_email_key') {
            return res.status(409).json({ error: 'Email already registered for a delivery man.' });
        }
        if (error.constraint === 'delivery_man_phone_key') {
            return res.status(409).json({ error: 'Phone number already registered for a delivery man.' });
        }
    }
    res.status(500).json({
      error: 'Failed to create delivery man and assign preferred areas due to a server error.'
    });
  } finally {
    if (client) {
      client.release(); // --- CHNAGE 8: Release the client back to the pool
    }
  }
}
async function showDeliveryManUnderCompanyId(req, res) {
  const { company_id } = req.params;
  try {
    const result = await pool.query(showDeliveryManUnderCompanyIdQuery, [company_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('showDeliveryManUnderCompanyId error:', error);
    res.status(500).json({ error: 'Failed to retrieve delivery men.' });
  }
}
// ...existing code...

module.exports = {
  registerDeliveryService,
  getDeliveryServicesToVerify,
  verifyDeliveryService,
  createDeliveryMan,
  showDeliveryManUnderCompanyId
};