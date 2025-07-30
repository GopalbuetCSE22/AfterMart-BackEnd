
const getUnverifiedUsers = `
  SELECT * FROM "User"
  WHERE isverified = false
  ORDER BY created_at DESC;
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
