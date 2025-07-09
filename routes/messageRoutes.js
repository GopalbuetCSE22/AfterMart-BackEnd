const express = require('express');
const router = express.Router();

const {
  startConversation,
  getMessages,
    sendMessage,
    getConversationsByProduct
} = require('../controllers/messageController');

router.post('/start', startConversation);
router.get('/conversations', getConversationsByProduct); 
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);


module.exports = router;
