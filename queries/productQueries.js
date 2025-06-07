//order by ta chnage kora lagte pare


const getAllProductsQuery = `
  SELECT * FROM product
  WHERE isapproved = TRUE AND isavailable = TRUE
  ORDER BY created_at DESC;
`;

const getProductByIdQuery = `
  SELECT * FROM product
  WHERE product_id = $1 AND isapproved = TRUE AND isavailable = TRUE;
`;

const getProductsByCategoryQuery = `
  SELECT * FROM product
  WHERE category_id = $1 AND isapproved = TRUE AND isavailable= TRUE
  ORDER BY created_at DESC;
`;

const searchProductsQuery = `
  SELECT * FROM product
  WHERE (title ILIKE $1 OR description ILIKE $1) AND isapproved = TRUE AND isavailable= TRUE
  ORDER BY created_at DESC;
`;

const getRecentProductsQuery = `
  SELECT * FROM product
  WHERE isapproved = TRUE AND isavailable= TRUE
  ORDER BY created_at DESC
  LIMIT 10;
`;

const getWishlistProductsQuery = `
  SELECT p.*
  FROM wishlist_product wp
  JOIN product p ON wp.product_id = p.product_id
  WHERE wp.user_id = $1;
`;

const addProductQuery = `
  INSERT INTO product (title, description, price, used_for, category_id, seller_id, delivery_mode)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING product_id;
`;


const getOwnProductsQuery = `
  SELECT * FROM product
  WHERE user_id = $1
  ORDER BY created_at DESC;
`;

const updateProductQuery = `
  UPDATE product
  SET title = $1,
      description = $2,
      price = $3,
      used_for = $4,
      category_id = $5,
      delivery_mode = $6
  WHERE product_id = $7 AND user_id = $8;
`;


const deleteProductQuery = `
  DELETE FROM product
  WHERE product_id = $1 AND user_id = $2;
`;

const addToWishlistQuery = `
  INSERT INTO wishlist_product (user_id, product_id)
  VALUES ($1, $2) ON CONFLICT DO NOTHING;
`;

const removeFromWishlistQuery = `
  DELETE FROM wishlist_product
  WHERE user_id = $1 AND product_id = $2;
`;

module.exports = {
  getAllProductsQuery,
  getProductByIdQuery,
  getProductsByCategoryQuery,
  searchProductsQuery,
  getRecentProductsQuery,
  getWishlistProductsQuery,
  addProductQuery,
  getOwnProductsQuery,
  updateProductQuery,
  deleteProductQuery,
  addToWishlistQuery,
  removeFromWishlistQuery,
};
