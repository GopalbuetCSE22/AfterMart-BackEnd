const express = require('express');
const router = express.Router();
const {
  createSellerReview,
  updateSellerReview,
  getSellerReviewsForUser,
  getSellerReviewByReviewer,

  addShipmentReview,
  updateShipmentReview,
  getShipmentReviewByUser,
  getReviewWhenSeller
} = require('../controllers/reviewController');

// Seller review routes
router.post('/seller', createSellerReview);
router.put('/seller/:reviewId', updateSellerReview);
router.get('/seller/user/:userId', getSellerReviewsForUser); // All reviews received by user
router.get('/seller/:productId/:reviewerId', getSellerReviewByReviewer); // Specific buyer review

// Shipment review routes
router.post('/shipment', addShipmentReview);
router.put('/shipment/:shipmentId', updateShipmentReview);
router.get('/shipment/:shipmentId/:reviewerId', getShipmentReviewByUser);


router.get('/fromSellerInfo/:sellerId', getReviewWhenSeller);

module.exports = router;