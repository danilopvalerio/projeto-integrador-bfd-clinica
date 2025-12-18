import { prisma } from "../../shared/database/prisma";
import {
  ISpecialtyRepository,
  SpecialtyEntity,
  CreateSpecialtyDTO,
  UpdateSpecialtyDTO,
} from "./specialtyDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

export class SpecialtyRepository implements ISpecialtyRepository {
  async create(data: CreateSpecialtyDTO): Promise<SpecialtyEntity> {
    const specialty = await prisma.especialidade.create({
      data,
    });

    return specialty as unknown as SpecialtyEntity;
  }

  async findMany(): Promise<SpecialtyEntity[]> {
    const specialties = await prisma.especialidade.findMany({
      orderBy: { nome: "asc" },
    });

    return specialties as unknown as SpecialtyEntity[];
  }

  async update(id: string, data: UpdateSpecialtyDTO): Promise<SpecialtyEntity> {
    const specialty = await prisma.especialidade.update({
      where: { id_especialidade: id },
      data,
    });

    return specialty as unknown as SpecialtyEntity;
  }

  async findById(id: string): Promise<SpecialtyEntity | null> {
    const specialty = await prisma.especialidade.findUnique({
      where: { id_especialidade: id },
    });

    return specialty as unknown as SpecialtyEntity | null;
  }

  async findByNome(nome: string): Promise<SpecialtyEntity | null> {
    const specialty = await prisma.especialidade.findUnique({
      where: { nome },
    });

    return specialty as unknown as SpecialtyEntity | null;
  }

  async delete(id: string): Promise<void> {
    await prisma.especialidade.delete({
      where: { id_especialidade: id },
    });
  }

  async findPaginated(
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<SpecialtyEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.especialidade.findMany({
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.especialidade.count(),
    ]);

    return { data: data as unknown as SpecialtyEntity[], total };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<SpecialtyEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.especialidade.findMany({
        where: {
          nome: { contains: query, mode: "insensitive" },
        },
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.especialidade.count({
        where: {
          nome: { contains: query, mode: "insensitive" },
        },
      }),
    ]);

    return { data: data as unknown as SpecialtyEntity[], total };
  }
}
