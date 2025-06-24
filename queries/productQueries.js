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
 SELECT
  p.product_id,
  p.title,
  p.description,
  p.price,
  p.used_for,
  p.category_id,
  p.seller_id,
  p.buyer_id,
  p.isapproved,
  p.approved_by,
  p.isavailable,
  p.showPhoneNumber,
  p.posted_at,
  p.delivery_mode,

  -- Representative image
  COALESCE(img.image, 'default_product_image.jpg') AS product_image,

  -- Seller info
  u.name AS seller_name,

  -- Seller address info
  addr.division,
  addr.district,
  addr.ward,
  addr.area,

  -- Relevance score for ranking
  ts_rank(
    to_tsvector('english', p.title || ' ' || p.description || ' ' || c.name),
    plainto_tsquery('english', $1)
  ) AS rank,

  -- Proximity level
  CASE
    WHEN ua.area IS NOT NULL AND addr.area = ua.area THEN 1
    WHEN ua.ward IS NOT NULL AND addr.ward = ua.ward THEN 2
    WHEN ua.district IS NOT NULL AND addr.district = ua.district THEN 3
    WHEN ua.division IS NOT NULL AND addr.division = ua.division THEN 4
    ELSE 5
  END AS distance_level

FROM product p

-- Seller info
JOIN "User" u ON u.user_id = p.seller_id

-- Seller address
JOIN address addr ON u.address_id = addr.address_id

-- Category
JOIN productcategory c ON p.category_id = c.category_id

-- Optional user's address for proximity
LEFT JOIN "User" u2 ON u2.user_id = $2
LEFT JOIN address ua ON u2.address_id = ua.address_id

-- Get one image per product
LEFT JOIN LATERAL (
  SELECT pm.image
  FROM product_media pm
  WHERE pm.product_id = p.product_id
  LIMIT 1
) AS img ON true

WHERE
  to_tsvector('english', p.title || ' ' || p.description || ' ' || c.name)
    @@ plainto_tsquery('english', $1)
  AND ($3::text IS NULL OR c.name ILIKE $3)
  AND p.price BETWEEN $4 AND $5
  AND ($6::text IS NULL OR p.used_for = $6)
  AND ($7::text IS NULL OR addr.division ILIKE $7)
  AND ($8::text IS NULL OR addr.district ILIKE $8)
  AND ($9::text IS NULL OR addr.ward ILIKE $9)
  AND ($10::text IS NULL OR addr.area ILIKE $10)
  AND p.isapproved = TRUE
  AND p.isavailable = TRUE

ORDER BY
  distance_level,
  rank DESC,
  p.posted_at DESC;

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


const showProductsToAppoveQuery = `
  SELECT * FROM product WHERE isapproved = FALSE;
`
const verfyProductQuery = `
  UPDATE product SET isapproved = TRUE WHERE product_id = $1;
`
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
  showProductsToAppoveQuery,
  verfyProductQuery
};
