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

        const emailClean = email.toLowerCase().trim();

        if (!emailClean || !password) {
            return res.status(400).json({ message: "Email og Adgangskode er påkrævet"});
        }

        // Tjek om email allerede findes
        const [existing] = await db.query(
            "SELECT id from users WHERE email = ?",
            [emailClean]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: "Email findes allerede"}); 
        }

        const hashedPassword = await bcrypt.hash(password, 10);

       

        const [orgResult] = await db.query(
            "INSERT INTO organizations (name) VALUES (?)",
            [`${name}'s virksomhed`]
        );

        const orgId = orgResult.insertId;

        // Tillad kun admin hvis det præcis er "admin"
        const userRole = "admin";
       

        const [result] = await db.query(
            "INSERT INTO users (name, email, password, role, organization_id) VALUES (?, ?, ?, ?, ?)",
            [name, emailClean, hashedPassword, userRole, orgId]
        );

        const userId = result.insertId;

       

        const token = jwt.sign(
            { 
                id: userId, 
                role: userRole,
                organization_id: orgId
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(201).json({ 
            token,
            user: {
                id: userId,
                email,
                role: userRole,
                organization_id: orgId
            }
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err)

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email findes allerede" });
        }
        return res.status(500).json({ 
            error: err.message || JSON.stringify(err) });
    }
};

// LOGIN
exports.login = async (req, res) => {
    
    try {
    const { email, password } = req.body;
    const emailClean = email.toLowerCase().trim();

    if (!email || !password) {
        return res.status(400).json({ message: "Email og Adgangskode er påkrævet"});
    }

    
        const [users] = await db.query(
            `SELECT * FROM users WHERE email = ?`, 
            [emailClean]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Ugyldige loginoplysninger" });
        }

        const user = users[0];

        
        

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
    const { name, email, password, role, phone } = req.body;

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRole = role || "monitor";

          const [result] = await db.query(
            "INSERT INTO users (name, email, password, role, phone, organization_id) VALUES (?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, userRole, phone, req.user.organization_id]
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
            "SELECT id, name, role FROM users WHERE organization_id = ?",
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
        if (id === req.user.id) {
            return res.status(400).json({ error: "Du kan ikke slette dig selv" });
        }
            
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

        const [result] = await db.query(
            "DELETE FROM users WHERE id = ? AND organization_id = ?",
            [id, req.user.organization_id]
        );

            if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Bruger ikke slettet" });
        }

        res.json({ message: "Bruger slettet" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fejl" });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone, password } = req.body;

    try {
        
        let query = "UPDATE users SET ";
        const values = [];
        const fields = [];

        if (name !== undefined) {
            fields.push("name = ?");
            values.push(name);
        }

        if (email !== undefined) {
            fields.push("email = ?");
            values.push(email);
        }

        if (role !== undefined) {
            fields.push("role = ?");
            values.push(role);
        }

        if (phone !== undefined) {
            fields.push("phone = ?");
            values.push(phone);
        }
        
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            fields.push("password = ?");
            values.push(hashedPassword);
        }

        query += fields.join(", ");
        query += " WHERE id = ?";
        values.push(id);
        
        await db.query(query, values);

        res.json({ message: "Bruger opdateret" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server fejl" });
    }
};