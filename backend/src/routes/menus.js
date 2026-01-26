/* src/routes/menus.js */
const express = require('express');
const router = express.Router();
const pool = require('../db');
// GET /menus
router.get('/', async (req, res) => {
    try {
        // ลองทายซิว่าต้องเขียน SQL ยังไง?
        // เฉลย: SELECT * FROM menus WHERE active = true ORDER BY id ASC
        const result = await pool.query('SELECT * FROM menus WHERE active = true ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;