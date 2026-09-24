import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: String,
    description: String,
    price: { type: Number, required: true },
    discountPrice: Number,
    images: [String],
    stock: { type: Number, default: 0 },
    sku: String,
    specifications: { type: Map, of: String },
    variants: [{ name: String, options: [String] }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", schema);