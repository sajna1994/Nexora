import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    source: { type: String, default: "footer" },
    isActive: { type: Boolean, default: true },

    // ── Welcome code ────────────────────────────────
    welcomeCode: { type: String, unique: true, sparse: true },
    codeUsed: { type: Boolean, default: false },
    usedAt: Date,
    usedOnOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", schema);