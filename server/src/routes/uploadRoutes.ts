import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireAdmin } from "../../middleware/auth";

const r = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
console.log("[upload] Using upload directory:", uploadDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

// Only allow images
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const okMime = allowed.test(file.mimetype);
  if (okExt && okMime) cb(null, true);
  else
    cb(
      new Error(
        "Only image files are allowed (jpeg, jpg, png, webp, gif)"
      )
    );
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // ← 20 MB
});

// Upload + wrap multer in a handler so errors become JSON
function handleUpload(req: any, res: any, next: any) {
  upload.single("file")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      console.error("[upload] Multer error:", err);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ message: "File too large. Max 20 MB per image." });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      console.error("[upload] Error:", err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}

r.post("/", requireAuth, requireAdmin, handleUpload, (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

export default r;