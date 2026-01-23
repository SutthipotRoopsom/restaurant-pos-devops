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

module.exports = router;
