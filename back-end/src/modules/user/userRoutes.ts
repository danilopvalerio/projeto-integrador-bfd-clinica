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

userRoutes.post("/", userController.create);
userRoutes.put("/:id", userController.update);

// Ordem importa: rotas específicas antes de :id
userRoutes.get("/search", userController.searchPaginated);
userRoutes.get("/:id", userController.getById);

userRoutes.delete("/:id", userController.delete);
userRoutes.get("/", userController.listPaginated);

export { userRoutes };
