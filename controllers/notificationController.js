const pool = require('../db/pool');
const {
  getNotificationsForUserQuery,
  markNotificationAsReadQuery,
} = require('../queries/notificationQueries');

// Get all notifications for a user
async function getNotificationsForUser(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const result = await pool.query(getNotificationsForUserQuery, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

// Mark a notification as read
async function markNotificationAsRead(req, res) {
  const { notificationId } = req.params;

  if (!notificationId) {
    return res.status(400).json({ error: 'Notification ID is required' });
  }

  try {
    await pool.query(markNotificationAsReadQuery, [notificationId]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification status' });
  }
}

module.exports = {
  getNotificationsForUser,
  markNotificationAsRead,
};
