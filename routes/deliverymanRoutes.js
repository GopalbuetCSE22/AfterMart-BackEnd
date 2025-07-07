const express = require('express');
const router = express.Router();

const { getprofileDeliveryMan, getOrders } = require('../controllers/deliverymanController');

router.get("/profile/:deliveryman_id", getprofileDeliveryMan);
router.get("/orders/:deliveryman_id" , getOrders);
module.exports = router;