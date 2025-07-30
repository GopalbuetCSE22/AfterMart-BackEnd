const pool = require('../db/pool');

// --- Seller Review Queries ---
exports.insertSellerReview = (reviewer_id, reviewee_id, product_id, rating, content) => {
  return pool.query(
    `INSERT INTO review (reviewer_id, reviewee_id, product_id, rating, content)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [reviewer_id, reviewee_id, product_id, rating, content]
  );
};

exports.updateSellerReviewById = (review_id, rating, content) => {
  return pool.query(
    `UPDATE review SET rating = $1, content = $2 WHERE review_id = $3 RETURNING *`,
    [rating, content, review_id]
  );
};

exports.getReviewsByUserId = (userId) => {
  return pool.query(
    `SELECT r.*, u.name as reviewer_name
     FROM review r
     JOIN "User" u ON r.reviewer_id = u.user_id
     WHERE r.reviewee_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
};

exports.getReviewByReviewer = (productId, reviewerId) => {
  return pool.query(
    `SELECT * FROM review WHERE product_id = $1 AND reviewer_id = $2`,
    [productId, reviewerId]
  );
};

// --- Shipment Review Queries ---
exports.insertShipmentReview = (shipmentId, rating, review) => {
  return pool.query(
    `UPDATE shipment SET shipment_rating = $1, shipment_review = $2
     WHERE shipment_id = $3 RETURNING *`,
    [rating, review, shipmentId]
  );
};

exports.updateShipmentReviewById = (shipmentId, rating, review) => {
  return pool.query(
    `UPDATE shipment SET shipment_rating = $1, shipment_review = $2
     WHERE shipment_id = $3 RETURNING *`,
    [rating, review, shipmentId]
  );
};

exports.getShipmentReviewByReviewer = (shipmentId, reviewerId) => {
  return pool.query(
    `SELECT s.shipment_rating, s.shipment_review
     FROM shipment s
     JOIN purchase p ON s.purchase_id = p.purchase_id
     WHERE s.shipment_id = $1 AND p.buyer_id = $2`,
    [shipmentId, reviewerId]
  );
};
