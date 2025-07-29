const express = require('express');
const router = express.Router();

const {
  startConversation,
  getMessages,
    sendMessage,
    getConversationsByProduct,
    getconversation_id
} = require('../controllers/messageController');

router.post('/start', startConversation);
router.get('/conversations', getConversationsByProduct); 
router.get('/:conversationId', getMessages);
router.post('/send', sendMessage);

router.get('/getid/conversation_id', getconversation_id);


module.exports = router;
