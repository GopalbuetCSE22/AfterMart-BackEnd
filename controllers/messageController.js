const pool = require('../db/pool');
const {
  getConversationQuery,
  insertConversationQuery,
  getMessagesByConversationIdQuery,
  insertMessageQuery,
  getConversationsByProductAndSellerQuery
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
  console.log("Gopal Roy");

  const { conversationId } = req.params;

  try {
    const result = await pool.query(getMessagesByConversationIdQuery, [conversationId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({ error: 'Server error while fetching messages' });
  }
}
async function getConversationsByProduct(req, res) {
  const { productId, sellerId } = req.query;

  if (!productId || !sellerId) {
    return res.status(400).json({ error: 'Missing productId or sellerId' });
  }

  try {
    const result = await pool.query(getConversationsByProductAndSellerQuery, [productId, sellerId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error in getConversationsByProduct:', error);
    return res.status(500).json({ error: 'Server error while fetching conversations' });
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

async function getconversation_id(req, res) {
  const productId = parseInt(req.query.productId);
  const buyerId = parseInt(req.query.buyerId);
  const sellerId = parseInt(req.query.sellerId);
  console.log("Gopal Roy");
  // const { productId, buyerId, sellerId } = req.body;
  // console.log(productId);
  console.log(buyerId);
  console.log(sellerId);
  // Validate that they are valid integers
  if (isNaN(productId) || isNaN(buyerId) || isNaN(sellerId)) {
    return res.status(400).json({ error: "Invalid or missing query parameters." });
  }

  try {
    const query = `
      SELECT * FROM conversation
      WHERE buyer_id = $1 AND seller_id = $2
      LIMIT 1
    `;
    const values = [buyerId, sellerId];
    let result = await pool.query(query, values);
    console.log("Result:", result.rows);

    if (result.rows.length === 0) {
      result = await pool.query('SELECT * FROM conversation WHERE   buyer_id = $1 AND seller_id = $2', [sellerId, buyerId]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching conversation:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  startConversation,
  getMessages,
  sendMessage,
  getConversationsByProduct,
  getconversation_id
};
