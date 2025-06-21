const { get } = require("../routes/userRoutes");
const pool = require('../db/pool'); // Assuming you have a db.js file for database connection

const { createShipmentByPurchaseidQuery, getPurchaseStatusQuery } = require("../queries/shipmentQueries");

const makeshipment = async (req, res) => {
    const { purchaseid } = req.params;
    console.log('makeshipment called with purchaseid:', purchaseid);
    let Status, created_at;
    // get the Status of the purchase to insert into shipment table 
    try {
        const result = await pool.query(getPurchaseStatusQuery, [purchaseid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        Status = result.rows[0].status; // Assuming status is part of the purchase details 
        created_at = result.rows[0].created_at; // Assuming status is part of the purchase details 
        console.log('Purchase Status:', Status, 'Created At:', created_at);
    } catch (error) {
        console.error('Error fetching purchase details:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    //insert a default time to the delivered_at column
    const delivered_at = new Date();
    const shipment_rating = 1; // Default shipment rating


    //! shipment_rating and deliverd_at should be updated later by the delivery person
    try {
        await pool.query(createShipmentByPurchaseidQuery, [purchaseid, Status, created_at, delivered_at, shipment_rating]);

        res.status(201).json({ message: `Shipment created for purchase ID: ${purchaseid}` });
    } catch (error) {
        console.error('Error creating shipment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { makeshipment };