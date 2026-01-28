import { AppError } from "../../shared/http/middlewares/error.middleware";
import { prisma } from "../../shared/database/prisma";
import {
  IAgendamentoRepository,
  CreateAgendamentoDTO,
  UpdateAgendamentoDTO,
  AgendamentoEntity,
  AgendamentoCalendarDTO,
} from "./agendamentoDTO";

export class AgendamentoService {
  constructor(private repository: IAgendamentoRepository) {}

  // --- MÉTODO ATUALIZADO ---
  // Helper: Transforma a Entity do Banco no DTO amigável para o Front
  private mapToCalendarDTO(entity: AgendamentoEntity): AgendamentoCalendarDTO {
    const servicosPivot = entity.servicos;

    const valorTotal = servicosPivot.reduce(
      (acc, curr) => acc + curr.preco_cobrado,
      0,
    );

    const duracaoTotal = servicosPivot.reduce(
      (acc, curr) => acc + curr.servico.duracao_estimada,
      0,
    );

    const nomesServicos =
      servicosPivot.length > 0
        ? servicosPivot.map((s) => s.servico.nome).join(" + ")
        : "Sem Serviço";

    // NOVO: Mapeia os itens detalhados para o modal de edição
    const itensServico = servicosPivot.map((s) => ({
      id_servico: s.servico.id_servico,
      nome: s.servico.nome,
      preco: s.preco_cobrado,
    }));

    const firstServiceName = servicosPivot[0]?.servico.nome || "Default";
    const colors = [
      "#4CAF50",
      "#2196F3",
      "#9C27B0",
      "#FF9800",
      "#F44336",
      "#009688",
    ];
    const colorIndex = firstServiceName.charCodeAt(0) % colors.length;

    // Acessa o nome através de usuario (conforme seu repositório atualizado)
    const nomePaciente = entity.paciente.usuario?.nome || "Paciente";
    const nomeProfissional =
      entity.profissional.usuario?.nome || "Profissional";

    const title = `${nomesServicos} • ${nomePaciente.split(" ")[0]}`;

    return {
      id_agendamento: entity.id_agendamento,
      start: entity.data_hora_inicio.toISOString(),
      end: entity.data_hora_fim.toISOString(),
      status: entity.status,
      paciente: {
        id_paciente: entity.paciente.id_paciente,
        nome: nomePaciente,
        cpf: entity.paciente.cpf,
        sexo: entity.paciente.sexo as string,
      },
      profissional: {
        id_profissional: entity.profissional.id_profissional,
        nome: nomeProfissional,
        registro_conselho: entity.profissional.registro_conselho,
        especialidades: entity.profissional.especialidades.map(
          (e) => e.especialidade.nome,
        ),
      },
      servico: {
        nomes: nomesServicos,
        duracao_total: duracaoTotal,
        valor_total: valorTotal,
        itens: itensServico, // <--- CAMPO ADICIONADO AQUI
      },
      ui: {
        color: colors[colorIndex],
        title: title,
      },
    };
  }

  // --- MÉTODOS PÚBLICOS (Mantidos iguais, usando o mapToCalendarDTO atualizado) ---

  async create(data: CreateAgendamentoDTO): Promise<AgendamentoCalendarDTO> {
    // Validar existências
    const profissional = await prisma.profissional.findUnique({
      where: { id_profissional: data.id_profissional },
    });
    if (!profissional) throw new AppError("Profissional não encontrado", 404);

    const paciente = await prisma.paciente.findUnique({
      where: { id_paciente: data.id_paciente },
    });
    if (!paciente) throw new AppError("Paciente não encontrado", 404);

    if (!data.ids_servicos || data.ids_servicos.length === 0) {
      throw new AppError("Selecione ao menos um serviço", 400);
    }

    // Buscar Serviços
    const servicos = await prisma.servico.findMany({
      where: { id_servico: { in: data.ids_servicos } },
    });

    if (servicos.length !== data.ids_servicos.length) {
      throw new AppError("Serviços inválidos detectados", 400);
    }

    const servicosData = data.ids_servicos.map((id) => {
      const s = servicos.find((item) => item.id_servico === id);
      return { id_servico: id, preco: s!.preco };
    });

    // Calcular Data Fim
    let dataFim = data.data_hora_fim;
    if (!dataFim) {
      const duracaoTotalMinutos = servicos.reduce(
        (acc, s) => acc + s.duracao_estimada,
        0,
      );
      const inicio = new Date(data.data_hora_inicio);
      dataFim = new Date(inicio.getTime() + duracaoTotalMinutos * 60000);
    }

    const dataInicio = new Date(data.data_hora_inicio);
    const dataFimDate = new Date(dataFim);

    if (dataFimDate <= dataInicio) throw new AppError("Data fim inválida", 400);

    // Verificar Conflito
    const isAvailable = await this.repository.checkAvailability(
      data.id_profissional,
      dataInicio,
      dataFimDate,
    );
    if (!isAvailable) throw new AppError("Horário indisponível", 409);

    // Criar Agendamento
    const agendamento = await this.repository.createWithServices(
      { ...data, data_hora_inicio: dataInicio, data_hora_fim: dataFimDate },
      servicosData,
    );

    return this.mapToCalendarDTO(agendamento);
  }

