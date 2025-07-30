const pool = require('../db/pool');

const {
  insertSellerReview,
  updateSellerReviewById,
  getReviewsByUserId,
  getReviewByReviewer,

  insertShipmentReview,
  updateShipmentReviewById,
  getShipmentReviewByReviewer,
} = require('../queries/reviewQueries');

// --- Seller Review ---
exports.createSellerReview = async (req, res) => {
  try {
    const { reviewer_id, reviewee_id, product_id, rating, content } = req.body;
    const result = await insertSellerReview(reviewer_id, reviewee_id, product_id, rating, content);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSellerReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const { rating, content } = req.body;
    const result = await updateSellerReviewById(reviewId, rating, content);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSellerReviewsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await getReviewsByUserId(userId);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSellerReviewByReviewer = async (req, res) => {
  try {
    const { productId, reviewerId } = req.params;
    const result = await getReviewByReviewer(productId, reviewerId);
    res.status(200).json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- Shipment Review ---
exports.addShipmentReview = async (req, res) => {
  try {

    const { shipment_id, rating, review } = req.body;
    console.log('Adding shipment review:', { shipment_id, rating, review });

    const result = await insertShipmentReview(shipment_id, rating, review);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateShipmentReview = async (req, res) => {
  try {
    const shipmentId = req.params.shipmentId;
    const { rating, review } = req.body;
    const result = await updateShipmentReviewById(shipmentId, rating, review);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShipmentReviewByUser = async (req, res) => {
  try {
    const { shipmentId, reviewerId } = req.params;
    const result = await getShipmentReviewByReviewer(shipmentId, reviewerId);
    res.status(200).json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getReviewWhenSeller = async (req, res) => {
  const sellerId = req.params.sellerId;
  // console.log(sellerId);
  
  try {
    // Fetch average rating
    const avgQuery = `
      SELECT ROUND(AVG(rating)::numeric, 2) AS average_rating
      FROM review
      WHERE reviewee_id = $1
    `;
    const avgResult = await pool.query(avgQuery, [sellerId]);
    // console.log(avgResult);
    
    // Fetch all reviews for this user
    const reviewsQuery = `
      SELECT r.review_id, r.rating, r.content, r.created_at,
             u.name AS reviewer_name,
             p.title AS product_name
      FROM review r
      JOIN "User" u ON r.reviewer_id = u.user_id
      LEFT JOIN product p ON r.product_id = p.product_id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
    `;
    const reviewsResult = await pool.query(reviewsQuery, [sellerId]);

    res.json({
      averageRating: avgResult.rows[0].average_rating || 0,
      reviews: reviewsResult.rows
    });
  } catch (err) {
    console.error("Error fetching user reviews:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};