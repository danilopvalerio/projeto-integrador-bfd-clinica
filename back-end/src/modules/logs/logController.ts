import { Request, Response } from "express";
import { LogRepository } from "./logRepository";

export class LogController {
  async index(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 5;

    const repo = new LogRepository();

    const { data, total } = await repo.findAll({
      page,
      perPage,
    });

    return res.json({
      data,
      page,
      totalPages: Math.ceil(total / perPage),
    });
  }
}
