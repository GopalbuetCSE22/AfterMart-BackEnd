// const pool = require('../db/pool');
// const {
//   findAddress,
//   insertAddress,
//   insertDeliveryService,
//   getUnverifiedDeliveryServices,
//   verifyDeliveryServiceById,
//   getDeliveryServiceByCompanyAndTrade,
//   createDeliveryManQuery,
//   showDeliveryManUnderCompanyIdQuery
// } = require('../queries/deliveryQueries');

// // Register a new delivery company
// async function registerDeliveryService(req, res) {
//   const { companyName, tradeLicense, division, district, ward, area } = req.body;

//   try {
//     const existing = await pool.query(getDeliveryServiceByCompanyAndTrade, [companyName, tradeLicense]);
//     if (existing.rows.length > 0) {
//       return res.status(409).json({ message: 'Delivery service with this trade license already exists' });
//     }

//     let addressId;
//     const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

//     if (addressCheck.rows.length > 0) {
//       addressId = addressCheck.rows[0].address_id;
//     } else {
//       const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
//       addressId = addressInsert.rows[0].address_id;
//     }

//     await pool.query(insertDeliveryService, [companyName, tradeLicense, addressId]);

//     res.status(200).json({ message: 'Delivery Service registered successfully, wait for verification' });
//   } catch (error) {
//     console.error('registerDeliveryService error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// }

// // for admin 
// async function getDeliveryServicesToVerify(req, res) {
//   try {
//     const services = await pool.query(getUnverifiedDeliveryServices);
//     res.status(200).json(services.rows);
//   } catch (error) {
//     console.error('getDeliveryServicesToVerify error:', error);
//     res.status(500).json({ error: 'Failed to fetch unverified delivery companies' });
//   }
// }

// // for admin
// async function verifyDeliveryService(req, res) {
//   const companyId = req.params.id;
//   const { admin_id } = req.body;

//   if (!admin_id) {
//     return res.status(400).json({ error: 'adminId is required to verify delivery service' });
//   }

//   try {
//     await pool.query(verifyDeliveryServiceById, [companyId, admin_id]);
//     res.status(200).json({ message: 'Delivery company verified successfully' });
//   } catch (error) {
//     console.error('verifyDeliveryService error:', error);
//     res.status(500).json({ error: 'Failed to verify delivery company' });
//   }
// }

// async function createDeliveryMan(req, res) {
//   const { company_id, name, phone, email, password, vehicle_type, division, district, ward, area } = req.body;

//   if (!company_id || !name || !phone || !email || !password || !vehicle_type || !division || !district || !ward || !area) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }
//   console.log('createDeliveryMan called with:', { company_id, name, phone, email, password, vehicle_type });

//   try {
//     const deliveryManResult = await pool.query(createDeliveryManQuery, [company_id, name, phone, email, password, vehicle_type]);
//     // res.status(201).json({ message: "DeliveryMan created successfully" });

//     const currentDeliveryManID = deliveryManResult.rows[0].deliveryman_id;
//     console.log(currentDeliveryManID);

//     // We have to create a address and then assigned it to the deliverymanPrefAreaTable 
//     // We need addressId , currentDeliveryManID ,

//     //!create address
//     let addressIdforDeliveryMan;
//     const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

//     if (addressCheck.rows.length > 0) {
//       addressIdforDeliveryMan = addressCheck.rows[0].address_id;
//     } else {
//       const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
//       addressIdforDeliveryMan = addressInsert.rows[0].address_id;
//     }

//     // insert data to the pref area
//     await pool.query(`INSERT INTO deliverymanprefarea (address_id , deliveryman_id) VALUES ($1 , $2)`, [addressIdforDeliveryMan, currentDeliveryManID]);

//     res.status(201).json({
//       message: "DeliveryMan created and preferred area assigned successfully",
//       deliveryman_id: currentDeliveryManID
//     });
//   } catch (error) {
//     console.error('createDeliveryMan error:', error);
//     res.status(500).json({
//       error: 'Failed to create delivery man'
//     });
//   }
// }

// async function showDeliveryManUnderCompanyId(req, res) {
//   const companyId = req.params.company_id;
//   console.log(companyId);
//   try {
//     const result = await pool.query(showDeliveryManUnderCompanyIdQuery, [companyId]);
//     res.status(200).json(result.rows);
//   }
//   catch (error) {
//     console.error('showDeliveryManUnderCompanyId error:', error);
//     res.status(500).json({
//       error: 'Failed to show showDeliveryManUnderCompanyId'
//     });
//   }
// }
// // ...existing code...

// module.exports = {
//   registerDeliveryService,
//   getDeliveryServicesToVerify,
//   verifyDeliveryService,
//   createDeliveryMan,
//   showDeliveryManUnderCompanyId
// };

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
  const { company_id, name, phone, email, password, vehicle_type, division, district, ward, area } = req.body;

  if (!company_id || !name || !phone || !email || !password || !vehicle_type || !division || !district || !ward || !area) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  console.log('createDeliveryMan called with:', { company_id, name, phone, email, password, vehicle_type });

  try {
    const deliveryManResult = await pool.query(createDeliveryManQuery, [company_id, name, phone, email, password, vehicle_type]);
    // res.status(201).json({ message: "DeliveryMan created successfully" });

    const currentDeliveryManID = deliveryManResult.rows[0].deliveryman_id;
    console.log(currentDeliveryManID);

    // We have to create a address and then assigned it to the deliverymanPrefAreaTable 
    // We need addressId , currentDeliveryManID ,

    //!create address
    let addressIdforDeliveryMan;
    const addressCheck = await pool.query(findAddress, [division, district, ward, area]);

    if (addressCheck.rows.length > 0) {
      addressIdforDeliveryMan = addressCheck.rows[0].address_id;
    } else {
      const addressInsert = await pool.query(insertAddress, [division, district, ward, area]);
      addressIdforDeliveryMan = addressInsert.rows[0].address_id;
    }

    // insert data to the pref area
    await pool.query(`INSERT INTO deliverymanprefarea (address_id , deliveryman_id) VALUES ($1 , $2)`, [addressIdforDeliveryMan, currentDeliveryManID]);

    res.status(201).json({
      message: "DeliveryMan created and preferred area assigned successfully",
      deliveryman_id: currentDeliveryManID
    });
  } catch (error) {
    console.error('createDeliveryMan error:', error);
    res.status(500).json({
      error: 'Failed to create delivery man'
    });
  }
}

async function showDeliveryManUnderCompanyId(req, res) {
  const companyId = req.params.company_id;
  console.log(companyId);
  try {
    const result = await pool.query(showDeliveryManUnderCompanyIdQuery, [companyId]);
    res.status(200).json(result.rows);
  }
  catch (error) {
    console.error('showDeliveryManUnderCompanyId error:', error);
    res.status(500).json({
      error: 'Failed to show showDeliveryManUnderCompanyId'
    });
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