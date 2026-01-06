import { prisma } from "../../shared/database/prisma";
import {
  IServicoRepository,
  ServicoEntity,
  CreateServicoDTO,
  UpdateServicoDTO,
} from "./servicoDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";
import type { ProfissionalEntity } from "../profissional/profissionalDTO";

export class ServicoRepository implements IServicoRepository {
  async create(data: CreateServicoDTO): Promise<ServicoEntity> {
    const servico = await prisma.servico.create({
      data: {
        ...data,
        ativo: data.ativo ?? true, // Garante valor default se não enviado
      },
    });
    return servico as unknown as ServicoEntity;
  }

  async findMany(): Promise<ServicoEntity[]> {
    const servicos = await prisma.servico.findMany({
      orderBy: { nome: "asc" },
    });
    return servicos as unknown as ServicoEntity[];
  }

  async update(id: string, data: UpdateServicoDTO): Promise<ServicoEntity> {
    const servico = await prisma.servico.update({
      where: { id_servico: id },
      data,
    });
    return servico as unknown as ServicoEntity;
  }

  async findById(id: string): Promise<ServicoEntity | null> {
    const servico = await prisma.servico.findUnique({
      where: { id_servico: id },
    });
    return servico as unknown as ServicoEntity | null;
  }

  async findByNome(nome: string): Promise<ServicoEntity | null> {
    const servico = await prisma.servico.findFirst({
      where: { nome: { equals: nome, mode: "insensitive" } },
    });
    return servico as unknown as ServicoEntity | null;
  }

  async delete(id: string): Promise<void> {
    await prisma.servico.delete({
      where: { id_servico: id },
    });
  }

  async findPaginated(
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ServicoEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.servico.findMany({
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.servico.count(),
    ]);

    return { data: data as unknown as ServicoEntity[], total };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ServicoEntity>> {
    const skip = (page - 1) * limit;

    // Busca por Nome ou Descrição
    const whereCondition = {
      OR: [
        { nome: { contains: query, mode: "insensitive" as const } },
        { descricao: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.servico.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.servico.count({
        where: whereCondition,
      }),
    ]);

    return { data: data as unknown as ServicoEntity[], total };
  }

  // Relação Serviço e Profissional
  async addProfissional(id_servico: string, id_profissional: string) {
    return await prisma.profissionalServico.create({
      data: { id_servico, id_profissional },
    });
  }

  async removeProfissional(id_servico: string, id_profissional: string) {
    await prisma.profissionalServico.deleteMany({
      where: { id_servico, id_profissional },
    });
  }

  async listProfissionais(id_servico: string): Promise<ProfissionalEntity[]> {
    const profs = await prisma.profissional.findMany({
      where: { servicos: { some: { id_servico } } },
      orderBy: { nome: "asc" },
    });
    return profs as unknown as ProfissionalEntity[];
  }

  async findProfissionaisPaginated(
    id_servico: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ProfissionalEntity>> {
    const skip = (page - 1) * limit;
    const where = { servicos: { some: { id_servico } } };

    const [data, total] = await Promise.all([
      prisma.profissional.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.profissional.count({ where }),
    ]);

    return { data: data as unknown as ProfissionalEntity[], total };
  }

  async searchProfissionaisPaginated(
    id_servico: string,
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ProfissionalEntity>> {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        { servicos: { some: { id_servico } } },
        {
          OR: [
            { nome: { contains: query, mode: "insensitive" as const } },
            { cpf: { contains: query, mode: "insensitive" as const } },
          ],
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.profissional.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.profissional.count({ where }),
    ]);

    return { data: data as unknown as ProfissionalEntity[], total };
  }

  async syncProfissionais(id_servico: string, profissionalIds: string[]): Promise<ProfissionalEntity[]> {
    await prisma.$transaction(async (tx) => {
      await tx.profissionalServico.deleteMany({ where: { id_servico } });
      if (profissionalIds && profissionalIds.length > 0) {
        await tx.profissionalServico.createMany({
          data: profissionalIds.map((id_profissional) => ({ id_profissional, id_servico })),
          skipDuplicates: true,
        });
      }
    });

    const profs = await this.listProfissionais(id_servico);
    return profs;
  }
}