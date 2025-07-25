
const getUserByEmail = `
  SELECT * FROM "User" WHERE email = $1;
`;

const getAdminByEmail = `
  SELECT * FROM admin WHERE email = $1;
`;

const getDeliveryByCompanyName = `
  SELECT * FROM delivery_service WHERE company_name = $1;
`;

const getDeliveryByCompanyNameAndTradeLicense = `
  SELECT * FROM delivery_service WHERE company_name = $1 AND trade_license = $2 AND isverified = TRUE;
`;
const getDeliveryManByEmail = `SELECT * FROM delivery_man WHERE email = $1`

module.exports = {
  getUserByEmail,
  getAdminByEmail,
  getDeliveryByCompanyNameAndTradeLicense,
  getDeliveryManByEmail,
  getDeliveryByCompanyName
};
