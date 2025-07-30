// queries/deliverymanQueries.js

// Query to get deliveryman profile and aggregate preferred areas and delivery count
const getDeliveryManProfileQuery = `
    SELECT
        dm.deliveryman_id,
        dm.name,
        dm.email,
        dm.phone,
        dm.vehicle_type,
        dm.company_id,
        dm.rating_avg,
        COUNT(s.shipment_id) FILTER (WHERE s.status = 'DELIVERED') AS delivery_count,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'division', a.division,
                    'district', a.district,
                    'ward', a.ward,
                    'area', a.area
                ) ORDER BY dpa.address_id
            ) FILTER (WHERE dpa.address_id IS NOT NULL),
            '[]'::json
        ) AS preferred_areas
    FROM
        delivery_man dm
    LEFT JOIN
        deliverymanprefarea dpa ON dm.deliveryman_id = dpa.deliveryman_id
    LEFT JOIN
        address a ON dpa.address_id = a.address_id
    LEFT JOIN
        shipment s ON dm.deliveryman_id = s.deliveryman_id -- For delivery_count
    WHERE
        dm.deliveryman_id = $1
    GROUP BY
        dm.deliveryman_id;
`;

// --- NEW QUERY: For AVAILABLE orders (purchases not yet assigned a shipment) ---
// These are 'PENDING' purchases that don't have a shipment_id yet,
// and their delivery address (buyer's address) is within the deliveryman's preferred areas.
const getAvailableOrdersQuery = `
    WITH matched_orders AS (
    SELECT
        p.purchase_id,
        u.name AS buyer_name,
        u.phone AS buyer_phone,
        p.total_price,
        -- Frontend expects delivery_division, delivery_district, etc.
        a.division AS delivery_division,
        a.district AS delivery_district,
        a.ward AS delivery_ward,
        a.area AS delivery_area,
        -- Frontend checks for shipment_status being NULL for "Available"
        NULL AS shipment_id,
        NULL AS shipment_status,
        -- Add accepted_at and delivered_at as NULL, matching other shipment fields for consistency
        NULL AS accepted_at,
        NULL AS delivered_at,
        NULL AS shipment_rating,
        (
            CASE WHEN pa.area = a.area THEN 1 ELSE 0 END +
            CASE WHEN pa.ward = a.ward THEN 1 ELSE 0 END +
            CASE WHEN pa.district = a.district THEN 1 ELSE 0 END +
            CASE WHEN pa.division = a.division THEN 1 ELSE 0 END
        ) AS match_score,
        ROW_NUMBER() OVER (PARTITION BY p.purchase_id ORDER BY
            (CASE WHEN pa.area = a.area THEN 1 ELSE 0 END +
             CASE WHEN pa.ward = a.ward THEN 1 ELSE 0 END +
             CASE WHEN pa.district = a.district THEN 1 ELSE 0 END +
             CASE WHEN pa.division = a.division THEN 1 ELSE 0 END
            ) DESC
        ) AS row_num
    FROM purchase p
    JOIN "User" u ON p.buyer_id = u.user_id
    JOIN address a ON u.address_id = a.address_id
    LEFT JOIN shipment s ON p.purchase_id = s.purchase_id AND s.shipment_id IS NOT NULL
    JOIN deliverymanprefarea dmpa ON dmpa.deliveryman_id = $1
    JOIN address pa ON dmpa.address_id = pa.address_id
    WHERE s.shipment_id IS NULL -- Only show purchases without an assigned shipment
)
SELECT *
FROM matched_orders
WHERE row_num = 1
ORDER BY match_score DESC, purchase_id ASC;
`;

