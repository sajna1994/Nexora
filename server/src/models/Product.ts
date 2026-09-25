import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: String,                                // kept for legacy / filters
    description: String,
    price: { type: Number, required: true },
    discountPrice: Number,
    images: [String],
    stock: { type: Number, default: 0 },
    sku: String,
    specifications: { type: Map, of: String },    // legacy
    variants: [{ name: String, options: [String] }], // legacy
    isActive: { type: Boolean, default: true },

    // ── Dynamic, category-driven attributes ───────────
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Product", schema);