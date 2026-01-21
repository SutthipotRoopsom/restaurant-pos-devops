const router = require("express").Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({ status: "ok", db: "up" });
    } catch (err) {
        res.status(500).json({ status: "error", db: "down" });
    }
});

module.exports = router;
