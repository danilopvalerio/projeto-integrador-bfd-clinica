import { Router } from "express";
import { UserController } from "./userController";

const router = Router();
const controller = new UserController();

router.post("/", (req, res) => controller.create(req, res));

export { router as userRoutes };
