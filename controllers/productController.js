const pool = require('../db/pool');
const {
  addProductQuery,
  getOwnProductsQuery,
  getAllProductsQuery,
  getProductByIdQuery,
  updateProductQuery,
  deleteProductQuery,
  getProductsByCategoryQuery,
  getRecentProductsQuery,
  getWishlistProductsQuery,
  addToWishlistQuery,
  removeFromWishlistQuery,
  searchProductsAdvancedQuery,
  showProductsToAppoveQuery,
  verfyProductQuery
} = require('../queries/productQueries');

async function addProduct(req, res) {
  console.log('adding a new product');
  const { title, description, price, usedFor, categoryId, sellerId, deliveryMode } = req.body;
  if (!title || !description || !price || !usedFor || !categoryId || !sellerId || !deliveryMode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(addProductQuery, [
      title, description, price, usedFor, categoryId, sellerId, deliveryMode
    ]);
    res.status(201).json({ message: 'Product added successfully', productId: result.rows[0].product_id });
  } catch (error) {
    console.error('addProduct error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
}

async function getOwnProducts(req, res) {
  const sellerId = req.query.seller_id;
  if (!sellerId) return res.status(400).json({ error: 'user ID is required' });

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
  const {
    title,
    description,
    price,
    usedFor,
    categoryId,
    deliveryMode,
    sellerId,
  } = req.body;

  if (!sellerId) {
    return res.status(400).json({ error: 'Seller ID is required' });
  }

  try {
    const result = await pool.query(updateProductQuery, [
      title,
      description,
      price,
      usedFor,
      categoryId,
      deliveryMode,
      productId,
      sellerId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or seller mismatch' });
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('updateProduct error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}



async function deleteProduct(req, res) {
  const productId = req.params.id;
  const userId = req.body.sellerId;
  try {
    //await pool.query(deleteProductQuery, [productId, userId]);
    //we will see how many row are deleted
    const result = await pool.query(deleteProductQuery, [productId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or user mismatch' });
    }
    // If no rows were deleted, it means the product was not found or the user is not the seller
    // If the product was deleted successfully, return a success message
    console.log('deleteProduct result:', result);
    

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

async function searchProducts(req, res) {
  const {
    q = '',
    userId = null,
    category,
    minPrice,
    maxPrice,
    usedFor,
    division,
    district,
    ward,
    area
  } = req.query;

  try {
    const result = await pool.query(searchProductsAdvancedQuery, [
      `%${q}%`,               // $1: search keyword
      userId,                 // $2: userId for proximity
      category || null,       // $3
      minPrice || 0,          // $4
      maxPrice || 10000000,   // $5
      usedFor || null,        // $6
      division || null,       // $7
      district || null,       // $8
      ward || null,           // $9
      area || null            // $10
    ]);

    res.status(200).json({
      proximityUsed: result.rows.some(r => r.distance_level !== null && r.distance_level < 5),
      products: result.rows
    });
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

async function showProductsToAppove(req,res) {
  // the products that are not verified 
  try {
    const result = await pool.query(showProductsToAppoveQuery);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('showProductsToAppove error:', error);
    res.status(500).json({ error: 'Failed to fetch showProductsToAppove' });
  }
}

async function verifyProduct(req,res){
  const productId = req.params.productid;
  try {
    await pool.query(verfyProductQuery , [productId]);
    res.status(200).json({ message: 'Product verified successfully' }); // <-- add this
  } catch (error) {
    console.error('verifyProduct error:', error);
    res.status(500).json({ error: 'Failed to verifyProduct' });
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
  getAllProducts,
  showProductsToAppove,
  verifyProduct
};