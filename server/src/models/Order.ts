import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, default: 1, min: 1 },
        price: { type: Number, required: true, default: 0, min: 0 },
        variant: Object,
      },
    ],
    shippingAddress: Object,
    paymentMethod: String,
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: String,
    total: { type: Number, required: true, default: 0 },

    status: { type: String, default: "Processing" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", schema);