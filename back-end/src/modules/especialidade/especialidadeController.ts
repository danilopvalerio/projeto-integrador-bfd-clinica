import { Request, Response } from "express";
import { EspecialidadeService } from "./especialidadeService";


export class EspecialidadeController {
  constructor(private especialidadeService: EspecialidadeService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const especialidade = await this.especialidadeService.create(req.body);
    return res.status(201).json(especialidade);
  };

  findAll = async (_req: Request, res: Response): Promise<Response> => {
    const especialidades = await this.especialidadeService.findAll();
    return res.json(especialidades);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const especialidade = await this.especialidadeService.update(id, req.body);
    return res.json(especialidade);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const especialidade = await this.especialidadeService.getById(id);
    return res.json(especialidade);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.especialidadeService.delete(id);
    return res.status(204).send();
  };

  listPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query;

    const result = await this.especialidadeService.listPaginated({
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { q, page = 1, limit = 10 } = req.query;

    const result = await this.especialidadeService.searchPaginated({
      query: String(q),
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };
}
