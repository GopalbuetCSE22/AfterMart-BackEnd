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
