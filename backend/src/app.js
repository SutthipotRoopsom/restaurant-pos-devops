const express = require('express');
const app = express();

app.use(express.json());

const healthRouter = require('./routes/health');
const ordersRouter = require('./routes/orders');
const orderItemsRouter = require('./routes/order-items');

console.log('🔥 APP.JS LOADED');

// health
app.use('/health', healthRouter);

// orders
app.use('/orders', ordersRouter);

// order items (child of orders)
app.use('/orders', orderItemsRouter);

module.exports = app;
