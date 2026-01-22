import { Router } from "express";
import { SessionRepository } from "./sessionRepository";
import { UserRepository } from "../user/userRepository";
import { SessionService } from "./sessionService";
import { SessionController } from "./sessionController";
import { authMiddleware } from "../../shared/http/middlewares/auth.middleware";
import { LogRepository } from "../logs/logRepository";
import { LogService } from "../logs/logService";


const logRepo = new LogRepository();
const logService = new LogService(logRepo);


const sessionRoutes = Router();

// Injeção de Dependência Manual
const sessionRepo = new SessionRepository();
const userRepo = new UserRepository();

// Injetamos ambos os repositórios no service
const sessionService = new SessionService(sessionRepo, userRepo);
const sessionController = new SessionController(sessionService, logService);

sessionRoutes.get("/profile", authMiddleware, sessionController.getProfile);
sessionRoutes.post("/login", sessionController.login);
sessionRoutes.post("/refresh", sessionController.refresh);
sessionRoutes.post("/logout", sessionController.logout);

export { sessionRoutes };
