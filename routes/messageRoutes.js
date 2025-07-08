const express = require('express');
const router = express.Router();

const {
  startConversation,
  getMessages,
  sendMessage
} = require('../controllers/messageController');

router.post('/start', startConversation);
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);

module.exports = router;
