const findAddress = `
  SELECT address_id FROM address
  WHERE division = $1 AND district = $2 AND ward = $3 AND area = $4
  LIMIT 1;
`;

const insertAddress = `
  INSERT INTO address (division, district, ward, area)
  VALUES ($1, $2, $3, $4)
  RETURNING address_id;
`;

const insertDeliveryService = `
  INSERT INTO delivery_service (company_name, trade_license, company_address)
  VALUES ($1, $2, $3);
`;

const getUnverifiedDeliveryServices = `
  SELECT * FROM delivery_service
  WHERE isverified = false;
`;

const verifyDeliveryServiceById = `
  UPDATE delivery_service
  SET isverified = true,
      verified_by = $2
  WHERE company_id = $1;
`;

const getDeliveryServiceByCompanyAndTrade = `
  SELECT * FROM delivery_service
  WHERE company_name = $1 AND trade_license = $2;
`;

const createDeliveryManQuery = `
  INSERT INTO delivery_man (company_id, name, phone, email, password, vehicle_type)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING deliveryman_id;`

// const showDeliveryManUnderCompanyIdQuery = `SELECT * FROM delivery_man WHERE company_id = $1`;

const showDeliveryManUnderCompanyIdQuery = `SELECT * FROM delivery_man d 
LEFT OUTER JOIN deliverymanprefarea df on df.deliveryman_id = d.deliveryman_id 
LEFT OUTER JOIN address A on A.address_id = df.address_id 
WHERE d.company_id = $1`

module.exports = {
  findAddress,
  insertAddress,
  insertDeliveryService,
  getUnverifiedDeliveryServices,
  verifyDeliveryServiceById,
  getDeliveryServiceByCompanyAndTrade,
  createDeliveryManQuery,
  showDeliveryManUnderCompanyIdQuery
};
