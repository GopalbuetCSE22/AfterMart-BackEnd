const express = require('express');
const router = express.Router();

const {
  addProduct,
  getOwnProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getRecentProducts,
  getProductsByCategory,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getAllProducts,
  getProductImages
} = require('../controllers/productController');

// Add a new product
router.post('/', addProduct);
router.get('/', getAllProducts);
router.get('/images/all/:id', getProductImages);

// Get logged-in user's own products
router.get('/mine', getOwnProducts);

// Get a single product by ID
router.get('/:id', getProductById);

// Update a product
router.patch('/:id', updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

//  Search and filter products
router.get('/search/all', searchProducts);

// Get recent products
router.get('/recent/all', getRecentProducts);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);

// Wishlist endpoints
router.post('/:id/wishlist', addToWishlist);
router.delete('/:id/wishlist', removeFromWishlist);
router.get('/wishlist/all', getWishlist);

module.exports = router;
