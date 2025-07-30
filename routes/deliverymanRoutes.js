// routes/deliverymanRoutes.js
const express = require('express');
const router = express.Router();

const {
    getProfileDeliveryMan,
    getAvailableOrders,
    getUnderShipmentOrders,
    getDeliveredOrders,
    acceptPurchase,
    markTheShipmentDelivered,
    changePassword,
    getDeliveryManInfo
} = require('../controllers/deliverymanController');

// Profile route
router.get("/profile/:deliveryman_id", getProfileDeliveryMan);

// Routes for different order types
router.get("/orders/available/:deliveryman_id", getAvailableOrders);
router.get("/orders/under-shipment/:deliveryman_id", getUnderShipmentOrders);
router.get("/orders/delivered/:deliveryman_id", getDeliveredOrders);

// Action routes
router.post('/acceptpurchase', acceptPurchase);
router.patch('/markdelivered/:shipment_id', markTheShipmentDelivered);
router.patch('/changepassword/:deliveryman_id', changePassword);

// Route to get deliveryman info for a shipment (e.g., for buyer's tracking page)
router.get('/assignment/:shipment_id', getDeliveryManInfo);

module.exports = router;