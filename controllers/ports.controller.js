import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// One shared instance for the lifetime of the server process
const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

const ok = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });

const fail = (res, message, status) =>
  res.status(status).json({ success: false, error: message });

// ─── GET /ports ──────────────────────────────────────────────────────────────

export const getAllPorts = async (req, res) => {
  const { country, status, port_role, page, limit } = req.query;

  // Build the Prisma `where` filter from query params
  const where = {};

  if (country) {
    where.country = { contains: country, mode: "insensitive" };
  }
  if (status) {
    where.status = { equals: status, mode: "insensitive" };
  }
  if (port_role) {
    where.port_role = { equals: port_role, mode: "insensitive" };
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Run count and data fetch in parallel
  const [total, ports] = await Promise.all([
    prisma.port.count({ where }),
    prisma.port.findMany({ where, skip, take: limitNum }),
  ]);

  ok(res, {
    ports,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

// ─── GET /ports/:code ────────────────────────────────────────────────────────

export const getPortByCode = async (req, res) => {
  const { code } = req.params;

  const port = await prisma.port.findUnique({
    where: { unlocode: code.toUpperCase() },
  });

  if (!port) {
    return fail(res, `Port with unlocode "${code}" not found`, 404);
  }

  ok(res, port);
};

// ─── POST /ports ─────────────────────────────────────────────────────────────

export const createPort = async (req, res) => {
  const { unlocode, name, country, port_role, status = "active" } = req.body;

  // Validate required fields
  const missing = [];
  if (!unlocode) missing.push("unlocode");
  if (!name) missing.push("name");
  if (!country) missing.push("country");
  if (!port_role) missing.push("port_role");

  if (missing.length > 0) {
    return fail(res, `Missing required field(s): ${missing.join(", ")}`, 400);
  }

  try {
    const newPort = await prisma.port.create({
      data: { unlocode: unlocode.toUpperCase(), name, country, port_role, status },
    });
    ok(res, newPort, 201);
  } catch (e) {
    // P2002 = unique constraint violation (duplicate unlocode)
    if (e.code === "P2002") {
      return fail(res, `A port with unlocode "${unlocode}" already exists`, 400);
    }
    throw e;
  }
};

// ─── DELETE /ports/:code ─────────────────────────────────────────────────────

export const deletePort = async (req, res) => {
  const { code } = req.params;

  try {
    const removed = await prisma.port.delete({
      where: { unlocode: code.toUpperCase() },
    });
    ok(res, { message: `Port "${removed.unlocode}" deleted successfully` });
  } catch (e) {
    // P2025 = record not found
    if (e.code === "P2025") {
      return fail(res, `Port with unlocode "${code}" not found`, 404);
    }
    throw e;
  }
};
