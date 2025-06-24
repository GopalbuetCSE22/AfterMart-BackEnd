const getAllProductsQuery = `
  SELECT * FROM product
  WHERE isapproved = TRUE AND isavailable = TRUE
  ORDER BY posted_at DESC;
`;

const getProductByIdQuery = `
  SELECT * FROM product
  WHERE product_id = $1 AND isapproved = TRUE AND isavailable = TRUE;
`;

const getProductsByCategoryQuery = `
  SELECT * FROM product
  WHERE category_id = $1 AND isapproved = TRUE AND isavailable= TRUE
  ORDER BY posted_at DESC;
`;

const searchProductsQuery = `
  SELECT * FROM product
  WHERE (title ILIKE $1 OR description ILIKE $1) AND isapproved = TRUE AND isavailable= TRUE
  ORDER BY posted_at DESC;
`;

const searchProductsAdvancedQuery = `
  WITH user_address AS (
    SELECT * FROM address
    WHERE user_id = $2
    LIMIT 1
  )
  SELECT p.*, a.*, c.name AS category_name,
    CASE
      WHEN a.area = ua.area THEN 1
      WHEN a.ward = ua.ward THEN 2
      WHEN a.district = ua.district THEN 3
      WHEN a.division = ua.division THEN 4
      ELSE 5
    END AS distance_level
  FROM product p
  JOIN address a ON p.seller_id = a.user_id
  JOIN user_address ua ON true
  JOIN product_category c ON p.category_id = c.category_id
  WHERE
    (p.title ILIKE $1 OR p.description ILIKE $1 OR c.name ILIKE $1)
    AND ($3::text IS NULL OR c.name ILIKE $3)
    AND p.price BETWEEN $4 AND $5
    AND ($6::text IS NULL OR p.used_for = $6)
    AND ($7::text IS NULL OR a.division ILIKE $7)
    AND ($8::text IS NULL OR a.district ILIKE $8)
    AND ($9::text IS NULL OR a.ward ILIKE $9)
    AND ($10::text IS NULL OR a.area ILIKE $10)
    AND p.isapproved = TRUE AND p.isavailable = TRUE
  ORDER BY distance_level, p.created_at DESC;
`;

const getRecentProductsQuery = `
  SELECT * FROM product
  WHERE isapproved = TRUE AND isavailable= TRUE
  ORDER BY posted_at DESC
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
  WHERE seller_id = $1
  ORDER BY posted_at DESC;
`;

const updateProductQuery = `
  UPDATE product
  SET
    title = COALESCE($1, title),
    description = COALESCE($2, description),
    price = COALESCE($3, price),
    used_for = COALESCE($4, used_for),
    category_id = COALESCE($5, category_id),
    delivery_mode = COALESCE($6, delivery_mode)
  WHERE product_id = $7 AND seller_id = $8;
`;


const deleteProductQuery = `
  DELETE FROM product
  WHERE product_id = $1 AND seller_id = $2;
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
  searchProductsAdvancedQuery,
  getRecentProductsQuery,
  getWishlistProductsQuery,
  addProductQuery,
  getOwnProductsQuery,
  updateProductQuery,
  deleteProductQuery,
  addToWishlistQuery,
  removeFromWishlistQuery,
};
