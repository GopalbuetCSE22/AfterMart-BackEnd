// const { get } = require("../routes/userRoutes");

const purchasequery = `
  INSERT INTO purchase 
  (product_id, buyer_id, seller_id, delivery_mode, status, total_price, payment_status)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`;
const getPurchaseIdQuery = `
            SELECT purchase_id FROM purchase WHERE product_id = $1`

module.exports = {
    purchasequery,getPurchaseIdQuery
};