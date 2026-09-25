import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import Subscriber from "../models/Subscriber";
import { requireAuth, requireAdmin } from "../../middleware/auth";

const r = Router();

/* ── Helper: parse range from query ─────────────────── */
function resolveRange(query: any) {
  const from = query.from ? new Date(String(query.from)) : null;
  const to = query.to ? new Date(String(query.to)) : null;

  if (from && to) return { from, to };

  // Fallback: last 30 days
  const now = new Date();
  const thirtyAgo = new Date();
  thirtyAgo.setDate(now.getDate() - 29);
  thirtyAgo.setHours(0, 0, 0, 0);
  return { from: thirtyAgo, to: now };
}
r.get("/comparison", requireAuth, requireAdmin, async (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const yStart = new Date(todayStart);
  yStart.setDate(yStart.getDate() - 1);
  const yEnd = new Date(todayStart.getTime() - 1);

  const [today] = await Order.aggregate([
    { $match: { createdAt: { $gte: todayStart }, status: { $ne: "Cancelled" } } },
    { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
  ]);

  const [yesterday] = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: yStart, $lte: yEnd },
        status: { $ne: "Cancelled" },
      },
    },
    { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
  ]);

  const tRev = today?.revenue || 0;
  const yRev = yesterday?.revenue || 0;
  const growth = yRev === 0 ? 100 : ((tRev - yRev) / yRev) * 100;

  res.json({
    today: { revenue: tRev, orders: today?.orders || 0 },
    yesterday: { revenue: yRev, orders: yesterday?.orders || 0 },
    growth: Number(growth.toFixed(1)),
  });
});
/* ── OVERVIEW: all KPIs for the given range ─────────── */
r.get("/overview", requireAuth, requireAdmin, async (req, res) => {
  const { from, to } = resolveRange(req.query);

  const [orderAgg] = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total" },
        gross: { $sum: "$subtotal" },
        discounts: { $sum: "$discount" },
        orders: { $sum: 1 },
        items: { $sum: { $sum: "$items.quantity" } },
      },
    },
  ]);

  const totalCustomers = await User.countDocuments({ role: "customer" });
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalSubscribers = await Subscriber.countDocuments();

  const revenue = orderAgg?.revenue || 0;
  const orders = orderAgg?.orders || 0;
  const aov = orders > 0 ? Math.round(revenue / orders) : 0;

  res.json({
    revenue,
    gross: orderAgg?.gross || 0,
    discounts: orderAgg?.discounts || 0,
    orders,
    items: orderAgg?.items || 0,
    aov,
    customers: totalCustomers,
    products: totalProducts,
    subscribers: totalSubscribers,
    range: { from, to },
  });
});

/* ── TIMELINE: revenue per day (or month, if range > 90d) */
r.get("/timeline", requireAuth, requireAdmin, async (req, res) => {
  const { from, to } = resolveRange(req.query);
  const days = Math.ceil((+to - +from) / (1000 * 60 * 60 * 24));
  const isLongRange = days > 90;
  const groupBy = isLongRange
    ? { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }
    : {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };

  const rows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);

  const points = rows.map((r) => {
    const { year, month, day } = r._id;
    const d = isLongRange
      ? new Date(year, month - 1, 1)
      : new Date(year, month - 1, day);
    return {
      date: d.toISOString().slice(0, 10),
      label: isLongRange
        ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
        : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      revenue: r.revenue,
      orders: r.orders,
    };
  });

  res.json(points);
});

/* ── MONTHLY: last 12 months of revenue + orders ────── */
r.get("/monthly", requireAuth, requireAdmin, async (_req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const rows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start },
        status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Fill empty months with zeros
  const points: any[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const match = rows.find(
      (r) => r._id.year === d.getFullYear() && r._id.month === d.getMonth() + 1
    );
    points.push({
      date: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      revenue: match?.revenue || 0,
      orders: match?.orders || 0,
    });
  }

  res.json(points);
});

/* ── YEARLY: revenue per year ───────────────────────── */
r.get("/yearly", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await Order.aggregate([
    { $match: { status: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1 } },
  ]);

  res.json(
    rows.map((r) => ({
      date: String(r._id.year),
      label: String(r._id.year),
      revenue: r.revenue,
      orders: r.orders,
    }))
  );
});

/* ── TOP PRODUCTS: best sellers in the range ────────── */
r.get("/top-products", requireAuth, requireAdmin, async (req, res) => {
  const { from, to } = resolveRange(req.query);

  const rows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        status: { $ne: "Cancelled" },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        units: { $sum: "$items.quantity" },
        revenue: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $project: {
        name: 1,
        units: 1,
        revenue: 1,
        image: { $arrayElemAt: ["$product.images", 0] },
      },
    },
  ]);

  res.json(rows);
});

/* ── CATEGORY BREAKDOWN ─────────────────────────────── */
r.get("/categories", requireAuth, requireAdmin, async (req, res) => {
  const { from, to } = resolveRange(req.query);

  const rows = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: from, $lte: to },
        status: { $ne: "Cancelled" },
      },
    },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: "$category._id",
        name: { $first: { $ifNull: ["$category.name", "Uncategorized"] } },
        revenue: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        },
        units: { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.json(rows);
});

/* ── STATUS BREAKDOWN ───────────────────────────────── */
r.get("/statuses", requireAuth, requireAdmin, async (req, res) => {
  const { from, to } = resolveRange(req.query);

  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json(
    rows.map((r) => ({ status: r._id, count: r.count, revenue: r.revenue }))
  );
});

/* ── RECENT ORDERS: quick preview table ─────────────── */
r.get("/recent-orders", requireAuth, requireAdmin, async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(orders);
});

r.get("/export", requireAuth, requireAdmin, async (req, res) => {
  const { from, to } = resolveRange(req.query);

  const orders = await Order.find({
    createdAt: { $gte: from, $lte: to },
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  const rows = [
    [
      "Order ID",
      "Date",
      "Customer",
      "Email",
      "Items",
      "Subtotal",
      "Discount",
      "Coupon",
      "Total",
      "Status",
      "Payment",
    ],
    ...orders.map((o) => [
      String(o._id),
      new Date((o as any).createdAt).toISOString(),
      (o.user as any)?.name || "Guest",
      (o.user as any)?.email || "",
      o.items.reduce((s, i) => s + i.quantity, 0),
      o.subtotal || 0,
      o.discount || 0,
      o.couponCode || "",
      o.total,
      o.status,
      o.paymentMethod || "",
    ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="nexora-report-${Date.now()}.csv"`
  );
  res.send(csv);
});
export default r;