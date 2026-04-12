// Load port data from JSON file into memory at startup.
// All mutations (POST, DELETE) operate on this in-memory array —
// data resets to the original file contents on each server restart.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, "../data/ports.json");

// In-memory store — seeded once from the JSON file
let ports = JSON.parse(readFileSync(dataPath, "utf-8"));

// ─── Helpers ────────────────────────────────────────────────────────────────

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res, message, status) =>
  res.status(status).json({ success: false, error: message });

// ─── GET /ports ──────────────────────────────────────────────────────────────

export const getAllPorts = (req, res) => {
  const { country, status, port_role, page, limit } = req.query;

  let result = [...ports];

  // Filter by country — supports full name or partial match (case-insensitive)
  // e.g. ?country=india matches "INDIA", ?country=united matches both "UNITED STATES" and "UNITED KINGDOM"
  if (country) {
    result = result.filter((p) =>
      p.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  // Filter by status (e.g. "active" / "passive")
  if (status) {
    result = result.filter(
      (p) => p.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Filter by port_role — port_role is a plain string (e.g. "DESTINATION", "ORIGIN")
  if (port_role) {
    result = result.filter(
      (p) => p.port_role.toLowerCase() === port_role.toLowerCase()
    );
  }

  // Pagination — default: page 1, limit 10
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const total = result.length;
  const totalPages = Math.ceil(total / limitNum);
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  ok(res, {
    ports: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  });
};

// ─── GET /ports/:code ────────────────────────────────────────────────────────

export const getPortByCode = (req, res) => {
  const { code } = req.params;

  // unlocode comparison is case-insensitive
  const port = ports.find(
    (p) => p.unlocode.toLowerCase() === code.toLowerCase()
  );

  if (!port) {
    return fail(res, `Port with unlocode "${code}" not found`, 404);
  }

  ok(res, port);
};

// ─── POST /ports ─────────────────────────────────────────────────────────────

export const createPort = (req, res) => {
  const { unlocode, name, country } = req.body;

  // Validate required fields
  const missing = [];
  if (!unlocode) missing.push("unlocode");
  if (!name) missing.push("name");
  if (!country) missing.push("country");

  if (missing.length > 0) {
    return fail(
      res,
      `Missing required field(s): ${missing.join(", ")}`,
      400
    );
  }

  // Prevent duplicate unlocodes
  const exists = ports.some(
    (p) => p.unlocode.toLowerCase() === unlocode.toLowerCase()
  );
  if (exists) {
    return fail(
      res,
      `A port with unlocode "${unlocode}" already exists`,
      400
    );
  }

  const newPort = { ...req.body, unlocode: unlocode.toUpperCase() };
  ports.push(newPort);

  ok(res, newPort, 201);
};

// ─── DELETE /ports/:code ─────────────────────────────────────────────────────

export const deletePort = (req, res) => {
  const { code } = req.params;

  const index = ports.findIndex(
    (p) => p.unlocode.toLowerCase() === code.toLowerCase()
  );

  if (index === -1) {
    return fail(res, `Port with unlocode "${code}" not found`, 404);
  }

  const [removed] = ports.splice(index, 1);

  ok(res, { message: `Port "${removed.unlocode}" deleted successfully` });
};
