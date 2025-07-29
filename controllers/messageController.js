const pool = require('../db/pool');
const {
  getConversationQuery,
  insertConversationQuery,
  getMessagesByConversationIdQuery,
  insertMessageQuery,
  getConversationsByProductAndSellerQuery,
  deleteMessageByIdQuery,
  insertMessageMediaQuery
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

const getMessages = async (req, res) => {
  const conversationId = parseInt(req.params.conversationId);

  if (isNaN(conversationId)) {
    return res.status(400).json({ error: 'Invalid conversation ID' });
  }

  try {
    const result = await pool.query(getMessagesByConversationIdQuery, [conversationId]);
    res.status(200).json(result.rows); // Each row includes media_urls array
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

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

// Send a message (Updated to handle mediaUrl and content NOT NULL constraint)
async function sendMessage(req, res) {
  const { conversationId, senderId, content, mediaUrl } = req.body; // Added mediaUrl

  // Content or mediaUrl must be present
  if (!conversationId || !senderId || (!content?.trim() && !mediaUrl)) {
    return res.status(400).json({ error: 'Missing conversationId, senderId, or message content/media.' });
  }

  try {
    // Determine the content to insert: use trimmed content, or an empty string if content is empty/null but media is present.
    const messageContent = content?.trim() || ''; 
    
    // Insert the message first
    const messageResult = await pool.query(insertMessageQuery, [conversationId, senderId, messageContent]);
    const newMessage = messageResult.rows[0];

    // If mediaUrl is provided, insert it into message_media
    if (mediaUrl) {
      await pool.query(insertMessageMediaQuery, [newMessage.message_id, mediaUrl]);
      // Optionally, you might want to fetch the message again with its media_urls
      // For simplicity, we'll rely on the frontend's polling to get the updated message
    }

    // Return the new message (or a confirmation)
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ error: 'Server error while sending message' });
  }
}

// Function to delete a message
async function deleteMessage(req, res) {
  const messageId = parseInt(req.params.messageId);

  if (isNaN(messageId)) {
    return res.status(400).json({ error: 'Invalid message ID.' });
  }

  try {
    const result = await pool.query(deleteMessageByIdQuery, [messageId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Message not found or already deleted.' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    res.status(500).json({ error: 'Server error while deleting message.' });
  }
}


async function getconversation_id(req, res) {
  const productId = parseInt(req.query.productId);
  const buyerId = parseInt(req.query.buyerId);
  const sellerId = parseInt(req.query.sellerId);
  console.log("Gopal Roy");
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
  getconversation_id,
  deleteMessage
};
