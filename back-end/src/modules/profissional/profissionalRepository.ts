import { prisma } from "../../shared/database/prisma";
import {
  IProfissionalRepository,
  ProfissionalEntity,
  CreateProfissionalDTO,
  UpdateProfissionalDTO,
  UpdateHorarioDTO,
  UpdateTelefoneDTO,
} from "./profissionalDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";
import type { ServicoEntity } from "../servico/servicoDTO";
import type { EspecialidadeEntity } from "../especialidade/especialidadeDTO";

export class ProfissionalRepository implements IProfissionalRepository {
  // --- CRUD BASE ---

  async create(data: CreateProfissionalDTO): Promise<ProfissionalEntity> {
    const { telefones, horarios, nome, cpf, registro_conselho, id_usuario } =
      data;

    const profissional = await prisma.profissional.create({
      data: {
        nome,
        cpf,
        registro_conselho,
        id_usuario,
        telefones: telefones
          ? {
              create: telefones.map((tel) => ({
                telefone: tel.telefone,
                principal: tel.principal ?? false,
              })),
            }
          : undefined,
        horarios: horarios
          ? {
              create: horarios.map((h) => ({
                dia_semana: h.dia_semana,
                hora_inicio: h.hora_inicio,
                hora_fim: h.hora_fim,
              })),
            }
          : undefined,
      },
    });
    return profissional as unknown as ProfissionalEntity;
  }

  async findById(id: string): Promise<ProfissionalEntity | null> {
    return (await prisma.profissional.findUnique({
      where: { id_profissional: id },
    })) as unknown as ProfissionalEntity | null;
  }

  async findByCpf(cpf: string): Promise<ProfissionalEntity | null> {
    return (await prisma.profissional.findUnique({
      where: { cpf },
    })) as unknown as ProfissionalEntity | null;
  }

  async update(
    id: string,
    data: UpdateProfissionalDTO
  ): Promise<ProfissionalEntity> {
    const res = await prisma.profissional.update({
      where: { id_profissional: id },
      data,
    });
    return res as unknown as ProfissionalEntity;
  }

  async delete(id: string): Promise<void> {
    await prisma.profissional.delete({ where: { id_profissional: id } });
  }

