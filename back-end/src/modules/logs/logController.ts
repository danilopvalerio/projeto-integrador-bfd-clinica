import { Request, Response } from "express";
import { LogService } from "./logService";

export class LogController {
  constructor(private logService: LogService) {}

  findAll = async (req: Request, res: Response) => {
    const logs = await this.logService.findAll();
    return res.json(logs);
  };

  listPaginated = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await this.logService.listPaginated(page, limit);
    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response) => {
    const { q, page, limit } = req.query;

    const result = await this.logService.searchPaginated(
      String(q || ""),
      Number(page) || 1,
      Number(limit) || 10,
    );
    return res.json(result);
  };
}
