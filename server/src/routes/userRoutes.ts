import { Router } from "express";
import User from "../models/User";
import Product from "../models/Product";
import { requireAuth, AuthRequest } from "../../middleware/auth";

const r = Router();

/* ── CART ─────────────────────────────────────────────── */

r.get("/cart", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).populate("cart.product");
  res.json(user?.cart || []);
});

r.put("/cart", requireAuth, async (req: AuthRequest, res) => {
  const { cart } = req.body;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ message: "cart must be an array" });
  }
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { cart },
    { new: true }
  ).populate("cart.product");
  res.json(user?.cart || []);
});

r.delete("/cart", requireAuth, async (req: AuthRequest, res) => {
  await User.findByIdAndUpdate(req.user!.id, { cart: [] });
  res.json({ ok: true });
});

/* ── WISHLIST ─────────────────────────────────────────── */

r.get("/wishlist", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).populate("wishlist");
  res.json(user?.wishlist || []);
});

r.put("/wishlist", requireAuth, async (req: AuthRequest, res) => {
  const { wishlist } = req.body;
  if (!Array.isArray(wishlist)) {
    return res.status(400).json({ message: "wishlist must be an array" });
  }
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { wishlist },
    { new: true }
  ).populate("wishlist");
  res.json(user?.wishlist || []);
});

export default r;