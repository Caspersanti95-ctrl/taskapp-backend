const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const db = require("../db");

const { updateUser } = require("../controllers/authController");

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

router.put("/users/:id", authMiddleware, updateUser);

// Slet Bruger
router.delete(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    authController.deleteUser
);

router.delete(
    "/delete-logo",
    authMiddleware,
    async (req, res) => {
        try {
            const [rows] = await db.query(
                "SELECT logo FROM users WHERE id = ?",
                [req.user.id]
            );

            const logo = rows[0].logo;

            if (logo) {
                try {
                const publicId = logo.split("/").pop[0].split(".")[0];
                await cloudinary.uploader.destroy(`logos/${publicId}`);
            } catch (cloudErr) {
                console.error("Cloudinary Delete Error:", cloudErr);
            }
        }
        

            await db.query(
                "UPDATE users SET logo = NULL WHERE id = ?",
                [req.user.id]
            );

            res.json({ message: "Logo slettet" });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Kunne ikke slette logo" });
        }
    }
)

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, phone, role, organization_id, logo, isPro FROM users WHERE id = ? AND organization_id = ?",
            [req.user.id, req.user.organization_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Bruger ikke fundet" });
        }

        res.json({
            ...rows[0],
            isPro: Boolean(rows[0].isPro)
    });
    
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fejl" });
    }
});
module.exports = router;
