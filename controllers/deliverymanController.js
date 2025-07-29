const pool = require('../db/pool');
const {
    getDeliveryManProfileQuery,
    //   updateDeliveryManProfileQuery,
    getDeliveryManOrdersQuery,
    //   getDeliveryManEarningsQuery
} = require('../queries/deliverymanQueries');

const getprofileDeliveryMan = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;
    console.log(deliveryman_id);

    try {
        const result = await pool.query(getDeliveryManProfileQuery, [deliveryman_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Deliveryman not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching deliveryman profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// const getOrders = async (req, res) => {
//     const deliveryman_id = req.params.deliveryman_id;
//     console.log(deliveryman_id);

//     try {
//         const address = await pool.query('SELECT address_id FROM deliverymanprefarea WHERE deliveryman_id = $1', [deliveryman_id]);
//         if (address.rows.length === 0) {
//             return res.status(404).json({ message: 'Deliveryman address not found' });
//         }
//         // Assuming the address_id is needed for the query, but not used in the current query
//         const address_id = address.rows[0].address_id;
//         console.log('Address ID:', address_id);

//         const result = await pool.query(getDeliveryManOrdersQuery, [address_id]);
//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No orders found for this deliveryman' });
//         }
//         res.status(200).json(result.rows);
//     } catch (error) {
//         console.error('Error fetching deliveryman orders:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }


const getOrders = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;

    try {
        // Step 1: Get deliveryman's preferred address
        const dmanAddressRes = await pool.query(
            `SELECT a.*
             FROM deliverymanprefarea dpa
             JOIN address a ON dpa.address_id = a.address_id
             WHERE dpa.deliveryman_id = $1`,
            [deliveryman_id]
        );

        if (dmanAddressRes.rows.length === 0) {
            return res.status(404).json({ message: 'Deliveryman preferred address not found' });
        }

        const dmanAddr = dmanAddressRes.rows[0];

        // Step 2: Get all relevant orders
        const ordersRes = await pool.query(`
            SELECT 
                u.name, p.total_price, s.status, p.payment_status, 
                s.shipment_id, s.deliveryman_id,
                a.division, a.district, a.ward, a.area
            FROM purchase p
            JOIN shipment s ON p.shipment_id = s.shipment_id
            JOIN "User" u ON p.buyer_id = u.user_id
            JOIN address a ON u.address_id = a.address_id
            WHERE 
                (s.deliveryman_id IS NULL 
                 OR s.deliveryman_id = $1)
                AND s.status IN ('Under Shipment', 'ACCEPTED', 'DELIVERED')
        `, [deliveryman_id]);

        const allOrders = ordersRes.rows;

        const nearbyUnassigned = allOrders
            .filter(order => order.deliveryman_id === null)
            .map(order => {
                let score = 0;
                if (order.division === dmanAddr.division) score += 1;
                if (order.district === dmanAddr.district) score += 1;
                if (order.ward === dmanAddr.ward) score += 1;
                if (order.area === dmanAddr.area) score += 1;
                return { ...order, proximity_score: score };
            })
            .filter(order => order.proximity_score >= 2);

        const alreadyAssigned = allOrders
            .filter(order => order.deliveryman_id == deliveryman_id);

        const finalOrders = [...nearbyUnassigned, ...alreadyAssigned]
            .map(order => ({
                name: order.name,
                total_price: order.total_price,
                status: order.status,
                payment_status: order.payment_status,
                shipment_id: order.shipment_id,
                deliveryman_id: order.deliveryman_id
            }));

        if (finalOrders.length === 0) {
            return res.status(404).json({ message: 'No nearby or assigned orders found for this deliveryman' });
        }

        res.status(200).json(finalOrders);
    } catch (err) {
        console.error('Error fetching deliveryman orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const acceptShipment = async (req, res) => {
    const { shipmentId, deliverymanId } = req.body;

    if (!shipmentId || !deliverymanId) {
        return res.status(400).json({ message: 'Shipment ID and Deliveryman ID are required' });
    }
    console.log('Accepting shipment:', shipmentId, 'for deliveryman:', deliverymanId);
    try {
        const result = await pool.query(
            //!  11111111111111111111111
            `UPDATE shipment SET deliveryman_id = $1, status = 'ACCEPTED' WHERE shipment_id = $2 RETURNING *`,
            [deliverymanId, shipmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found or already accepted' });
        }
        res.status(200).json({ message: 'Shipment accepted successfully', shipment: result.rows[0] });
    } catch (error) {
        console.error('Error accepting shipment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const markTheshipmentDelivered = async (req, res) => {
    const shipmentId = req.params.shipment_id;
    console.log('Marking shipment as delivered:', shipmentId);
    try {
        const result = await pool.query(
            `UPDATE shipment SET status = 'DELIVERED', delivered_at = NOW() WHERE shipment_id = $1 RETURNING *`,
            [shipmentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found or already delivered' });
        }
        res.status(200).json({ message: 'Shipment marked as delivered successfully', shipment: result.rows[0] });
    } catch (error) {
        console.error('Error marking shipment as delivered:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const changePassword = async (req, res) => {
    const deliverymanId = req.params.deliveryman_id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required' });
    }
    try {
        //verify old password
        const verifyOldPasswordQuery = `
            SELECT * FROM delivery_man
            WHERE deliveryman_id = $1 AND password = $2
        `;
        const verifyResult = await pool.query(verifyOldPasswordQuery, [deliverymanId, oldPassword]);
        if (verifyResult.rows.length === 0) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }
        //update new password
        const updatePasswordQuery = `
            UPDATE delivery_man
            SET password = $1
            WHERE deliveryman_id = $2
        `;
        await pool.query(updatePasswordQuery, [newPassword, deliverymanId]);
        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getdeliverymaninfo = async (req, res) => {
    const shipmentId = req.params.shipment_id;
    console.log('Fetching deliveryman info for shipment:', shipmentId);

    try {
        const result = await pool.query('SELECT dm.name , dm.phone, dm.email, dm.rating_avg FROM shipment s JOIN delivery_man dm ON s.deliveryman_id = dm.deliveryman_id WHERE s.shipment_id = $1', [shipmentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No deliveryman found for this shipment' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching deliveryman info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getprofileDeliveryMan, getOrders, acceptShipment, markTheshipmentDelivered, changePassword, getdeliverymaninfo };