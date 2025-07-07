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

const getOrders = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;
    console.log(deliveryman_id);
    
    try {
        const address = await pool.query('SELECT address_id FROM deliverymanprefarea WHERE deliveryman_id = $1', [deliveryman_id]);
        if (address.rows.length === 0) {
            return res.status(404).json({ message: 'Deliveryman address not found' });
        }
        // Assuming the address_id is needed for the query, but not used in the current query
        const address_id = address.rows[0].address_id;
        console.log('Address ID:', address_id);

        const result = await pool.query(getDeliveryManOrdersQuery, [address_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No orders found for this deliveryman' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching deliveryman orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = { getprofileDeliveryMan, getOrders };