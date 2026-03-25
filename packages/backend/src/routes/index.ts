import { Router } from "express";
import statusRoutes from "./status.js";
import staffRoutes from "./staff.js";
import clientRoutes from "./clients.js";

const router = Router();

router.use("/status", statusRoutes);
router.use("/staff", staffRoutes);
router.use("/clients", clientRoutes);

export default router;

