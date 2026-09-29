import { Router } from "express";
import multer from "multer";
import { getCloudinary } from "../config/cloudinary";
import { requireAuth, requireAdmin } from "../middleware/auth";

const r = Router();

// ❌ REMOVE THIS LINE:
// const cloudinary = getCloudinary();

// ✅ Keep the rest as-is
const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const okExt = allowed.test(
    file.originalname.toLowerCase().split(".").pop() || ""
  );
  const okMime = allowed.test(file.mimetype);
  if (okExt && okMime) cb(null, true);
  else cb(new Error("Only image files are allowed (jpeg, jpg, png, webp, gif)"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

function handleUpload(req: any, res: any, next: any) {
  upload.single("file")(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ message: "File too large. Max 20 MB per image." });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}

r.post("/", requireAuth, requireAdmin, handleUpload, async (req: any, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  try {
    // ✅ Call getCloudinary() HERE — env vars are guaranteed loaded by now
    const cloudinary = getCloudinary();

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "nexora/products",
          resource_type: "image",
          transformation: [
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err: any) {
    console.error("[upload] Cloudinary error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

export default r;