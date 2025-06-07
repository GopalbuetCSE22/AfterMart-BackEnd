const pool = require('../db/pool');
const { buyProductQuery, setBuyeridQuery,getProductByIdQuery } = require('../queries/productBuyingQueries');

async function buyProduct(req, res) {
    const { buyerid, productId } = req.params;

    console.log('buyProduct called with:', { buyerid, productId });
    
    try {
        // Check if the product exists
        const { rows: productRows } = await pool.query(buyProductQuery, [productId]);
        
        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productRows[0];

        // Check if the requested quantity is available
        if (product.isavailable == false) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        product.buyer_id = buyerid;
        
        // Update the product with the buyer's ID
        await pool.query(setBuyeridQuery, [buyerid, productId]);

        res.status(200).json({ message: 'Product purchased successfully' });
    } catch (error) {
        console.error('buyProduct error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function getProductById(req, res) {
  const productId = req.params.id;
  console.log('getProductById called with productId:', productId);
  try {
    const result = await pool.query(getProductByIdQuery, [productId]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('getProductById error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}
module.exports = {
    buyProduct,getProductById
};