import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const router = express.Router();

// Configuración de almacenamiento para los glifos
const glyphStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    let subfolder = "images/glyphs";
    if (file.mimetype.startsWith("audio/")) {
      subfolder = "audio/glyphs";
    } else if (file.mimetype.startsWith("video/")) {
      subfolder = "video/glyphs";
    }
    const dir = path.join(process.cwd(), "public", "assets", subfolder);
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    let prefix = "glyph-";
    if (file.mimetype.startsWith("audio/")) {
      prefix = "audio-";
    } else if (file.mimetype.startsWith("video/")) {
      prefix = "video-";
    }
    cb(null, prefix + uniqueSuffix + ext);
  }
});
const uploadGlyph = multer({ storage: glyphStorage });

router.post("/glyphs/upload", uploadGlyph.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se subió ningún archivo." });
  }
  let subfolder = "images/glyphs";
  if (req.file.mimetype.startsWith("audio/")) {
    subfolder = "audio/glyphs";
  } else if (req.file.mimetype.startsWith("video/")) {
    subfolder = "video/glyphs";
  }
  const relativePath = `/assets/${subfolder}/${req.file.filename}`;
  res.json({ success: true, url: relativePath });
});

// Almacenamiento y subida de insignias
const badgeStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = path.join(process.cwd(), "public", "assets", "images", "badges");
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "badge-" + uniqueSuffix + ext);
  }
});
const uploadBadge = multer({ storage: badgeStorage });

router.post("/badges/upload", uploadBadge.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se subió ningún archivo." });
  }
  const relativePath = `/assets/images/badges/${req.file.filename}`;
  res.json({ success: true, url: relativePath });
});

export default router;
