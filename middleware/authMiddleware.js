const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Ugyldig token format" });
    }


const token = authHeader.split(" ")[1];


if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
}



    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; 

    next();
} catch (err) {
   
    return res.status(401).json({ error: "Ugyldig token" });
}

};