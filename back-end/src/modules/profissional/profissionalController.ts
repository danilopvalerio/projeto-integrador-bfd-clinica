import { Request, Response } from "express";
import { ProfissionalService } from "./profissionalService";

export class ProfissionalController {
  constructor(private service: ProfissionalService) {}

  create = async (req: Request, res: Response) => {
    const result = await this.service.create(req.body);
    return res.status(201).json(result);
  };

  update = async (req: Request, res: Response) => {
    const result = await this.service.update(req.params.id, req.body);
    return res.json(result);
  };

  getById = async (req: Request, res: Response) => {
    const result = await this.service.getById(req.params.id);
    return res.json(result);
  };

  listPaginated = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await this.service.listPaginated({
      page: Number(page),
      limit: Number(limit),
    });
    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response) => {
    const { q = "", page = 1, limit = 10 } = req.query;
    const result = await this.service.searchPaginated({
      query: String(q),
      page: Number(page),
      limit: Number(limit),
    });
    return res.json(result);
  };

  delete = async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    return res.status(204).send();
  };

  // --- Telefones ---
  addTelefone = async (req: Request, res: Response) => {
    const resu = await this.service.addTelefone(
      req.params.id_profissional,
      req.body
    );
    return res.status(201).json(resu);
  };

  updateTelefone = async (req: Request, res: Response) => {
    const resu = await this.service.updateTelefone(
      req.params.id_telefone,
      req.body
    );
    return res.json(resu);
  };

  listTelefones = async (req: Request, res: Response) => {
    const resu = await this.service.listTelefones(req.params.id_profissional);
    return res.json(resu);
  };

  deleteTelefone = async (req: Request, res: Response) => {
    await this.service.deleteTelefone(req.params.id_telefone);
    return res.status(204).send();
  };

  // --- Horários ---
  addHorario = async (req: Request, res: Response) => {
    const resu = await this.service.addHorario(
      req.params.id_profissional,
      req.body
    );
    return res.status(201).json(resu);
  };

  updateHorario = async (req: Request, res: Response) => {
    const resu = await this.service.updateHorario(
      req.params.id_horario,
      req.body
    );
    return res.json(resu);
  };

  listHorarios = async (req: Request, res: Response) => {
    const resu = await this.service.listHorarios(req.params.id_profissional);
    return res.json(resu);
  };

  deleteHorario = async (req: Request, res: Response) => {
    await this.service.deleteHorario(req.params.id_horario);
    return res.status(204).send();
  };

  // --- Especialidades ---
  addEspecialidade = async (req: Request, res: Response) => {
    const { id_especialidade } = req.body;
    await this.service.addEspecialidade(
      req.params.id_profissional,
      id_especialidade
    );
    return res.status(201).send();
  };

  removeEspecialidade = async (req: Request, res: Response) => {
    const id_especialidade =
      req.body.id_especialidade ?? req.query.id_especialidade;
    await this.service.removeEspecialidade(
      req.params.id_profissional,
      String(id_especialidade)
    );
    return res.status(204).send();
  };

  listEspecialidades = async (req: Request, res: Response) => {
    const resu = await this.service.listEspecialidades(
      req.params.id_profissional
    );
    return res.json(resu);
  };

  listEspecialidadesPaginated = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const resu = await this.service.listEspecialidadesPaginated(
      req.params.id_profissional,
      Number(page),
      Number(limit)
    );
    return res.json(resu);
  };

  searchEspecialidadesPaginated = async (req: Request, res: Response) => {
    const { q = "", page = 1, limit = 10 } = req.query;
    const resu = await this.service.searchEspecialidadesPaginated(
      req.params.id_profissional,
      String(q),
      Number(page),
      Number(limit)
    );
    return res.json(resu);
  };

  syncEspecialidades = async (req: Request, res: Response) => {
    const { especialidadesIds } = req.body;
    const resu = await this.service.syncEspecialidades(
      req.params.id_profissional,
      especialidadesIds || []
    );
    return res.json(resu);
  };

  // --- Serviços ---
  addServico = async (req: Request, res: Response) => {
    const { id_servico } = req.body;
    const resu = await this.service.addServico(
      req.params.id_profissional,
      id_servico
    );
    return res.status(201).json(resu);
  };

  listServicos = async (req: Request, res: Response) => {
    const resu = await this.service.listServicos(req.params.id_profissional);
    return res.json(resu);
  };

  listServicosPaginated = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const resu = await this.service.listServicosPaginated(
      req.params.id_profissional,
      Number(page),
      Number(limit)
    );
    return res.json(resu);
  };

  searchServicosPaginated = async (req: Request, res: Response) => {
    const { q = "", page = 1, limit = 10 } = req.query;
    const resu = await this.service.searchServicosPaginated(
      req.params.id_profissional,
      String(q),
      Number(page),
      Number(limit)
    );
    return res.json(resu);
  };

  removeServico = async (req: Request, res: Response) => {
    const id_servico = req.body.id_servico ?? req.query.id_servico;
    await this.service.removeServico(
      req.params.id_profissional,
      String(id_servico)
    );
    return res.status(204).send();
  };

  syncServicos = async (req: Request, res: Response) => {
    const { servicoIds } = req.body;
    const resu = await this.service.syncServicos(
      req.params.id_profissional,
      servicoIds || []
    );
    return res.json(resu);
  };
}
