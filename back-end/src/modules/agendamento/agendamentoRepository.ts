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
  // Include padrão ATUALIZADO para buscar nomes em Usuario
  private defaultInclude = {
    paciente: {
      select: {
        id_paciente: true,
        cpf: true,
        sexo: true,
        usuario: { select: { nome: true } }, // <--- Include do nome aqui
      },
    },
    profissional: {
      select: {
        id_profissional: true,
        registro_conselho: true,
        usuario: { select: { nome: true } }, // <--- Include do nome aqui
        especialidades: { include: { especialidade: true } },
      },
    },
    servicos: {
      include: {
        servico: true,
      },
      orderBy: {
        ordem: "asc" as const,
      },
    },
  };

  // --- CREATE ---
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

        servicos: {
          create: servicosData.map((s, index) => ({
            id_servico: s.id_servico,
            preco_cobrado: s.preco,
            ordem: index,
          })),
        },
      },
      include: this.defaultInclude,
    });

    return result as unknown as AgendamentoEntity;
  }

  async create(data: CreateAgendamentoDTO): Promise<AgendamentoEntity> {
    throw new Error(
      "Utilize createWithServices para garantir a integridade dos preços.",
    );
  }

  // --- UPDATE ---
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

    if (novosServicosData) {
      updateData.servicos = {
        deleteMany: {},
        create: novosServicosData.map((s, index) => ({
          id_servico: s.id_servico,
          preco_cobrado: s.preco,
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

  // --- PAGINAÇÃO ---

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

    // ATUALIZADO: Busca nome dentro de usuario
    const where = {
      OR: [
        {
          paciente: {
            usuario: {
              nome: { contains: query, mode: "insensitive" as const },
            },
          },
        },
        {
          profissional: {
            usuario: {
              nome: { contains: query, mode: "insensitive" as const },
            },
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
        status: { not: StatusAgendamento.CANCELADO },
        AND: [
          { data_hora_inicio: { lt: fim } },
          { data_hora_fim: { gt: inicio } },
        ],
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

    const where: any = {};
    if (filter.id_paciente) where.id_paciente = filter.id_paciente;
    if (filter.id_profissional) where.id_profissional = filter.id_profissional;

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
