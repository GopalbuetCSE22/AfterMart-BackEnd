const getDeliveryManProfileQuery = `
SELECT dm.name, dm.phone, dm.email, dm.vehicle_type, dm.rating_avg,dm.delivery_count,
       a.division, a.district, a.ward, a.area
from delivery_man dm
JOIN deliverymanprefarea dmpa ON dm.deliveryman_id = dmpa.deliveryman_id
JOIN address a ON dmpa.address_id = a.address_id
WHERE dm.deliveryman_id = $1
`

const getDeliveryManOrdersQuery = `
    SELECT u.name, p.total_price, s.status, p.payment_status , s.shipment_id ,s.deliveryman_id 
    FROM purchase p
    JOIN shipment s ON p.shipment_id = s.shipment_id
    JOIN "User" u ON p.buyer_id = u.user_id
    JOIN address a ON u.address_id = a.address_id
    WHERE a.address_id = $1
`
module.exports = {
    getDeliveryManProfileQuery, getDeliveryManOrdersQuery
}