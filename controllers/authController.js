const db = require('../db'); //Mysql connection
const bcrypt = require('bcrypt'); //For password hashing
const jwt = require('jsonwebtoken'); //For token generation



// REGISTER
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({ message: "Alle felter er påkrævet" });
    }

    try {
        // Tjek om email allerede findes
        const [existing] = await db.query(
            "SELECT id from users WHERE email = ?",
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email findes allerede"}); 
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Tillad kun admin hvis det præcis er "admin"
        const userRole = "monitor";

        const [result] = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, userRole]
        );

        const userId = result.insertId;

       // await db.query(
       //     "UPDATE users SET organization_id = ? WHERE id = ?",
       //     [userId, userId]
       // );

        const token = jwt.sign(
            { id: userId, role: userRole }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            token,
            user: {
                id: userId,
                email,
                role: userRole
            }
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err)
        return res.status(500).json({ error: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email og Adgangskode er påkrævet"});
    }

    try {
        const [users] = await db.query(
            `SELECT * FROM users WHERE email = ?`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Ugyldige loginoplysninger" });
        }

        const user = users[0];

        console.log("BODY:", req.body);
        console.log("USER FROM DB:", user);

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: "Ugyldige loginoplysninger" });
        }

        console.log("SIGN SECRET:", process.env.JWT_SECRET);

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                organization_id: user.organization_id
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        return res.json({ 
            token, 
            user: {
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role 
                } 
            });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ error: "Server Fejl" });
    }
};

exports.createMonitor = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const role = "monitor";

        const [result] = await db.query(
            "INSERT INTO users (name, email, password, role, organization_id) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, userRole, req.user.organization_id]
        );

        res.json({
            message: "Bruger oprettet"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Kunne ikke oprette bruger" });
    }
};

exports.getUsers = async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT id, name AS username, role FROM users WHERE organization_id = ?",
            [req.user.organization_id]
        );

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fejl"});
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT role FROM users WHERE id = ? AND organization_id = ?",
            [id, req.user.organization_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Bruger ikke fundet" });
        }

        if (rows[0].role === "admin") {
            return res.status(403).json({
                error: "Admin kan ikke slettes"
            });
        }

        await db.query(
            "DELETE FROM users WHERE id = ? AND organization_id = ?",
            [id, req.user.organization_id]
        );

        res.json({ message: "Bruger slettet" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fejl" });
    }
};