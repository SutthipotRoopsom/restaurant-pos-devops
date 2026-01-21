require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const logger = require("./utils/logger");

app.listen(PORT, () => {
    logger.info("Server started", { port: PORT });
});
