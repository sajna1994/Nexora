import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
    variant: Object,
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    phone: String,
    addresses: [Object],

    // ── Per-user persistence ──────────────────────────────
    cart: { type: [cartItemSchema], default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", schema);