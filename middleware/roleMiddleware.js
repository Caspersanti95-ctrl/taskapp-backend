module.exports = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Ikke autoriseret" });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({ error: "Adgang nægtet" });
        }

        next();
    };
};
        