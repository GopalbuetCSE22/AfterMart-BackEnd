const getNotificationsForUserQuery = `
  SELECT * FROM notification
  WHERE user_id = $1
  ORDER BY created_at DESC
`;

const markNotificationAsReadQuery = `
  UPDATE notification
  SET is_read = true
  WHERE notification_id = $1
`;

module.exports = {
  getNotificationsForUserQuery,
  markNotificationAsReadQuery,
};
