import { Router } from "express";
import {
  getAllPorts,
  getPortByCode,
  createPort,
  deletePort,
} from "../controllers/ports.controller.js";

const router = Router();

// GET /ports — list all ports with optional filtering and pagination
router.get("/", getAllPorts);

// GET /ports/:code — fetch a single port by its unlocode
router.get("/:code", getPortByCode);

// POST /ports — add a new port to the in-memory store
router.post("/", createPort);

// DELETE /ports/:code — remove a port by unlocode
router.delete("/:code", deletePort);

export default router;
