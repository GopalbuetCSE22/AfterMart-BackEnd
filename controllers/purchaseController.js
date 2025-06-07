const pool = require('../db/pool');
const { purchasequery, getPurchaseIdQuery } = require("../queries/purchaseQueries");
const { getProductByIdQuery } = require("../queries/productBuyingQueries");

const purchaseController = async (req, res) => {
    // const { productId, buyerid, sellerid, deliveryMode, status, totalPrice, payment_status } = req.params;
    const { productId, buyerid } = req.params;
    let sellerid, deliveryMode, status, totalPrice, payment_status;
    console.log('purchaseController called with:', { productId, buyerid });
    try {
        const result = await pool.query(getProductByIdQuery, [productId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = result.rows[0];
        console.log(product);

        sellerid = product.seller_id; // Assuming seller_id is part of the product details
        deliveryMode = product.delivery_mode; // Default delivery mode
        status = "Under Shipment"; // Default status
        totalPrice = product.price; // Assuming price is part of the product details
        payment_status = "Unpaid"; // Default payment status
    } catch (error) {
        console.error('Error fetching product details:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    // console.log('purchaseController called with:', { productId, buyerid, sellerid, deliveryMode, status, totalPrice, payment_status });
    try {
        // Insert the purchase details into the database
        const values = [productId, buyerid, sellerid, deliveryMode, status, totalPrice, payment_status];

        await pool.query(purchasequery, values);

        res.status(201).json({ message: 'Purchase recorded successfully' });
    } catch (error) {
        console.error('Error recording purchase:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getPurchaseId = async (req, res) => {
    const { productId } = req.params;
    console.log('getPurchaseId called with productId:', productId);
    try {

        const values = [productId];

        const result = await pool.query(getPurchaseIdQuery, values);
        console.log('getPurchaseId result:', result.rows);

        // ! get the purchase id for creating a new shipment 
        console.log(result.rows[0].purchase_id);

        if (result.rows.length > 0) {
            res.status(200).json({ purchaseId: result.rows[0].id });
        } else {
            res.status(404).json({ error: 'Purchase not found' });
        }
    } catch (error) {
        console.error('Error fetching purchase ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = { purchaseController, getPurchaseId };