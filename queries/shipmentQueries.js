
const createShipmentByPurchaseidQuery = `INSERT INTO shipment(purchase_id, status,accepted_at,delivered_at ,shipment_rating) VALUES ($1, $2,$3,$4,$5)`;

const getPurchaseStatusQuery = `SELECT * FROM purchase WHERE purchase_id = $1`;
module.exports = {
    createShipmentByPurchaseidQuery,
    getPurchaseStatusQuery
};