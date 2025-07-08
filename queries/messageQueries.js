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
  SELECT message_id, sender_id, content, sent_at
  FROM message
  WHERE conversation_id = $1
  ORDER BY sent_at ASC
`;

const insertMessageQuery = `
  INSERT INTO message (conversation_id, sender_id, content)
  VALUES ($1, $2, $3)
  RETURNING message_id, sender_id, content, sent_at
`;

module.exports = {
  getConversationQuery,
  insertConversationQuery,
  getMessagesByConversationIdQuery,
  insertMessageQuery
};
