const express = require('express');
const { buyProduct, getProductByIdAgain } = require('../controllers/prouctBuyingController');
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
    showProductsToAppove,
    verifyProduct,
    getProductImages,
    getBroughtProducts
} = require('../controllers/productController');
const { route } = require('./userRoutes');

const router = express.Router();
// Get product images
router.get('/:id/images', getProductImages);


// set the buyerid when the product is purchased 
router.patch('/buyProduct/:buyerid/:productId', buyProduct);

router.get('/showProductsToApprove', showProductsToAppove);

router.patch('/verifyProduct/:productid', verifyProduct);

// Add a new product
router.post('/', addProduct);
router.get('/', getAllProducts);

//!!!!
// Get logged-in user's own products
router.get('/mine', getOwnProducts);


// Get a single product by ID
router.get('/:id', getProductById);

// Update a product
router.patch('/:id', updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

// Search/filter products
router.get('/search/all', searchProducts);

// Get recent products
router.get('/recent/all', getRecentProducts);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);

// Wishlist endpoints
router.post('/:id/wishlist', addToWishlist);
router.delete('/:id/wishlist', removeFromWishlist);
router.get('/wishlist/all', getWishlist);
// Get a single product by ID

//!!
// http://localhost:5000/api/product/boughtProducts/${userId}
router.get("/boughtProducts/:userId", getBroughtProducts);

module.exports = router;