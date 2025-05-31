
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
  getUnverifiedUsers,
  verifyUserById,
};
