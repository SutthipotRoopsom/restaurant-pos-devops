/**
 * health.js
 * =========
 * health check endpoint
 * ใช้ตรวจว่า server ยังรันอยู่ไหม
 */

const express = require('express');
const router = express.Router();

// GET /health
router.get('/', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime()
    });
});

module.exports = router;
