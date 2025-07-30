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
  INSERT INTO delivery_service (company_name, trade_license, company_address, password)
  VALUES ($1, $2, $3, $4);
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

const showDeliveryManUnderCompanyIdQuery = `
  SELECT
    dm.deliveryman_id,
    dm.name,
    dm.phone,
    dm.email,
    dm.vehicle_type,
    -- Aggregate preferred areas into an array for each deliveryman
    COALESCE(ARRAY_AGG(DISTINCT a.area) FILTER (WHERE a.area IS NOT NULL), '{}') AS areas,
    -- If you want to show division/district/ward from one of the preferred addresses,
    -- you might need to pick one or also aggregate. For simplicity, we'll assume
    -- division/district/ward are consistent for a deliveryman's preferred areas.
    -- If they can have different division/district/ward for different preferred areas,
    -- you'd need to decide how to represent that (e.g., ARRAY_AGG(DISTINCT a.division)).
    -- For now, we'll pick the first available division/district/ward from a preferred area.
    (SELECT a2.division FROM address a2 JOIN deliverymanprefarea dmpa2 ON a2.address_id = dmpa2.address_id WHERE dmpa2.deliveryman_id = dm.deliveryman_id LIMIT 1) AS division,
    (SELECT a2.district FROM address a2 JOIN deliverymanprefarea dmpa2 ON a2.address_id = dmpa2.address_id WHERE dmpa2.deliveryman_id = dm.deliveryman_id LIMIT 1) AS district,
    (SELECT a2.ward FROM address a2 JOIN deliverymanprefarea dmpa2 ON a2.address_id = dmpa2.address_id WHERE dmpa2.deliveryman_id = dm.deliveryman_id LIMIT 1) AS ward
  FROM
    delivery_man dm
  LEFT JOIN
    deliverymanprefarea dmpa ON dm.deliveryman_id = dmpa.deliveryman_id
  LEFT JOIN
    address a ON dmpa.address_id = a.address_id
  WHERE
    dm.company_id = $1
  GROUP BY
    dm.deliveryman_id
  ORDER BY
    dm.name;
`;

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
