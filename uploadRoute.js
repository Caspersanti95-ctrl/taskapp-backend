const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("./cloudinary");
const db = require("./db");
const authMiddleware = require("./middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/logo", authMiddleware, upload.single("logo"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Ingen fil uploadet" });
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: "logos" },
            async (error, result) => {
                if (error || !result) {
                    console.error("Cloudinary Upload Error:", error);
                    return res.status(500).json({ error: "Upload fejlede" });
                }

                const logoUrl = result.secure_url;

                try {
                await db.query(
                    "UPDATE users SET logo = ? WHERE id = ?", 
                    [logoUrl, req.user.id]
                );
                     
    return res.json({ url: logoUrl });
            } catch (dbErr) {
        console.error("DB ERROR;", dbErr);
        res.status(500).json({ error: "Upload fejlede" });
    }
 }
);

stream.end(req.file.buffer);

    } catch (err) {
        console.error("Upload Route Error:", err);
        res.status(500).json({ error: "Server fejl" });
    }
}
);



module.exports = router;