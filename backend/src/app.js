import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import calculateHandler from "../api/calculate.js";
import statsHandler from "../api/stats.js";

const app = express();

app.use(cors());
app.use(express.json());

// Bungkus handler serverless (req, res) supaya bisa dipakai di Express biasa.
// Ini SATU-SATUNYA tempat logic endpoint ditulis — lihat api/calculate.js dan api/stats.js
app.post("/api/calculate", (req, res) => calculateHandler(req, res));
app.get("/api/stats", (req, res) => statsHandler(req, res));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Steam Library Calculator API" });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});