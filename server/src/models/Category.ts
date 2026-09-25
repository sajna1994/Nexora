import mongoose from "mongoose";

const fieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },       // "size", "brand", "weight"
    label: { type: String, required: true },     // "Available Sizes"
    type: {
      type: String,
      enum: ["text", "number", "select", "multi-select", "boolean", "textarea"],
      required: true,
    },
    options: [String],                            // for select / multi-select
    required: { type: Boolean, default: false },
    placeholder: String,
    unit: String,                                 // "kg", "ml", "cm"
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    image: String,
    isActive: { type: Boolean, default: true },

    // ── Category-specific product fields ──────────────
    fields: { type: [fieldSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Category", schema);