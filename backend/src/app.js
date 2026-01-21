const express = require("express");
const cors = require("cors");
const errorHandler = require("./utils/errorHandler");
const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use("/health", require("./routes/health"));

module.exports = app;
