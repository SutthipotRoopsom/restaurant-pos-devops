/**
 * tables.js
 * =========
 * API สำหรับจัดการข้อมูลโต๊ะ (Tables)
 */
const express = require('express');
const router = express.Router();
const pool = require('../db'); // เรียกใช้ Database
// GET /tables - ดูรายชื่อโต๊ะทั้งหมด
router.get('/', async (req, res) => {
  try {
    // ยิง SQL ไปขอข้อมูลโต๊ะทั้งหมด
    const result = await pool.query('SELECT * FROM tables ORDER BY id ASC');

    // ส่งข้อมูลกลับไปให้คนเรียก (Array ของโต๊ะ)
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// GET /tables/:id - ดูข้อมูลโต๊ะ + ออเดอร์ที่ค้างอยู่
router.get('/:id', async (req, res) => {
  try {
    const tableId = req.params.id;
    // 1. หาข้อมูลโต๊ะ
    const tableResult = await pool.query('SELECT * FROM tables WHERE id = $1', [
      tableId,
    ]);

    if (tableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    const table = tableResult.rows[0];
    // 2. ถ้าโต๊ะไม่ว่าง (Occupied) -> หา Order ID ล่าสุดที่ยังไม่จ่ายเงิน (Status != paid)
    let activeOrder = null;
    if (table.status === 'occupied') {
      const orderResult = await pool.query(
        `SELECT * FROM orders 
                 WHERE table_id = $1 AND status != 'paid' 
                 ORDER BY created_at DESC LIMIT 1`,
        [tableId]
      );

      if (orderResult.rows.length > 0) {
        activeOrder = orderResult.rows[0];
      }
    }
    // 3. ส่งข้อมูลกลับไป (รวม active_order_id ด้วย)
    res.json({
      ...table,
      active_order_id: activeOrder ? activeOrder.id : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
