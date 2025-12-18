import { prisma } from "../../shared/database/prisma";
import {
  IServicoRepository,
  ServicoEntity,
  CreateServicoDTO,
  UpdateServicoDTO,
} from "./servicoDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

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
}