  async findPaginated(
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ProfissionalEntity>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.profissional.findMany({
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.profissional.count(),
    ]);
    return { data: data as unknown as ProfissionalEntity[], total };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ProfissionalEntity>> {
    const skip = (page - 1) * limit;
    const whereCondition = {
      OR: [
        { nome: { contains: query, mode: "insensitive" as const } },
        { cpf: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.profissional.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.profissional.count({ where: whereCondition }),
    ]);
    return { data: data as unknown as ProfissionalEntity[], total };
  }

  // --- MÉTODOS DE TELEFONE ---
  async addTelefone(
    id_profissional: string,
    data: { telefone: string; principal: boolean }
  ) {
    return await prisma.profissional_telefone.create({
      data: { ...data, id_profissional },
    });
  }
  async updateTelefone(id_telefone: string, data: UpdateTelefoneDTO) {
    return await prisma.profissional_telefone.update({
      where: { id_telefone },
      data,
    });
  }
  async deleteTelefone(id_telefone: string) {
    await prisma.profissional_telefone.delete({ where: { id_telefone } });
  }
  async listTelefones(id_profissional: string) {
    return await prisma.profissional_telefone.findMany({
      where: { id_profissional },
    });
  }

  // --- MÉTODOS DE HORÁRIO ---
  async addHorario(
    id_profissional: string,
    data: { dia_semana: number; hora_inicio: Date; hora_fim: Date }
  ) {
    return await prisma.horario_Trabalho.create({
      data: { ...data, id_profissional },
    });
  }
  async updateHorario(id_horario: string, data: UpdateHorarioDTO) {
    return await prisma.horario_Trabalho.update({
      where: { id_horario },
      data,
    });
  }
  async deleteHorario(id_horario: string) {
    await prisma.horario_Trabalho.delete({ where: { id_horario } });
  }
  async listHorarios(id_profissional: string) {
    return await prisma.horario_Trabalho.findMany({
      where: { id_profissional },
      orderBy: { dia_semana: "asc" },
    });
  }

  // --- MÉTODOS DE ESPECIALIDADES ---
  async addEspecialidade(
    id_profissional: string,
    id_especialidade: string
  ): Promise<void> {
    await prisma.profissional_Especialidade.create({
      data: { id_profissional, id_especialidade },
    });
  }

  async removeEspecialidade(
    id_profissional: string,
    id_especialidade: string
  ): Promise<void> {
    // Sintaxe para chave composta
    await prisma.profissional_Especialidade.delete({
      where: {
        id_profissional_id_especialidade: { id_profissional, id_especialidade },
      },
    });
  }

  async listEspecialidades(
    id_profissional: string
  ): Promise<EspecialidadeEntity[]> {
    const result = await prisma.profissional_Especialidade.findMany({
      where: { id_profissional },
      include: { especialidade: true },
      orderBy: { especialidade: { nome: "asc" } },
    });
    return result.map(
      (r) => r.especialidade
    ) as unknown as EspecialidadeEntity[];
  }

  async findEspecialidadesPaginated(
    id_profissional: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<EspecialidadeEntity>> {
    const skip = (page - 1) * limit;
    const where = { id_profissional };

    const [result, total] = await Promise.all([
      prisma.profissional_Especialidade.findMany({
        where,
        skip,
        take: limit,
        include: { especialidade: true },
      }),
      prisma.profissional_Especialidade.count({ where }),
    ]);
    return {
      data: result.map(
        (r) => r.especialidade
      ) as unknown as EspecialidadeEntity[],
      total,
    };
  }

  async searchEspecialidadesPaginated(
    id_profissional: string,
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<EspecialidadeEntity>> {
    const skip = (page - 1) * limit;
    const where = {
      id_profissional,
      especialidade: {
        nome: { contains: query, mode: "insensitive" as const },
      },
    };

    const [result, total] = await Promise.all([
      prisma.profissional_Especialidade.findMany({
        where,
        skip,
        take: limit,
        include: { especialidade: true },
      }),
      prisma.profissional_Especialidade.count({ where }),
    ]);
    return {
      data: result.map(
        (r) => r.especialidade
      ) as unknown as EspecialidadeEntity[],
      total,
    };
  }

  async syncEspecialidades(
    id_profissional: string,
    especialidadesIds: string[]
  ): Promise<EspecialidadeEntity[]> {
    await prisma.$transaction(async (tx) => {
      await tx.profissional_Especialidade.deleteMany({
        where: { id_profissional },
      });
      if (especialidadesIds.length > 0) {
        await tx.profissional_Especialidade.createMany({
          data: especialidadesIds.map((id_especialidade) => ({
            id_profissional,
            id_especialidade,
          })),
        });
      }
    });
    return this.listEspecialidades(id_profissional);
  }

  // --- MÉTODOS DE SERVIÇO ---
  async addServico(id_profissional: string, id_servico: string) {
    return await prisma.profissionalServico.create({
      data: { id_profissional, id_servico },
    });
  }

  async removeServico(id_profissional: string, id_servico: string) {
    // Sintaxe para chave composta
    await prisma.profissionalServico.delete({
      where: {
        id_profissional_id_servico: { id_profissional, id_servico },
      },
    });
  }

  async listServicos(id_profissional: string): Promise<ServicoEntity[]> {
    const result = await prisma.profissionalServico.findMany({
      where: { id_profissional },
      include: { servico: true },
      orderBy: { servico: { nome: "asc" } },
    });
    return result.map((r) => r.servico) as unknown as ServicoEntity[];
  }

  async findServicosPaginated(
    id_profissional: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ServicoEntity>> {
    const skip = (page - 1) * limit;
    const where = { id_profissional };

    const [data, total] = await Promise.all([
      prisma.profissionalServico.findMany({
        where,
        skip,
        take: limit,
        include: { servico: true },
        orderBy: { servico: { nome: "asc" } },
      }),
      prisma.profissionalServico.count({ where }),
    ]);

    return {
      data: data.map((d) => d.servico) as unknown as ServicoEntity[],
      total,
    };
  }

  async searchServicosPaginated(
    id_profissional: string,
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ServicoEntity>> {
    const skip = (page - 1) * limit;
    const where = {
      id_profissional,
      servico: {
        OR: [
          { nome: { contains: query, mode: "insensitive" as const } },
          { descricao: { contains: query, mode: "insensitive" as const } },
        ],
      },
    };

    const [data, total] = await Promise.all([
      prisma.profissionalServico.findMany({
        where,
        skip,
        take: limit,
        include: { servico: true },
        orderBy: { servico: { nome: "asc" } },
      }),
      prisma.profissionalServico.count({ where }),
    ]);

    return {
      data: data.map((d) => d.servico) as unknown as ServicoEntity[],
      total,
    };
  }

  async syncServicos(
    id_profissional: string,
    servicoIds: string[]
  ): Promise<ServicoEntity[]> {
    await prisma.$transaction(async (tx) => {
      await tx.profissionalServico.deleteMany({ where: { id_profissional } });
      if (servicoIds && servicoIds.length > 0) {
        await tx.profissionalServico.createMany({
          data: servicoIds.map((id_servico) => ({
            id_profissional,
            id_servico,
          })),
        });
      }
    });
    return this.listServicos(id_profissional);
  }
}
