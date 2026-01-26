import { prisma } from "../../shared/database/prisma";
import {
  IAgendamentoRepository,
  AgendamentoEntity,
  CreateAgendamentoDTO,
  UpdateAgendamentoDTO,
} from "./agendamentoDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";
import { StatusAgendamento } from "../../shared/database/generated/prisma/client";

export class AgendamentoRepository implements IAgendamentoRepository {
  // Include padrão para trazer as relações necessárias
  private defaultInclude = {
    paciente: {
      select: { id_paciente: true, nome: true, cpf: true, sexo: true },
    },
    profissional: {
      include: {
        especialidades: { include: { especialidade: true } },
      },
    },
    servicos: {
      include: {
        servico: true, // Traz detalhes do serviço (nome, duração) além dos dados da pivô
      },
      orderBy: {
        ordem: "asc" as const,
      },
    },
  };

  // --- CREATE COM LOGICA DE SNAPSHOT DE PREÇO ---
  async createWithServices(
    data: CreateAgendamentoDTO,
    servicosData: { id_servico: string; preco: number }[],
  ): Promise<AgendamentoEntity> {
    if (!data.data_hora_fim)
      throw new Error("Data fim é obrigatória para persistência.");

    const result = await prisma.agendamento.create({
      data: {
        id_profissional: data.id_profissional,
        id_paciente: data.id_paciente,
        data_hora_inicio: data.data_hora_inicio,
        data_hora_fim: data.data_hora_fim,
        observacoes: data.observacoes,
        status: StatusAgendamento.PENDENTE,

        // Criação na tabela Pivô (AgendamentoServico)
        servicos: {
          create: servicosData.map((s, index) => ({
            id_servico: s.id_servico,
            preco_cobrado: s.preco, // Salva o preço ATUAL como histórico
            ordem: index,
          })),
        },
      },
      include: this.defaultInclude,
    });

    return result as unknown as AgendamentoEntity;
  }

  // Override do create padrão para forçar o uso do createWithServices
  async create(data: CreateAgendamentoDTO): Promise<AgendamentoEntity> {
    throw new Error(
      "Utilize createWithServices para garantir a integridade dos preços.",
    );
  }

  // --- UPDATE COM LOGICA DE N:N ---
  async updateWithServices(
    id: string,
    data: UpdateAgendamentoDTO,
    novosServicosData?: { id_servico: string; preco: number }[],
  ): Promise<AgendamentoEntity> {
    const updateData: any = {
      id_profissional: data.id_profissional,
      data_hora_inicio: data.data_hora_inicio,
      data_hora_fim: data.data_hora_fim,
      status: data.status,
      observacoes: data.observacoes,
    };

    // Se houve alteração nos serviços, substitui as relações na tabela pivô
    if (novosServicosData) {
      updateData.servicos = {
        deleteMany: {}, // Remove vínculos antigos
        create: novosServicosData.map((s, index) => ({
          id_servico: s.id_servico,
          preco_cobrado: s.preco, // Atualiza com o preço vigente
          ordem: index,
        })),
      };
    }

    const result = await prisma.agendamento.update({
      where: { id_agendamento: id },
      data: updateData,
      include: this.defaultInclude,
    });
    return result as unknown as AgendamentoEntity;
  }

  async update(
    id: string,
    data: UpdateAgendamentoDTO,
  ): Promise<AgendamentoEntity> {
    return this.updateWithServices(id, data);
  }

  async findById(id: string): Promise<AgendamentoEntity | null> {
    const result = await prisma.agendamento.findUnique({
      where: { id_agendamento: id },
      include: this.defaultInclude,
    });
    return result as unknown as AgendamentoEntity | null;
  }

  async delete(id: string): Promise<void> {
    await prisma.agendamento.delete({ where: { id_agendamento: id } });
  }

  // --- PAGINAÇÃO (Usando RepositoryPaginatedResult) ---

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<AgendamentoEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.agendamento.findMany({
        skip,
        take: limit,
        orderBy: { data_hora_inicio: "desc" },
        include: this.defaultInclude,
      }),
      prisma.agendamento.count(),
    ]);

    // Retorno estritamente tipado
    return {
      data: data as unknown as AgendamentoEntity[],
      total,
    };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<AgendamentoEntity>> {
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        {
          paciente: { nome: { contains: query, mode: "insensitive" as const } },
        },
        {
          profissional: {
            nome: { contains: query, mode: "insensitive" as const },
          },
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        skip,
        take: limit,
        orderBy: { data_hora_inicio: "desc" },
        include: this.defaultInclude,
      }),
      prisma.agendamento.count({ where }),
    ]);

    return {
      data: data as unknown as AgendamentoEntity[],
      total,
    };
  }

  // --- ESPECÍFICOS DE AGENDAMENTO ---

  async checkAvailability(
    id_profissional: string,
    inicio: Date,
    fim: Date,
    excludeAgendamentoId?: string,
  ): Promise<boolean> {
    const conflito = await prisma.agendamento.findFirst({
      where: {
        id_profissional,
        status: { not: StatusAgendamento.CANCELADO }, // Ignora cancelados
        AND: [
          { data_hora_inicio: { lt: fim } }, // Começa antes do novo terminar
          { data_hora_fim: { gt: inicio } }, // Termina depois do novo começar
        ],
        // Se for update, exclui o próprio ID da verificação
        ...(excludeAgendamentoId
          ? { id_agendamento: { not: excludeAgendamentoId } }
          : {}),
      },
    });
    return !conflito;
  }
  async findByPersonPaginated(
    filter: { id_paciente?: string; id_profissional?: string },
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<AgendamentoEntity>> {
    const skip = (page - 1) * limit;

    // Constrói o where dinamicamente
    const where: any = {};
    if (filter.id_paciente) where.id_paciente = filter.id_paciente;
    if (filter.id_profissional) where.id_profissional = filter.id_profissional;

    const [data, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        skip,
        take: limit,
        // Garante ordenação decrescente (mais recente primeiro)
        orderBy: { data_hora_inicio: "desc" },
        include: this.defaultInclude,
      }),
      prisma.agendamento.count({ where }),
    ]);

    return {
      data: data as unknown as AgendamentoEntity[],
      total,
    };
  }
  async findByDateRange(
    inicio: Date,
    fim: Date,
    filters?: { id_profissional?: string },
  ): Promise<AgendamentoEntity[]> {
    const where: any = {
      data_hora_inicio: { gte: inicio, lte: fim },
      status: { not: StatusAgendamento.CANCELADO },
    };

    if (filters?.id_profissional) {
      where.id_profissional = filters.id_profissional;
    }

    const result = await prisma.agendamento.findMany({
      where,
      orderBy: { data_hora_inicio: "asc" },
      include: this.defaultInclude,
    });
    return result as unknown as AgendamentoEntity[];
  }
}
