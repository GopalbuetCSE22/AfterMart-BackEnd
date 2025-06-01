
const getUserByEmail = `
  SELECT * FROM "users" WHERE email = $1;
`;

const getAdminByEmail = `
  SELECT * FROM admin WHERE email = $1;
`;

const getDeliveryByCompanyNameAndTradeLicense = `
  SELECT * FROM delivery_service WHERE company_name = $1 AND trade_license = $2;
`;

module.exports = {
  getUserByEmail,
  getAdminByEmail,
  getDeliveryByCompanyNameAndTradeLicense,
};
