const express = require('express');
const cors = require('cors');
const app = express();

// middleware: แปลง JSON body
app.use(express.json());
app.use(cors());

const healthRouter = require('./routes/health');
const ordersRouter = require('./routes/orders');
const tablesRouter = require('./routes/tables');
const menusRouter = require('./routes/menus');
const orderItemsRouter = require('./routes/order-items');

console.log('🔥 APP.JS LOADED');

// mount routes
app.use('/health', healthRouter);
app.use('/orders', ordersRouter);
app.use('/tables', tablesRouter);
app.use('/menus', menusRouter);
app.use('/orders', orderItemsRouter);

module.exports = app;
