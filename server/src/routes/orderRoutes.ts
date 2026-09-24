import { Router } from "express";
import Order from "../models/Order";
import { requireAuth, requireAdmin, AuthRequest } from "../../middleware/auth";

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
  const order = await Order.create({ ...req.body, user: req.user!.id });
  res.status(201).json(order);
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