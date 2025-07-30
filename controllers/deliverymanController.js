// controllers/deliverymanController.js
const pool = require('../db/pool'); // Make sure this path is correct for your project
const {
    getDeliveryManProfileQuery,
    getAvailableOrdersQuery,
    getUnderShipmentOrdersQuery,
    getDeliveredOrdersQuery,
    createAndAssignShipmentQuery,
    markShipmentDeliveredQuery,
    updatePurchaseStatusAfterDeliveryQuery,
    changeDeliveryManPasswordQuery,
    verifyDeliveryManOldPasswordQuery,
    getDeliveryManInfoForShipmentQuery,
} = require('../queries/deliverymanQueries');

// Fetches deliveryman's profile, including aggregated preferred areas and delivery count.
const getProfileDeliveryMan = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;
    console.log(`Fetching profile for deliveryman ID: ${deliveryman_id}`);

    try {
        const result = await pool.query(getDeliveryManProfileQuery, [deliveryman_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Deliveryman not found.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching deliveryman profile:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Fetches available orders (purchases with status 'PENDING' and no assigned shipment)
// that fall within the deliveryman's preferred areas.
const getAvailableOrders = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;
    if (!deliveryman_id) {
        return res.status(400).json({ error: 'Deliveryman ID is required.' });
    }
    console.log(`Fetching available orders for deliveryman ID: ${deliveryman_id}`);
    try {
        const result = await pool.query(getAvailableOrdersQuery, [deliveryman_id]);
        console.log('Available orders:', result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching available orders:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Fetches orders currently "Under Shipment" by this deliveryman.
// These are shipments assigned to this deliveryman with status 'ACCEPTED' or 'Under Shipment'.
const getUnderShipmentOrders = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;
    if (!deliveryman_id) {
        return res.status(400).json({ error: 'Deliveryman ID is required.' });
    }
    console.log(`Fetching under shipment orders for deliveryman ID: ${deliveryman_id}`);
    try {
        const result = await pool.query(getUnderShipmentOrdersQuery, [deliveryman_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching under shipment orders:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Fetches orders that have been "DELIVERED" by this deliveryman.
const getDeliveredOrders = async (req, res) => {
    const deliveryman_id = req.params.deliveryman_id;
    if (!deliveryman_id) {
        return res.status(400).json({ error: 'Deliveryman ID is required.' });
    }
    console.log(`Fetching delivered orders for deliveryman ID: ${deliveryman_id}`);
    try {
        const result = await pool.query(getDeliveredOrdersQuery, [deliveryman_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching delivered orders:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Handles the acceptance of a purchase by a deliveryman, creating a new shipment.
const acceptPurchase = async (req, res) => {
    const { purchaseId, deliverymanId } = req.body;
    if (!purchaseId || !deliverymanId) {
        return res.status(400).json({ message: 'Purchase ID and Deliveryman ID are required.' });
    }
    console.log(`Deliveryman ${deliverymanId} accepting purchase: ${purchaseId}`);
    try {
        // Start a transaction for atomicity
        await pool.query('BEGIN');

        // Check if the purchase is still available (status PENDING and shipment_id IS NULL)
        const checkPurchase = await pool.query(
            `SELECT purchase_id, status, shipment_id FROM purchase WHERE purchase_id = $1 FOR UPDATE`,
            [purchaseId]
        );

        if (checkPurchase.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Purchase not found.' });
        }
        const purchase = checkPurchase.rows[0];

        if (purchase.status !== 'PENDING' || purchase.shipment_id !== null) {
            await pool.query('ROLLBACK');
            return res.status(409).json({ message: 'This purchase is no longer available or has already been accepted.' });
        }

        const result = await pool.query(createAndAssignShipmentQuery, [purchaseId, deliverymanId]);

        if (result.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'Failed to accept purchase or purchase not found during assignment.' });
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Purchase accepted and shipment created successfully!', purchase: result.rows[0] });
    } catch (error) {
        await pool.query('ROLLBACK'); // Rollback on error
        console.error('Error accepting purchase and creating shipment:', error);
        res.status(500).json({ error: 'Internal server error.', details: error.message });
    }
};

// Marks a shipment as delivered and updates the associated purchase status.
const markTheShipmentDelivered = async (req, res) => {
  const shipmentId = req.params.shipment_id;
  console.log(`Marking shipment ID: ${shipmentId} as delivered.`);

  try {
    // Start a transaction for atomicity
    await pool.query('BEGIN');

    // Update shipment (set status = 'delivered', delivered_at = now)
    const shipmentUpdateResult = await pool.query(markShipmentDeliveredQuery, [shipmentId]);

    if (shipmentUpdateResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Shipment not found or already delivered.' });
    }

    // Update purchase status to 'delivered'
    await pool.query(updatePurchaseStatusAfterDeliveryQuery, [shipmentId]);

    // Commit the main transaction
    await pool.query('COMMIT');

    // Try to update delivery_count separately, non-critical
    const deliverymanId = shipmentUpdateResult.rows[0].deliveryman_id;
    updateDeliveryCountOnly(deliverymanId); // Fire-and-forget

    res.status(200).json({
      message: 'Shipment marked as delivered successfully.',
      shipment: shipmentUpdateResult.rows[0]
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error marking shipment as delivered:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
};
const updateDeliveryCountOnly = async (deliverymanId) => {
  try {
    const countQuery = `
      SELECT COUNT(*) AS delivery_count
      FROM shipment
      WHERE deliveryman_id = $1 AND delivered_at IS NOT NULL
    `;

    const result = await pool.query(countQuery, [deliverymanId]);
    const deliveryCount = result.rows[0].delivery_count || 0;

    await pool.query(
      'UPDATE delivery_man SET delivery_count = $1 WHERE deliveryman_id = $2',
      [deliveryCount, deliverymanId]
    );

  } catch (err) {
    console.error("Non-critical: Error updating delivery_count:", err.message);
    // No crash, just log the error
  }
};

// Handles changing a deliveryman's password.
const changePassword = async (req, res) => {
    const deliverymanId = req.params.deliveryman_id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old password and new password are required.' });
    }
    console.log(`Changing password for deliveryman ID: ${deliverymanId}`);
    try {
        const verifyResult = await pool.query(verifyDeliveryManOldPasswordQuery, [deliverymanId, oldPassword]);
        if (verifyResult.rows.length === 0) {
            return res.status(401).json({ message: 'Old password is incorrect.' });
        }
        await pool.query(changeDeliveryManPasswordQuery, [newPassword, deliverymanId]);
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Gets deliveryman information for a specific shipment (useful for buyer side tracking).
const getDeliveryManInfo = async (req, res) => {
    const shipmentId = req.params.shipment_id;
    console.log(`Fetching deliveryman info for shipment ID: ${shipmentId}`);

    try {
        const result = await pool.query(getDeliveryManInfoForShipmentQuery, [shipmentId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No deliveryman found for this shipment.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching deliveryman info:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


module.exports = {
    getProfileDeliveryMan,
    getAvailableOrders,
    getUnderShipmentOrders,
    getDeliveredOrders,
    acceptPurchase,
    markTheShipmentDelivered,
    changePassword,
    getDeliveryManInfo, // Renamed from getdeliverymaninfo for consistency
};