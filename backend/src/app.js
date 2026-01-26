/**
 * app.js
 * ======
 * หน้าที่:
 * - สร้าง express app
 * - ต่อ middleware
 * - ต่อ route
 */

const express = require('express');
const app = express();


// middleware: แปลง JSON body
app.use(express.json());

// import routes
const healthRouter = require('./routes/health');
const orderRouter = require('./routes/orders');
const tablesRouter = require('./routes/tables'); // <--- เพิ่มบรรทัดนี้! ✅
const menusRouter = require('./routes/menus');

// mount routes
app.use('/health', healthRouter);
app.use('/orders', orderRouter);
app.use('/tables', tablesRouter); // <--- เพิ่มบรรทัดนี้! ✅
app.use('/menus', menusRouter); // <--- เพิ่มตรงนี้

// export app ให้ server.js ใช้
module.exports = app;
