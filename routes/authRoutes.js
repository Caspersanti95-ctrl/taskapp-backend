const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

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
router.get(
    "/users",
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

module.exports = router;
