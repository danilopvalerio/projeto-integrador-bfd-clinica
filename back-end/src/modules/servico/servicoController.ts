import { Request, Response } from "express";
import { ServicoService } from "./servicoService";

export class ServicoController {
  constructor(private servicoService: ServicoService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const servico = await this.servicoService.create(req.body);
    return res.status(201).json(servico);
  };

  findAll = async (_req: Request, res: Response): Promise<Response> => {
    const servicos = await this.servicoService.findAll();
    return res.json(servicos);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const servico = await this.servicoService.update(id, req.body);
    return res.json(servico);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const servico = await this.servicoService.getById(id);
    return res.json(servico);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    await this.servicoService.delete(id);
    return res.status(204).send();
  };

  listPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { page = 1, limit = 10 } = req.query;

    const result = await this.servicoService.listPaginated({
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { q, page = 1, limit = 10 } = req.query;

    const result = await this.servicoService.searchPaginated({
      query: String(q || ""),
      page: Number(page),
      limit: Number(limit),
    });

    return res.json(result);
  };

  // Rotas Profissionais vinculados
  addProfissional = async (req: Request, res: Response): Promise<Response> => {
    const { id_servico } = req.params;
    const { id_profissional } = req.body;
    const result = await this.servicoService.addProfissional(id_servico, id_profissional);
    return res.status(201).json(result);
  };

  listProfissionais = async (req: Request, res: Response): Promise<Response> => {
    const { id_servico } = req.params;
    const result = await this.servicoService.listProfissionais(id_servico);
    return res.json(result);
  };

  listProfissionaisPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { id_servico } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const result = await this.servicoService.listProfissionaisPaginated(id_servico, Number(page), Number(limit));
    return res.json(result);
  };

  searchProfissionaisPaginated = async (req: Request, res: Response): Promise<Response> => {
    const { id_servico } = req.params;
    const { q = "", page = 1, limit = 10 } = req.query;
    const result = await this.servicoService.searchProfissionaisPaginated(id_servico, String(q), Number(page), Number(limit));
    return res.json(result);
  };

  removeProfissional = async (req: Request, res: Response): Promise<Response> => {
    const { id_servico } = req.params;
    const id_profissional = req.body.id_profissional ?? req.query.id_profissional;
    await this.servicoService.removeProfissional(id_servico, String(id_profissional));
    return res.status(204).send();
  };

  syncProfissionais = async (req: Request, res: Response): Promise<Response> => {
    const { id_servico } = req.params;
    const { profissionalIds } = req.body;
    const result = await this.servicoService.syncProfissionais(id_servico, profissionalIds || []);
    return res.json(result);
  };
}