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

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Controle de sessão e autenticação de usuários
 */

/**
 * @swagger
 * /sessions/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Autenticação]
 *     security: [{ bearerAuth: [] }]
 */
sessionRoutes.get("/profile", authMiddleware, sessionController.getProfile);

/**
 * @swagger
 * /sessions/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Autenticação]
 */
sessionRoutes.post("/login", sessionController.login);

/**
 * @swagger
 * /sessions/refresh:
 *   post:
 *     summary: Gera novo token de acesso usando refresh token
 *     tags: [Autenticação]
 */
sessionRoutes.post("/refresh", sessionController.refresh);

/**
 * @swagger
 * /sessions/logout:
 *   post:
 *     summary: Realiza logout do usuário
 *     tags: [Autenticação]
 *     security: [{ bearerAuth: [] }]
 */
sessionRoutes.post("/logout", sessionController.logout);

export { sessionRoutes };
