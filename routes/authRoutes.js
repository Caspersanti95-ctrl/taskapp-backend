const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const db = require("../db");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Admin kan Oprette Monitor
router.post(
    "/create-monitor",
    authMiddleware,
    roleMiddleware("admin"),
    authController.createMonitor
);

// Hent Bruger
router.get("/users",
    authMiddleware,
    roleMiddleware("admin"),
    authController.getUsers
);

// Slet Bruger
router.delete(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    authController.deleteUser
);

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, organization_id logo FROM users WHERE id = ? AND organization_id = ?",
            [req.user.id, req.user.organization_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Bruger ikke fundet" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fejl" });
    }
});
module.exports = router;
