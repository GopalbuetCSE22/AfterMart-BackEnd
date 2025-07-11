const express = require('express');
const router = express.Router();

const { getprofileDeliveryMan, getOrders,acceptShipment,markTheshipmentDelivered ,changePassword} = require('../controllers/deliverymanController');

router.get("/profile/:deliveryman_id", getprofileDeliveryMan);
router.get("/orders/:deliveryman_id" , getOrders);

router.post('/acceptshipment', acceptShipment);
router.patch('/markdelivered/:shipment_id', markTheshipmentDelivered);
router.patch('/changepassword/:deliveryman_id', changePassword); // Assuming you have a changePassword function
module.exports = router;