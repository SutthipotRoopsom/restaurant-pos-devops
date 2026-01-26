/**
 * orders.js
 * =========
 * Order API (mock version)
 * ยังไม่ต่อ DB เพื่อให้ backend flow ทำงานก่อน
 */

const express = require('express');
const router = express.Router();

// POST /orders
router.post('/', (req, res) => {
    const { table_id } = req.body;

    if (!table_id) {
        return res.status(400).json({
            error: 'table_id is required'
        });
    }

    // mock order
    const order = {
        order_id: Math.floor(Math.random() * 10000),
        table_id,
        status: 'OPEN',
        created_at: new Date().toISOString()
    };

    res.status(201).json(order);
});

// POST /orders/:orderId/items
router.post('/:id/items', (req, res) => {
    const { id } = req.params;
    const { menu_item_id, quantity } = req.body;

    if (!menu_item_id || !quantity) {
        return res.status(400).json({
            error: 'menu_item_id and quantity are required'
        });
    }

    const orderItem = {
        item_id: Math.floor(Math.random() * 100000),
        order_id: parseInt(id),
        menu_item_id,
        quantity,
        added_at: new Date().toISOString()
    };

    res.status(201).json(orderItem);
});

module.exports = router;
