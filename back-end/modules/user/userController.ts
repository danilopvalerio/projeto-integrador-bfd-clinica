import { Request, Response } from "express";
import { CreateUserService } from "./userService";

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const service = new CreateUserService();
      const user = await service.execute(req.body);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
