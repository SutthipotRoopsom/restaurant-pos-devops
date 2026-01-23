const express = require('express');
const router = express.Router();

console.log('🔥 orders router LOADED');

// POST /orders  -> create order
router.post('/', (req, res) => {
    const { table_id } = req.body;

    if (!table_id) {
        return res.status(400).json({ error: 'table_id required' });
    }

    res.json({
        order_id: Date.now(),
        table_id,
        status: 'OPEN'
    });
});

// GET /orders/:id
router.get('/:id', (req, res) => {
    res.json({
        order_id: req.params.id,
        status: 'OPEN'
    });
});

module.exports = router;
