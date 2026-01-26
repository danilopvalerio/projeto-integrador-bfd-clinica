import { Router } from "express";
import { LogRepository } from "./logRepository";
import { LogService } from "./logService";
import { LogController } from "./logController";
// Importe seus middlewares existentes
import {
  authMiddleware,
  requireRole,
} from "../../shared/http/middlewares/auth.middleware";

const logRoutes = Router();
const controller = new LogController(new LogService(new LogRepository()));

// 1. Verifica se está logado
logRoutes.use(authMiddleware);

// 2. Verifica se tem permissão (Usando sua função existente)
logRoutes.use(requireRole(["GERENTE", "RECEPCIONISTA"]));

// Rotas
logRoutes.get("/all", controller.findAll);
logRoutes.get("/paginated", controller.listPaginated);
logRoutes.get("/search", controller.searchPaginated);

export { logRoutes };
