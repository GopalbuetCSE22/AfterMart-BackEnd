// query to check the availability of a product 
const buyProductQuery = `SELECT * FROM product WHERE product_id = $1`;

const setBuyeridQuery = `UPDATE product SET buyer_id = $1 WHERE product_id = $2`;

const getProductByIdQuery = `
  SELECT * FROM product
  WHERE product_id = $1 AND isapproved = TRUE AND isavailable = TRUE;
`;

module.exports = {
  buyProductQuery,
  setBuyeridQuery,
  getProductByIdQuery
};
