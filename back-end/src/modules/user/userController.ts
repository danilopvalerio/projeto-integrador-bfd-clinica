// src/modules/user/userController.ts

import { Request, Response } from "express";
import { UserService } from "./userService";

export class UserController {
  constructor(private userService: UserService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const user = await this.userService.create(req.body);
    return res.status(201).json(user);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await this.userService.update(id, req.body);
    return res.json(user);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await this.userService.getById(id);
    return res.json(user);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.userService.delete(id);
    return res.status(204).send();
  };

  listPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query;

    const result = await this.userService.listPaginated({
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { q, page = 1, limit = 10 } = req.query;

    const result = await this.userService.searchPaginated({
      query: String(q),
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };
}
