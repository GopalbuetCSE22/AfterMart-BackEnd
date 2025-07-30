const pool = require('../db/pool');
const { buyProductQuery, setBuyeridQuery, getProductByIdQuery } = require('../queries/productBuyingQueries');
const { purchasequery, getPurchaseIdQuery } = require("../queries/purchaseQueries");
const { createShipmentByPurchaseidQuery, getPurchaseStatusQuery } = require("../queries/shipmentQueries");

async function buyProduct(req, res) {
  const { buyerid, productId } = req.params;

  try {
    // 1. Check if the product exists
    const { rows: productRows } = await pool.query(buyProductQuery, [productId]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = productRows[0];

    // 2. Check if the product is available and approved
    if (!product.isavailable) {
      return res.status(400).json({ message: 'Product not available' });
    }
    if (!product.isapproved) {
      return res.status(400).json({ message: 'Product is not approved for purchase' });
    }

    // 3. Check if the buyer exists and is verified
    const { rows: buyerRow } = await pool.query('SELECT * FROM "User" WHERE user_id = $1', [buyerid]);
    if (buyerRow.length === 0) {
      return res.status(404).json({ message: 'Buyer not found' });
    }
    const buyer = buyerRow[0];
    if (!buyer.isverified) {
      return res.status(400).json({ message: 'Buyer is not verified' });
    }

    // 4. Update the product with the buyer's ID
    await pool.query(setBuyeridQuery, [buyerid, productId]);

    // 5. Record the purchase (no shipment yet)
    const result = await pool.query(getProductByIdQuery, [productId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found after update' });
    }
    const productForPurchase = result.rows[0];
    const sellerid = productForPurchase.seller_id;
    const deliveryMode = productForPurchase.delivery_mode;
    const status = "PENDING"; // Updated status
    const totalPrice = productForPurchase.price;
    const payment_status = "Unpaid";

    const purchaseValues = [productId, buyerid, sellerid, deliveryMode, status, totalPrice, payment_status];
    await pool.query(purchasequery, purchaseValues);

    // 6. Get the purchase ID
    const purchaseIdResult = await pool.query(getPurchaseIdQuery, [productId]);
    const purchaseid = purchaseIdResult.rows.length > 0 ? purchaseIdResult.rows[0].purchase_id : null;

    // 7. Update the product's isavailable status to false
    await pool.query('UPDATE product SET isavailable = false WHERE product_id = $1', [productId]);

    // 8. Done — no shipment yet
    res.status(200).json({
      message: 'Product purchased successfully. Awaiting delivery assignment.',
      purchaseid: purchaseid || undefined,
    });

  } catch (error) {
    console.error('buyProduct error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function getProductByIdAgain(req, res) {
  const productId = req.params.id;
  console.log('getProductById called with productId:', productId);
  try {
    const result = await pool.query(getProductByIdQuery, [productId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}
module.exports = {
  buyProduct, getProductByIdAgain
};