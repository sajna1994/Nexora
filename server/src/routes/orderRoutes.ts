import { Router } from "express";
import Order from "../models/Order";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";
import Subscriber from "../models/Subscriber";

const r = Router();

// Admins see all orders; customers see only their own
r.get("/", requireAuth, async (req: AuthRequest, res) => {
  const filter = req.user!.role === "admin" ? {} : { user: req.user!.id };
  res.json(
    await Order.find(filter)
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
  );
});

// Only logged-in customers (or admins) can create orders
r.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, couponCode } =
      req.body;

    let discount = 0;

    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      const sub = await Subscriber.findOne({ welcomeCode: code });

      if (!sub || sub.codeUsed) {
        return res
          .status(400)
          .json({ message: "Invalid or already used coupon" });
      }

      const existingOrders = await Order.find({
        user: req.user!.id,
        status: { $ne: "Cancelled" },
      });
      if (existingOrders.length > 0) {
        return res
          .status(400)
          .json({ message: "Coupon only valid on your first order" });
      }

      discount = Math.round(Number(subtotal || 0) * 0.1);
    }

    const finalTotal = Math.max(0, Number(subtotal || 0) - discount);

    const order = await Order.create({
      user: req.user!.id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal: Number(subtotal || 0),
      discount,
      couponCode: couponCode ? String(couponCode).toUpperCase() : undefined,
      total: finalTotal,
    });

    // Mark the code as used
    if (couponCode) {
      await Subscriber.updateOne(
        { welcomeCode: String(couponCode).toUpperCase() },
        {
          $set: {
            codeUsed: true,
            usedAt: new Date(),
            usedOnOrder: order._id,
          },
        }
      );
    }

    res.status(201).json(order);
  } catch (err: any) {
    console.error("[orders] create failed:", err);
    res.status(400).json({ message: err.message || "Failed to place order" });
  }
});

// Admin only
r.patch("/:id/status", requireAuth, requireAdmin, async (req, res) =>
  res.json(
    await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
  )
);

export default r;