  async update(
    id: string,
    data: UpdateAgendamentoDTO,
  ): Promise<AgendamentoCalendarDTO> {
    const current = await this.repository.findById(id);
    if (!current) throw new AppError("Agendamento não encontrado", 404);

    if (data.data_hora_inicio || data.data_hora_fim || data.id_profissional) {
      const novoProf = data.id_profissional || current.id_profissional;
      const novoIni = data.data_hora_inicio
        ? new Date(data.data_hora_inicio)
        : current.data_hora_inicio;
      const novoFim = data.data_hora_fim
        ? new Date(data.data_hora_fim)
        : current.data_hora_fim;

      const ok = await this.repository.checkAvailability(
        novoProf,
        novoIni,
        novoFim,
        id,
      );
      if (!ok) throw new AppError("Conflito de horário", 409);
    }

    let novosServicosData = undefined;

    if (data.ids_servicos) {
      const servicos = await prisma.servico.findMany({
        where: { id_servico: { in: data.ids_servicos } },
      });
      if (servicos.length !== data.ids_servicos.length)
        throw new AppError("Serviços inválidos", 400);

      novosServicosData = data.ids_servicos.map((id) => {
        const s = servicos.find((item) => item.id_servico === id);
        return { id_servico: id, preco: s!.preco };
      });
    }

    const updated = await this.repository.updateWithServices(
      id,
      data,
      novosServicosData,
    );
    return this.mapToCalendarDTO(updated);
  }

  async listByRange(
    inicioStr: string,
    fimStr: string,
    id_profissional?: string,
  ): Promise<AgendamentoCalendarDTO[]> {
    const inicio = new Date(inicioStr);
    const fim = new Date(fimStr);
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime()))
      throw new AppError("Datas inválidas", 400);

    const result = await this.repository.findByDateRange(inicio, fim, {
      id_profissional,
    });
    return result.map((ag) => this.mapToCalendarDTO(ag));
  }

  async listPaginated(page: number, limit: number) {
    const { data, total } = await this.repository.findPaginated(page, limit);
    return {
      data: data.map((ag) => this.mapToCalendarDTO(ag)),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const ag = await this.repository.findById(id);
    if (!ag) throw new AppError("Não encontrado", 404);
    return this.mapToCalendarDTO(ag);
  }

  async delete(id: string) {
    const ag = await this.repository.findById(id);
    if (!ag) throw new AppError("Não encontrado", 404);
    await this.repository.delete(id);
  }

  async listMyAppointments(id_usuario: string, page: number, limit: number) {
    // 1. Busca os dados do paciente vinculado ao usuário
    const paciente = await prisma.paciente.findUnique({
      where: { id_usuario },
      select: {
        id_paciente: true,
        cpf: true,
        sexo: true,
        usuario: { select: { nome: true } },
      },
    });

    if (!paciente) {
      throw new AppError(
        "Perfil de paciente não encontrado para este usuário.",
        404,
      );
    }

    const { data, total } = await this.repository.findByPersonPaginated(
      { id_paciente: paciente.id_paciente },
      page,
      limit,
    );

    return {
      paciente: {
        nome: paciente.usuario.nome,
        cpf: paciente.cpf,
        sexo: paciente.sexo,
      },
      data: data.map((ag) => this.mapToCalendarDTO(ag)),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
