const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Ingen token fundet"});
    }


const token = authHeader.split(" ")[1];

if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
}


try {
    console.log("VERIFY SECRET:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    return next();
} catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ error: "Ugyldig token" });
}

};