/**
 * orders.js
 * =========
 * Order API (Real Database Version)
 */
const express = require('express');
const router = express.Router();
const pool = require('../db'); // <--- 🔑 พระเอกของเรา: เรียกใช้ Connection Pool


// POST /orders - เปิดโต๊ะ สร้างออเดอร์ใหม่
router.post('/', async (req, res) => {  // <--- ⚠️ อย่าลืม async เพราะเราต้องรอ Database
    const { table_id } = req.body;
    // 1. Validation: ตรวจสอบ input
    if (!table_id) {
        return res.status(400).json({ error: 'table_id is required' });
    }
    try {
        // 2. Database Operation: ยิง SQL ใส่ Database
        // $1 คือตัวแปรที่เราจะยัดใส่เข้าไป (ปลอดภัยจาก SQL Injection)
        const result = await pool.query(
            'INSERT INTO orders (table_id, status) VALUES ($1, $2) RETURNING *',
            [table_id, 'open']
        );
        // result.rows คือ array ของข้อมูลที่ได้กลับมา (เราเอาตัวแรก [0])
        const newOrder = result.rows[0];
        // 3. Response: ส่งของกลับไปให้ลูกค้า
        res.status(201).json(newOrder);
    } catch (err) {
        // 4. Error Handling: ถ้า Database พัง/มีปัญหา
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// POST /orders/:id/items - สั่งอาหาร
router.post('/:id/items', async (req, res) => {
    const order_id = req.params.id;
    const { menu_item_id, quantity } = req.body;
    if (!menu_item_id || !quantity) {
        return res.status(400).json({ error: 'menu_item_id and quantity are required' });
    }
    try {
        // 1. หาข้อมูลเมนู + ราคา (Query ซ้อน)
        const menuResult = await pool.query('SELECT price FROM menus WHERE id = $1', [menu_item_id]);

        if (menuResult.rows.length === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        const price = menuResult.rows[0].price;
        // 2. Insert ลงตาราง order_items
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


// POST /orders/:id/pay - ชำระเงิน (ต้องใช้ Transaction)
router.post('/:id/pay', async (req, res) => {
    const order_id = req.params.id;
    const client = await pool.connect(); // <--- 1. ยืม Connection มาใช้เอง
    try {
        await client.query('BEGIN'); // <--- 2. เริ่ม Transaction
        // 3. Update Order status -> 'paid'
        const orderRes = await client.query(
            `UPDATE orders SET status = 'paid', paid_at = NOW() 
             WHERE id = $1 RETURNING *`,
            [order_id]
        );
        if (orderRes.rows.length === 0) {
            throw new Error('Order not found');
        }
        const order = orderRes.rows[0];
        // 4. Update Table status -> 'available'
        await client.query(
            "UPDATE tables SET status = 'available' WHERE id = $1",
            [order.table_id]
        );
        await client.query('COMMIT'); // <--- 5. สำเร็จ! ยืนยันข้อมูลทั้งหมด

        res.json({
            message: 'Payment successful',
            order: order
        });
    } catch (err) {
        await client.query('ROLLBACK'); // <--- 6. พัง! ยกเลิกทั้งหมด
        console.error(err);
        res.status(500).json({ error: err.message || 'Payment failed' });
    } finally {
        client.release(); // <--- 7. คืน Connection ให้ Pool
    }
});
module.exports = router;
