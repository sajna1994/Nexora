import { Router } from "express";
import Subscriber from "../models/Subscriber";
import { requireAuth, requireAdmin } from "../middleware/auth";
import crypto from "crypto";

const r = Router();

/* ── Public: subscribe from footer ──────────────────── */
r.post("/", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({ ok: true, message: "You're already subscribed" });
    }

    await Subscriber.create({ email });
    res.status(201).json({ ok: true, message: "Subscribed" });
  } catch (err) {
    console.error("[newsletter] subscribe failed:", err);
    res.status(500).json({ message: "Subscription failed" });
  }
});

/* ── Admin: list all subscribers ─────────────────────── */
r.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const list = await Subscriber.find().sort({ createdAt: -1 });
  res.json(list);
});

/* ── Admin: export as CSV ────────────────────────────── */
r.get("/export", requireAuth, requireAdmin, async (_req, res) => {
  const list = await Subscriber.find().sort({ createdAt: -1 });

  const rows = [
    ["Email", "Source", "Subscribed At"],
    ...list.map((s) => [
      s.email,
      (s as any).source || "footer",
      new Date((s as any).createdAt).toISOString(),
    ]),
  ];

  const csv = rows
    .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="nexora-subscribers-${Date.now()}.csv"`
  );
  res.send(csv);
});

/* ── Admin: delete a subscriber ──────────────────────── */
r.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await Subscriber.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
/* ── Helper: generate a short, friendly code ─────────── */
function generateCode() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
  return `WELCOME10-${suffix}`;
}

/* ── Public: subscribe from footer ──────────────────── */
r.post("/", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.json({
        ok: true,
        message: "You're already subscribed",
        code: existing.welcomeCode,
      });
    }

    const welcomeCode = generateCode();
    const sub = await Subscriber.create({ email, welcomeCode });

    res.status(201).json({
      ok: true,
      message: "Subscribed",
      code: sub.welcomeCode,
    });
  } catch (err) {
    console.error("[newsletter] subscribe failed:", err);
    res.status(500).json({ message: "Subscription failed" });
  }
});
export default r;