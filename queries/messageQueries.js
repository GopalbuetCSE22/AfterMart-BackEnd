const getConversationQuery = `
  SELECT conversation_id FROM conversation
  WHERE product_id = $1 AND buyer_id = $2 AND seller_id = $3;
`;

const insertConversationQuery = `
  INSERT INTO conversation (product_id, buyer_id, seller_id)
  VALUES ($1, $2, $3)
  RETURNING conversation_id;
`;

const getMessagesByConversationIdQuery = `
  SELECT
    m.*,
    COALESCE(json_agg(mm.media_url) FILTER (WHERE mm.media_url IS NOT NULL), '[]') AS media_urls
  FROM message m
  LEFT JOIN message_media mm ON m.message_id = mm.message_id
  WHERE m.conversation_id = $1
  GROUP BY m.message_id
  ORDER BY m.sent_at ASC;
`;

const insertMessageQuery = `
  INSERT INTO message (conversation_id, sender_id, content)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const insertMessageMediaQuery = `
  INSERT INTO message_media (message_id, media_url)
  VALUES ($1, $2);
`;

const getConversationsByProductAndSellerQuery = `
  SELECT
    c.conversation_id,
    c.buyer_id,
    u.name AS buyer_name,
    u.email AS buyer_email
  FROM conversation c
  JOIN "User" u ON c.buyer_id = u.user_id
  JOIN message m ON c.conversation_id = m.conversation_id
  WHERE c.product_id = $1 AND c.seller_id = $2
  GROUP BY c.conversation_id, c.buyer_id, u.name, u.email
  ORDER BY MAX(m.sent_at) DESC, c.conversation_id DESC;
`;

const getMessageMediaQuery = `
  SELECT media_id, media_url, uploaded_at
  FROM message_media
  WHERE message_id = $1
  ORDER BY uploaded_at ASC;
`;

const deleteMessageByIdQuery = `
  DELETE FROM message
  WHERE message_id = $1;
`;

module.exports = {
  getConversationQuery,
  insertConversationQuery,
  getMessagesByConversationIdQuery,
  insertMessageQuery,
  getConversationsByProductAndSellerQuery,
  insertMessageMediaQuery,
  getMessageMediaQuery,
  deleteMessageByIdQuery
};
