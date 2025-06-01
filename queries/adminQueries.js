
const getUnverifiedUsers = `
  SELECT * FROM "users"
  WHERE isverified = false;
`;

const verifyUserById = `
  UPDATE "users"
  SET isverified = true
  WHERE user_id = $1;
`;

module.exports = {
  getUnverifiedUsers,
  verifyUserById,
};
