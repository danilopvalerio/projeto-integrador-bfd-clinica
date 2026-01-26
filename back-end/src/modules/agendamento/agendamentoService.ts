import { AppError } from "../../shared/http/middlewares/error.middleware";
import { prisma } from "../../shared/database/prisma";
import {
  IAgendamentoRepository,
  CreateAgendamentoDTO,
  UpdateAgendamentoDTO,
  AgendamentoEntity,
  AgendamentoCalendarDTO,
} from "./agendamentoDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

export class AgendamentoService {
  constructor(private repository: IAgendamentoRepository) {}

  // Helper: Transforma a Entity do Banco no DTO amigável para o Front
  private mapToCalendarDTO(entity: AgendamentoEntity): AgendamentoCalendarDTO {
    const servicosPivot = entity.servicos;

    // 1. Valor Total: Soma do 'preco_cobrado' (histórico) salvo na tabela pivô
    const valorTotal = servicosPivot.reduce(
      (acc, curr) => acc + curr.preco_cobrado,
      0,
    );

    // 2. Duração Total: Soma das durações dos serviços (cadastro atual)
    const duracaoTotal = servicosPivot.reduce(
      (acc, curr) => acc + curr.servico.duracao_estimada,
      0,
    );

    // 3. Concatenação de nomes
    const nomesServicos =
      servicosPivot.length > 0
        ? servicosPivot.map((s) => s.servico.nome).join(" + ")
        : "Sem Serviço";

    // 4. Lógica de Cor (UI)
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

    const title = `${nomesServicos} • ${entity.paciente.nome.split(" ")[0]}`;

    return {
      id_agendamento: entity.id_agendamento,
      start: entity.data_hora_inicio.toISOString(),
      end: entity.data_hora_fim.toISOString(),
      status: entity.status,
      paciente: {
        id_paciente: entity.paciente.id_paciente,
        nome: entity.paciente.nome,
        cpf: entity.paciente.cpf,
        sexo: entity.paciente.sexo as string,
      },
      profissional: {
        id_profissional: entity.profissional.id_profissional,
        nome: entity.profissional.nome,
        registro_conselho: entity.profissional.registro_conselho,
        especialidades: entity.profissional.especialidades.map(
          (e) => e.especialidade.nome,
        ),
      },
      servico: {
        nomes: nomesServicos,
        duracao_total: duracaoTotal,
        valor_total: valorTotal,
      },
      ui: {
        color: colors[colorIndex],
        title: title,
      },
    };
  }

  async create(data: CreateAgendamentoDTO): Promise<AgendamentoCalendarDTO> {
    // 1. Validar existências
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

    // 2. Buscar Serviços para pegar PREÇO VIGENTE e DURAÇÃO
    const servicos = await prisma.servico.findMany({
      where: { id_servico: { in: data.ids_servicos } },
    });

    if (servicos.length !== data.ids_servicos.length) {
      throw new AppError("Serviços inválidos detectados", 400);
    }

    // 3. Preparar array de snapshot preservando a ordem
    const servicosData = data.ids_servicos.map((id) => {
      const s = servicos.find((item) => item.id_servico === id);
      return { id_servico: id, preco: s!.preco };
    });

    // 4. Calcular Data Fim (se não enviada)
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

    // 5. Verificar Conflito
    const isAvailable = await this.repository.checkAvailability(
      data.id_profissional,
      dataInicio,
      dataFimDate,
    );
    if (!isAvailable) throw new AppError("Horário indisponível", 409);

    // 6. Criar Agendamento (Usando método customizado do repo)
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

    // Valida Disponibilidade se mudar horário ou profissional
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

    // Se estiver atualizando os serviços, busca preços atuais novamente
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

  // Utiliza o RepositoryPaginatedResult indiretamente
  async listPaginated(page: number, limit: number) {
    const { data, total } = await this.repository.findPaginated(page, limit);
    return {
      data: data.map(this.mapToCalendarDTO),
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
        nome: true,
        cpf: true,
        sexo: true,
      },
    });

    if (!paciente) {
      throw new AppError(
        "Perfil de paciente não encontrado para este usuário.",
        404,
      );
    }

    // 2. Busca os agendamentos paginados
    const { data, total } = await this.repository.findByPersonPaginated(
      { id_paciente: paciente.id_paciente },
      page,
      limit,
    );

    // 3. Retorna estrutura composta: Perfil + Lista
    return {
      paciente: {
        nome: paciente.nome,
        cpf: paciente.cpf,
        sexo: paciente.sexo,
      },
      data: data.map((ag) => this.mapToCalendarDTO(ag)), // Formata cada agendamento
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
