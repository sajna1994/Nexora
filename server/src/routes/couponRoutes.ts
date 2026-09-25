import { Router } from "express";
import Subscriber from "../models/Subscriber";
import Order from "../models/Order";
import { requireAuth, AuthRequest } from "../../middleware/auth";

const r = Router();

/**
 * POST /api/coupons/validate
 * Body: { code, subtotal }
 * Returns: { valid, discount, code, message }
 */
r.post("/validate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const subtotal = Number(req.body?.subtotal || 0);

    if (!code) {
      return res.status(400).json({ valid: false, message: "Enter a code" });
    }

    const sub = await Subscriber.findOne({ welcomeCode: code });

    if (!sub) {
      return res
        .status(404)
        .json({ valid: false, message: "Invalid or unknown code" });
    }

    if (sub.codeUsed) {
      return res
        .status(409)
        .json({ valid: false, message: "This code has already been used" });
    }

    // Enforce "first order only": user shouldn't have any completed orders
    const existingOrders = await Order.find({
      user: req.user!.id,
      status: { $ne: "Cancelled" },
    });
    if (existingOrders.length > 0) {
      return res
        .status(403)
        .json({ valid: false, message: "Code is only valid on your first order" });
    }

    const discount = Math.round(subtotal * 0.1); // 10%

    res.json({
      valid: true,
      code,
      discount,
      message: `10% off — ₹${discount} saved`,
    });
  } catch (err) {
    console.error("[coupons] validate failed:", err);
    res.status(500).json({ valid: false, message: "Validation failed" });
  }
});

export default r;