module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Ikke autoriseret" });
        }

        if (!req.user.role) {
            return res.status(403).json({ error: "Ingen rolle" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Adgang nægtet" });
        }

        next();
    };
};
        