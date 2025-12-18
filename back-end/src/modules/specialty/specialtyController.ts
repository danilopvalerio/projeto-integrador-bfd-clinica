import { Request, Response } from "express";
import { SpecialtyService } from "./specialtyService";

export class SpecialtyController {
  constructor(private specialtyService: SpecialtyService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const specialty = await this.specialtyService.create(req.body);
    return res.status(201).json(specialty);
  };

  findAll = async (_req: Request, res: Response): Promise<Response> => {
    const specialties = await this.specialtyService.findAll();
    return res.json(specialties);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const specialty = await this.specialtyService.update(id, req.body);
    return res.json(specialty);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const specialty = await this.specialtyService.getById(id);
    return res.json(specialty);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.specialtyService.delete(id);
    return res.status(204).send();
  };

  listPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query;

    const result = await this.specialtyService.listPaginated({
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { q, page = 1, limit = 10 } = req.query;

    const result = await this.specialtyService.searchPaginated({
      query: String(q),
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };
}
