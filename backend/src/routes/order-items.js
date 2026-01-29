const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /orders/:id/items - Add item to order
// Note: This matches the route mount in app.js: app.use('/orders', orderItemsRouter);
// So the full path will be /orders/:id/items
router.post('/:id/items', async (req, res) => {
  const order_id = req.params.id;
  const { menu_item_id, quantity } = req.body;

  if (!menu_item_id || !quantity) {
    return res
      .status(400)
      .json({ error: 'menu_item_id and quantity are required' });
  }

  try {
    // 1. Get menu price
    const menuResult = await pool.query(
      'SELECT price FROM menus WHERE id = $1',
      [menu_item_id]
    );

    if (menuResult.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const price = menuResult.rows[0].price;

    // 2. Insert into order_items
    const result = await pool.query(
      `INSERT INTO order_items (order_id, menu_id, qty, price) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
      [order_id, menu_item_id, quantity, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
