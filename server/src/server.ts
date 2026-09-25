import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";
import uploadRoutes from "./routes/uploadRoutes";   // ← ADD
import couponRoutes from "./routes/couponRoutes";
import userRoutes from "./routes/userRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));  // ← ADD
app.get("/api/health", (_, res) =>
  res.json({ ok: true, service: "NEXORA API" })
);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/upload", uploadRoutes);   // ← ADD
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