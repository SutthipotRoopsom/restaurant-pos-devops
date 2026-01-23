const express = require('express');
const router = express.Router();

console.log('🔥 order-items router LOADED');

// POST /orders/:orderId/items
router.post('/:orderId/items', (req, res) => {
    const { orderId } = req.params;
    const { menu_item_id, quantity } = req.body;

    if (!menu_item_id || !quantity) {
        return res.status(400).json({
            error: 'menu_item_id and quantity are required'
        });
    }

    res.json({
        ok: true,
        orderId,
        menu_item_id,
        quantity
    });
});

module.exports = router;
