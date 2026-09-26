import { Router } from "express";
import mongoose from "mongoose";
import Product from "../models/Product";
import Category from "../models/Category";
import { requireAuth, requireAdmin } from "../middleware/auth";

const r = Router();

/* ── Validate dynamic attributes against the category's field definitions */
async function validateAttributes(categoryId: string, attributes: any) {
  if (!categoryId) return;

  const category = await Category.findById(categoryId);
  if (!category) throw new Error("Category not found");

  const fields = category.fields || [];
  const errors: string[] = [];

  for (const f of fields) {
    const val = attributes?.[f.key];
    const isEmpty =
      val === undefined ||
      val === null ||
      val === "" ||
      (Array.isArray(val) && val.length === 0);

    if (f.required && isEmpty) {
      errors.push(`${f.label} is required`);
    }

    if (!isEmpty) {
      if (f.type === "number" && isNaN(Number(val))) {
        errors.push(`${f.label} must be a number`);
      }
      if (
        (f.type === "select" || f.type === "multi-select") &&
        f.options?.length
      ) {
        const arr = Array.isArray(val) ? val : [val];
        for (const v of arr) {
          if (!f.options.includes(String(v))) {
            errors.push(`${f.label} has an invalid option: ${v}`);
          }
        }
      }
    }
  }

  if (errors.length) throw new Error(errors.join(" · "));
}

/* ── Prepare payload: sanitize + validate attributes */
async function prepareProduct(body: any) {
  const out: any = { ...body };

  if (!out.attributes || typeof out.attributes !== "object") {
    out.attributes = {};
  }

  if (!out.category || out.category === "") {
    delete out.category;
  } else if (!mongoose.Types.ObjectId.isValid(out.category)) {
    throw new Error("Invalid category id");
  }

  if (out.price !== undefined) out.price = Number(out.price);
  if (out.discountPrice !== undefined)
    out.discountPrice =
      out.discountPrice === null ? undefined : Number(out.discountPrice);
  if (out.stock !== undefined) out.stock = Number(out.stock);
  if (out.images && !Array.isArray(out.images)) out.images = [out.images];

  if (out.category) {
    await validateAttributes(String(out.category), out.attributes);
  }

  return out;
}

/* ── Public routes ──────────────────────────────────── */
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

/* ── Admin routes ───────────────────────────────────── */
r.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await prepareProduct(req.body);
    const created = await Product.create(data);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Invalid product data" });
  }
});

r.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await prepareProduct(req.body);
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