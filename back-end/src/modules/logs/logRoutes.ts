import { Router } from "express";
import { LogRepository } from "./logRepository";
import { LogService } from "./logService";
import { LogController } from "./logController";
import {
  authMiddleware,
  requireRole,
} from "../../shared/http/middlewares/auth.middleware";

const logRoutes = Router();
const controller = new LogController(new LogService(new LogRepository()));

/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: Visualização de logs do sistema
 */

logRoutes.use(authMiddleware);
logRoutes.use(requireRole(["GERENTE", "RECEPCIONISTA"]));

/**
 * @swagger
 * /logs/all:
 *   get:
 *     summary: Lista todos os logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 */
logRoutes.get("/all", controller.findAll);

/**
 * @swagger
 * /logs/paginated:
 *   get:
 *     summary: Lista logs paginados
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 */
logRoutes.get("/paginated", controller.listPaginated);

/**
 * @swagger
 * /logs/search:
 *   get:
 *     summary: Busca logs com filtros
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 */
logRoutes.get("/search", controller.searchPaginated);

export { logRoutes };
