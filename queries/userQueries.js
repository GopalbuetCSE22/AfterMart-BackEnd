const getUserByEmail = `
  SELECT * FROM "User"
  WHERE email = $1
  LIMIT 1;
`;

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

const insertUser = `
  INSERT INTO "User" (name, email, phone, password, address_id, house_and_road)
  VALUES ($1, $2, $3, $4, $5, $6)
`;

const getUnverifiedUsers = `
  SELECT * FROM "User"
  WHERE isverified = false;
`;

const verifyUserById = `
  UPDATE "User"
  SET isverified = true
  WHERE user_id = $1;
`;

module.exports = {
  getUserByEmail,
  findAddress,
  insertAddress,
  insertUser,
  getUnverifiedUsers,
  verifyUserById,
};
