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
      //from the shipment id we will find the deliveryman id and then update the deliveryman average rating by coutning number of rating of the delivary man with the total rating
    if (result.rows.length === 0) {
        return res.status(404).json({
            error: 'Shipment not found or already reviewed'
        });
      }
      //console.log('Shipment review added:', result.rows[0]);
      // Update the deliveryman's average rating
      const deliverymanId = result.rows[0].deliveryman_id;
      await updateDeliverymanRating(deliverymanId);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const updateDeliverymanRating = async (deliverymanId) => {
  try {
    const avgRatingQuery = `
      SELECT AVG(shipment_rating) AS average_rating
      FROM shipment
      WHERE deliveryman_id = $1 AND shipment_rating IS NOT NULL
    `;

    const avgResult = await pool.query(avgRatingQuery, [deliverymanId]);

    if (avgResult.rows.length > 0) {
      const averageRating = avgResult.rows[0].average_rating || 0;

      await pool.query(
        'UPDATE delivery_man SET rating_avg = $1 WHERE deliveryman_id = $2',
        [averageRating, deliverymanId]
      );
    }
  } catch (err) {
    console.error("Error updating deliveryman rating:", err);
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