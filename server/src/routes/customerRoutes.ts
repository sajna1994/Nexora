import { Router } from "express";
import Order from "../models/Order";
import User from "../models/User";
import { requireAuth, requireAdmin } from "../middleware/auth";

const r = Router();

r.get("/", requireAuth, requireAdmin, async (_, res) => {
  const users = await User.find().select("-password");
  const orders = await Order.find();

  const withCounts = users.map((u) => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    orders: orders.filter((o) => String(o.user) === String(u._id)).length,
  }));

  res.json(withCounts);
});

export default r;