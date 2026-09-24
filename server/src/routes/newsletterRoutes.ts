import { Router } from "express";

const r = Router();
const subscribers: string[] = []; // swap for a Mongoose model later

r.post("/", (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (!subscribers.includes(email)) subscribers.push(email);
  res.json({ ok: true });
});

export default r;