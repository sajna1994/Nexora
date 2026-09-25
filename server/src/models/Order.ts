import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        quantity: Number,
        price: Number,
        variant: Object,
      },
    ],
    shippingAddress: Object,
    paymentMethod: String,
    subtotal: Number,        // ← ADD (optional, useful for reports)
    discount: { type: Number, default: 0 },        // ← ADD
    couponCode: String,
    total: Number,
    
    status: { type: String, default: "Processing" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", schema);