const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("./cloudinary");
const db = require("./db");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/logo", upload.single("logo"), async (req, res) => {
    try {
        
        const stream = cloudinary.uploader.upload_stream(
            { folder: "logos" },
            async (error, result) => {
                if (error) return res.status(500).json(error);

                const logoUrl = result.secure_url;

                await db.query(
                    "UPDATE users SET logo = ? WHERE id = ?", 
                    [logoUrl, req.user.id]
                );

                res.json({ logo: logoUrl });
            }
        );

        stream.end(req.file.buffer);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Upload fejlede" });
    }
});

module.exports = router;