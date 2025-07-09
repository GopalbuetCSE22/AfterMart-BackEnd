const getConversationQuery = `
  SELECT conversation_id FROM conversation
  WHERE product_id = $1 AND buyer_id = $2 AND seller_id = $3
`;

const insertConversationQuery = `
  INSERT INTO conversation (product_id, buyer_id, seller_id)
  VALUES ($1, $2, $3)
  RETURNING conversation_id
`;

const getMessagesByConversationIdQuery = `
  SELECT * FROM message
  WHERE conversation_id = $1
  ORDER BY sent_at ASC
`;

const insertMessageQuery = `
  INSERT INTO message (conversation_id, sender_id, content)
  VALUES ($1, $2, $3)
  RETURNING *
`;
const getConversationsByProductAndSellerQuery = `
  SELECT
    c.conversation_id,
    c.buyer_id,
    u.name AS buyer_name,
    u.email AS buyer_email
  FROM conversation c
  JOIN "User" u ON c.buyer_id = u.user_id
  -- NEW: Join with the message table
  JOIN message m ON c.conversation_id = m.conversation_id
  WHERE c.product_id = $1 AND c.seller_id = $2
  GROUP BY c.conversation_id, c.buyer_id, u.name, u.email -- Group by all selected non-aggregated columns
  ORDER BY MAX(m.sent_at) DESC, c.conversation_id DESC -- Order by last message sent, then conversation ID
`;

module.exports = {
  getConversationQuery,
  insertConversationQuery,
  getMessagesByConversationIdQuery,
    insertMessageQuery,
    getConversationsByProductAndSellerQuery
};
