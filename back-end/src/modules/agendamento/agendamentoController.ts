import { Request, Response } from "express";
import { AgendamentoService } from "./agendamentoService";

export class AgendamentoController {
  constructor(private service: AgendamentoService) {}

  create = async (req: Request, res: Response) => {
    const data = { ...req.body };

    // Parse de datas
    if (data.data_hora_inicio)
      data.data_hora_inicio = new Date(data.data_hora_inicio);
    if (data.data_hora_fim) data.data_hora_fim = new Date(data.data_hora_fim);

    // Forçar array de serviços
    if (data.ids_servicos && !Array.isArray(data.ids_servicos)) {
      data.ids_servicos = [data.ids_servicos];
    }

    const result = await this.service.create(data);
    return res.status(201).json(result);
  };

  listMyAppointments = async (req: Request, res: Response) => {
    // Pega o ID do usuário do token (injetado pelo authMiddleware)
    // @ts-ignore
    const id_usuario = req.user?.userId || req.user?.sub;

    if (!id_usuario) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const { page = 1, limit = 10 } = req.query;

    const result = await this.service.listMyAppointments(
      id_usuario,
      Number(page),
      Number(limit),
    );

    return res.json(result);
  };

  update = async (req: Request, res: Response) => {
    const data = { ...req.body };
    if (data.data_hora_inicio)
      data.data_hora_inicio = new Date(data.data_hora_inicio);
    if (data.data_hora_fim) data.data_hora_fim = new Date(data.data_hora_fim);

    const result = await this.service.update(req.params.id, data);
    return res.json(result);
  };

  // Endpoint para o calendário
  listCalendar = async (req: Request, res: Response) => {
    const { start, end, id_profissional } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Start e End são obrigatórios" });
    }

    const result = await this.service.listByRange(
      String(start),
      String(end),
      id_profissional ? String(id_profissional) : undefined,
    );

    return res.json({ agendamentos: result });
  };

  // Endpoint para lista paginada (tabela administrativa)
  listPaginated = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await this.service.listPaginated(
      Number(page),
      Number(limit),
    );
    return res.json(result);
  };

  getById = async (req: Request, res: Response) => {
    const result = await this.service.getById(req.params.id);
    return res.json(result);
  };

  delete = async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    return res.status(204).send();
  };
}
