import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import orderRoutes from "./routes/orderRoutes";
import authRoutes from "./routes/authRoutes";
dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/api/health", (_, res) =>
  res.json({ ok: true, service: "NEXORA API" }),
);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
const port = Number(process.env.PORT || 5000);
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nexora")
  .then(() =>
    app.listen(port, () => console.log(`NEXORA API running on ${port}`)),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
