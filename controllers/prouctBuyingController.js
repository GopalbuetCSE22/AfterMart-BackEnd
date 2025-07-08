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
      return res.status(400).json({ message: 'Insufficient stock' });
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

    // 5. Record the purchase
    const result = await pool.query(getProductByIdQuery, [productId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found after update' });
    }
    const productForPurchase = result.rows[0];
    const sellerid = productForPurchase.seller_id;
    const deliveryMode = productForPurchase.delivery_mode;
    const status = "Under Shipment";
    const totalPrice = productForPurchase.price;
    const payment_status = "Unpaid";
    const purchaseValues = [productId, buyerid, sellerid, deliveryMode, status, totalPrice, payment_status];
    await pool.query(purchasequery, purchaseValues);

    // 6. Get the purchase ID
    const purchaseIdResult = await pool.query(getPurchaseIdQuery, [productId]);
    const purchaseid = purchaseIdResult.rows.length > 0 ? purchaseIdResult.rows[0].purchase_id : null;

    // 7. Create shipment if purchaseid found
    if (purchaseid) {
      // Get status and created_at for shipment
      const purchaseStatusResult = await pool.query(getPurchaseStatusQuery, [purchaseid]);
      if (purchaseStatusResult.rows.length === 0) {
        return res.status(404).json({ message: 'Purchase not found for shipment' });
      }
      const Status = purchaseStatusResult.rows[0].status;
      const created_at = purchaseStatusResult.rows[0].created_at;
      const delivered_at = new Date();
      const shipment_rating = 1; // Default, can be updated later

      await pool.query(createShipmentByPurchaseidQuery, [
        purchaseid,
        Status,
        created_at,
        delivered_at,
        shipment_rating,
      ]);
    }
    // get the shipment ID
    const shipmentIdResult = await pool.query('SELECT shipment_id FROM shipment WHERE purchase_id = $1', [purchaseid]);
    const shipmentId = shipmentIdResult.rows.length > 0 ? shipmentIdResult.rows[0].shipment_id : null;

    // purchase table -> shipment id insert
    if (shipmentId) {
      await pool.query('UPDATE purchase SET shipment_id = $1 WHERE purchase_id = $2', [shipmentId, purchaseid]);
    }

    // update the product's isavailable status to false
    await pool.query('UPDATE product SET isavailable = false WHERE product_id = $1', [productId]);

    //!!!!!!!!!!!!!!!!!
    /*
    // need delivery man assignment in the shipment table
    // buyer id's addressid === deliverymanprefarea.addressid

    // get the address ID of the seller

    // ! buyerid , 
    const buyeridAddressResult = await pool.query('SELECT address_id FROM "User" WHERE user_id = $1', [buyerid]);
    if (buyeridAddressResult.rows.length === 0) {
      return res.status(404).json({ message: 'Buyer address not found' });
    }
    const buyeridAddressID = buyeridAddressResult.rows[0].address_id;

    console.log('Buyer Address ID:', buyeridAddressID);
    
    // get the deliveryman who prefers this address
    const deliveryManResult = await pool.query(
      `SELECT dm.deliveryman_id FROM delivery_man dm JOIN deliverymanprefarea dmpa ON dmpa.deliveryman_id = dm.deliveryman_id
        WHERE dmpa.address_id = $1`, [buyeridAddressID]
    );
    if (deliveryManResult.rows.length === 0) {
      return res.status(404).json({ message: 'No deliveryman found for this address' });
    }
    const deliverymanId = deliveryManResult.rows[0].deliveryman_id;

    console.log('Deliveryman ID:', deliverymanId);
    
    // update the shipment with the deliveryman ID
    await pool.query('UPDATE shipment SET deliveryman_id = $1 WHERE purchase_id = $2', [deliverymanId, purchaseid]);

    */
    // 8. Respond only once
    res.status(200).json({
      message: 'Product purchased, purchase recorded, and shipment created successfully',
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