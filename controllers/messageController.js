const pool = require('../db/pool');
const {
  getConversationQuery,
  insertConversationQuery,
  getMessagesByConversationIdQuery,
  insertMessageQuery
} = require('../queries/messageQueries');

// Start or get existing conversation
async function startConversation(req, res) {
  const { productId, buyerId, sellerId } = req.body;

  if (!productId || !buyerId || !sellerId) {
    return res.status(400).json({ error: 'Missing productId, buyerId or sellerId' });
  }

  try {
    const result = await pool.query(getConversationQuery, [productId, buyerId, sellerId]);

    if (result.rows.length > 0) {
      return res.status(200).json({ conversationId: result.rows[0].conversation_id });
    }

    const insertRes = await pool.query(insertConversationQuery, [productId, buyerId, sellerId]);
    return res.status(201).json({ conversationId: insertRes.rows[0].conversation_id });

  } catch (error) {
    console.error('Error in startConversation:', error);
    return res.status(500).json({ error: 'Server error while starting conversation' });
  }
}

// Get all messages in a conversation
async function getMessages(req, res) {
  const { conversationId } = req.params;

  try {
    const result = await pool.query(getMessagesByConversationIdQuery, [conversationId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({ error: 'Server error while fetching messages' });
  }
}

// Send a message
async function sendMessage(req, res) {
  const { conversationId, senderId, content } = req.body;

  if (!conversationId || !senderId || !content?.trim()) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(insertMessageQuery, [conversationId, senderId, content.trim()]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({ error: 'Server error while sending message' });
  }
}

module.exports = {
  startConversation,
  getMessages,
  sendMessage
};
