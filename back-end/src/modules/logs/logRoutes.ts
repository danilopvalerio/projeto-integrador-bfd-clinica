import { Router } from "express";
import { LogController } from "./logController";

const logsRoutes = Router();
const controller = new LogController();

logsRoutes.get("/logs", controller.index);

export default logsRoutes;
