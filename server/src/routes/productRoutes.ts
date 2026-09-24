import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import { requireAuth, requireAdmin } from "../../middleware/auth";

const r = Router();

// Public
r.get("/", async (req, res) => {
  const q = (req.query.search as string) || "";
  const category = req.query.category as string;

  const filter: any = { isActive: true };
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category && category !== "all") filter.category = category;

  res.json(
    await Product.find(filter).populate("category").sort({ createdAt: -1 })
  );
});

r.get("/:id", async (req, res) => {
  const p = await Product.findById(req.params.id).populate("category");
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json(p);
});

// Helper to sanitize payload
function sanitizeProduct(body: any) {
  const out: any = { ...body };

  // Drop empty category to avoid CastError
  if (!out.category || out.category === "") {
    delete out.category;
  } else if (!mongoose.Types.ObjectId.isValid(out.category)) {
    throw new Error("Invalid category id");
  }

  // Ensure price/discountPrice/stock are numbers
  if (out.price !== undefined) out.price = Number(out.price);
  if (out.discountPrice !== undefined)
    out.discountPrice = out.discountPrice === null ? undefined : Number(out.discountPrice);
  if (out.stock !== undefined) out.stock = Number(out.stock);

  // Ensure images is an array
  if (out.images && !Array.isArray(out.images)) out.images = [out.images];

  return out;
}

// Admin only
r.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = sanitizeProduct(req.body);
    const created = await Product.create(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Invalid product data" });
  }
});

r.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = sanitizeProduct(req.body);
    const updated = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Invalid product data" });
  }
});

r.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default r;