// --- NEW QUERY: For UNDER SHIPMENT orders (shipments assigned to this deliveryman, not yet delivered) ---
// These are shipments assigned to the deliveryman with status 'ACCEPTED' or 'Under Shipment'.
const getUnderShipmentOrdersQuery = `
    SELECT
        p.purchase_id,
        p.total_price,
        u.name AS buyer_name,
        ba.division AS delivery_division,
        ba.district AS delivery_district,
        ba.ward AS delivery_ward,
        ba.area AS delivery_area,
        s.shipment_id,
        s.status AS shipment_status, -- Will be 'ACCEPTED' or 'Under Shipment'
        s.accepted_at
    FROM
        purchase p
    JOIN
        shipment s ON p.shipment_id = s.shipment_id
    JOIN
        "User" u ON p.buyer_id = u.user_id
    JOIN
        address ba ON u.address_id = ba.address_id -- Buyer's default address is the delivery address
    WHERE
        s.deliveryman_id = $1
        AND s.status IN ('ACCEPTED', 'Under Shipment')
    ORDER BY
        s.accepted_at ASC;
`;

// --- NEW QUERY: For DELIVERED orders (shipments delivered by this deliveryman) ---
// These are shipments assigned to the deliveryman with status 'DELIVERED'.
const getDeliveredOrdersQuery = `
    SELECT
        p.purchase_id,
        p.total_price,
        u.name AS buyer_name,
        ba.division AS delivery_division,
        ba.district AS delivery_district,
        ba.ward AS delivery_ward,
        ba.area AS delivery_area,
        s.shipment_id,
        s.status AS shipment_status, -- Will be 'DELIVERED'
        s.accepted_at,
        s.delivered_at,
        s.shipment_rating
    FROM
        purchase p
    JOIN
        shipment s ON p.shipment_id = s.shipment_id
    JOIN
        "User" u ON p.buyer_id = u.user_id
    JOIN
        address ba ON u.address_id = ba.address_id -- Buyer's default address is the delivery address
    WHERE
        s.deliveryman_id = $1
        AND s.status = 'DELIVERED'
    ORDER BY
        s.delivered_at DESC;
`;

// Query to create a new shipment and update the purchase's shipment_id and status
const createAndAssignShipmentQuery = `
    WITH NewShipment AS (
        INSERT INTO shipment (
            purchase_id,
            deliveryman_id,
            status,
            accepted_at,
            delivered_at,      -- Set to NULL initially, will be updated on delivery
            shipment_rating    -- Set to NULL initially, will be updated on delivery
        ) VALUES (
            $1, -- purchase_id
            $2, -- deliveryman_id
            'ACCEPTED', -- Initial status when accepted by DM
            CURRENT_TIMESTAMP,
            NULL, -- Assuming delivered_at can be NULL initially (Recommended DDL change)
            NULL  -- Assuming shipment_rating can be NULL initially (Recommended DDL change)
        )
        RETURNING shipment_id
    )
    UPDATE purchase
    SET
        shipment_id = (SELECT shipment_id FROM NewShipment),
        status = 'Accepted by Deliveryman' -- Update purchase status
    WHERE
        purchase_id = $1
    RETURNING purchase_id;
`;

// Query to mark a shipment as delivered and update the associated purchase status
const markShipmentDeliveredQuery = `
    UPDATE shipment
    SET
        status = 'DELIVERED',
        delivered_at = NOW()
    WHERE
        shipment_id = $1
    RETURNING *;
`;

// Query to update purchase status after shipment is marked delivered
const updatePurchaseStatusAfterDeliveryQuery = `
    UPDATE purchase
    SET status = 'Delivered'
    WHERE shipment_id = $1;
`;

// Query to change deliveryman's password
const changeDeliveryManPasswordQuery = `
    UPDATE delivery_man
    SET password = $1
    WHERE deliveryman_id = $2;
`;

// Query to verify old password for deliveryman
const verifyDeliveryManOldPasswordQuery = `
    SELECT * FROM delivery_man
    WHERE deliveryman_id = $1 AND password = $2;
`;

// Query to get deliveryman info for a shipment (for a buyer, if needed)
const getDeliveryManInfoForShipmentQuery = `
    SELECT dm.name, dm.phone, dm.email, dm.rating_avg
    FROM shipment s
    JOIN delivery_man dm ON s.deliveryman_id = dm.deliveryman_id
    WHERE s.shipment_id = $1;
`;

module.exports = {
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
};