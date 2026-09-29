// ── 1. Load env vars FIRST, before any other imports ──
import dotenv from "dotenv";
dotenv.config();

// ── 2. Now import everything else ─────────────────────
import express from "express";
import uploadRoutes from "./routes/uploadRoutes";  
import cors from "cors";
import mongoose from "mongoose";
import path from "path";

import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";
import couponRoutes from "./routes/couponRoutes";
import userRoutes from "./routes/userRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowedExact = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ].filter(Boolean) as string[];

      if (allowedExact.includes(origin)) return callback(null, true);

      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/health", (_, res) =>
  res.json({ ok: true, service: "NEXORA API" })
);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);

const port = Number(process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nexora")
  .then(() =>
    app.listen(port, () => console.log(`NEXORA API running on ${port}`))
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });