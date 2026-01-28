// src/modules/user/userRoutes.ts

import { Router } from "express";
import { UserRepository } from "./userRepository";
import { UserService } from "./userService";
import { UserController } from "./userController";

const userRoutes = Router();

// Injeção de Dependência Manual (Composition Root)
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gestão de usuários do sistema
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Criar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.post("/", userController.create);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.get("/", userController.findAll);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Buscar usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.get("/search", userController.searchPaginated);

/**
 * @swagger
 * /users/paginated:
 *   get:
 *     summary: Listar usuários paginados
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.get("/paginated", userController.listPaginated);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.get("/:id", userController.getById);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.patch("/:id", userController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remover usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 */
userRoutes.delete("/:id", userController.delete);

export { userRoutes };
