// controllers/productController.js
const pool = require('../db/pool');
const {
  addProductQuery,
  getOwnProductsQuery,
  getAllProductsQuery,
  getProductByIdQuery,
  updateProductQuery,
  deleteProductQuery,
  getProductsByCategoryQuery,
  searchProductsQuery,
  getRecentProductsQuery,
  getWishlistProductsQuery,
  addToWishlistQuery,
  removeFromWishlistQuery
} = require('../queries/productQueries');

async function addProduct(req, res) {
    const { title, description, price, usedFor, categoryId, sellerId, deliveryMode } = req.body;
  
    if (!title || !description || !price || !usedFor || !categoryId || !sellerId || !deliveryMode) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      const result = await pool.query(addProductQuery, [
        title,
        description,
        price,
        usedFor,
        categoryId,
        sellerId,
        deliveryMode
      ]);
  
      res.status(201).json({ message: 'Product added successfully', productId: result.rows[0].product_id });
    } catch (error) {
      console.error('addProduct error:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  }


async function getOwnProducts(req, res) {
  const sellerId = req.query.seller_id;
  try {
    const result = await pool.query(getOwnProductsQuery, [sellerId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getOwnProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch own products' });
  }
}
async function getAllProducts(req, res) {
    try {
        const result = await pool.query(getAllProductsQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('getAllProducts error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}
async function getProductById(req, res) {
  const productId = req.params.id;
  try {
    const result = await pool.query(getProductByIdQuery, [productId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

async function updateProduct(req, res) {
    const productId = req.params.id;
    const { title, description, price, usedFor, categoryId, deliveryMode, sellerId } = req.body;
  
    if (!title || !description || !price || !usedFor || !categoryId || !deliveryMode || !sellerId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      await pool.query(updateProductQuery, [
        title,
        description,
        price,
        usedFor,
        categoryId,
        deliveryMode,
        productId,
        sellerId
      ]);
  
      res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
      console.error('updateProduct error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
  

async function deleteProduct(req, res) {
  const productId = req.params.id;
  try {
    await pool.query(deleteProductQuery, [productId]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

async function searchProducts(req, res) {
  const searchTerm = req.query.q || '';
  try {
    const result = await pool.query(searchProductsQuery, [`%${searchTerm}%`]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('searchProducts error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
}

async function getRecentProducts(req, res) {
  try {
    const result = await pool.query(getRecentProductsQuery);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getRecentProducts error:', error);
    res.status(500).json({ error: 'Failed to fetch recent products' });
  }
}

async function getProductsByCategory(req, res) {
  const categoryId = req.params.categoryId;
  try {
    const result = await pool.query(getProductsByCategoryQuery, [categoryId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getProductsByCategory error:', error);
    res.status(500).json({ error: 'Failed to fetch category products' });
  }
}

async function getWishlist(req, res) {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });
  try {
    const result = await pool.query(getWishlistProductsQuery, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('getWishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
}

async function addToWishlist(req, res) {
  const productId = req.params.id;
  const { userId } = req.body;
  try {
    await pool.query(addToWishlistQuery, [userId, productId]);
    res.status(200).json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error('addToWishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
}

async function removeFromWishlist(req, res) {
  const productId = req.params.id;
  const { userId } = req.body;
  try {
    await pool.query(removeFromWishlistQuery, [userId, productId]);
    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
}

module.exports = {
  addProduct,
  getOwnProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getRecentProducts,
  getProductsByCategory,
  getWishlist,
  addToWishlist,
    removeFromWishlist,
    getAllProducts
};
