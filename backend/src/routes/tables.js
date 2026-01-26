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
module.exports = router;