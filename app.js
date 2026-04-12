import express from "express";
import portsRouter from "./routes/ports.routes.js";
import { errorHandler } from "./utils/apiError.js";

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Simple request logger — prints method and URL for every request
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health-check / welcome route
app.get("/", (_req, res) => {
  res.json({ message: "Ports API running" });
});

// Mount port routes under /ports
app.use("/ports", portsRouter);

// ─── 404 catch-all ───────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Global error handler ───────────────────────────────────────────────────

// ─── Start server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Ports API running on http://localhost:${PORT}`);
});
