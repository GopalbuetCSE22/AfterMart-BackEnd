const express = require('express');
const router = express.Router();

const {
  getNotificationsForUser,
  markNotificationAsRead,
} = require('../controllers/notificationController');

// GET all notifications for a user
// /notifications/user/${userId}
router.get('/:userId', getNotificationsForUser);

// PATCH to mark a notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

module.exports = router;
