import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import calculateHandler from "../api/calculate.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/calculate", (req, res) => calculateHandler(req, res));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Steam Library Calculator API" });
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});