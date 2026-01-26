import { prisma } from "../../shared/database/prisma";
import {
  IEspecialidadeRepository,
  EspecialidadeEntity,
  CreateEspecialidadeDTO,
  UpdateEspecialidadeDTO,
  ProfissionalVinculadoDTO,
} from "./especialidadeDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

export class EspecialidadeRepository implements IEspecialidadeRepository {
  async create(data: CreateEspecialidadeDTO): Promise<EspecialidadeEntity> {
    const especialidade = await prisma.especialidade.create({
      data,
    });

    return especialidade as unknown as EspecialidadeEntity;
  }
  async listProfissionaisPaginated(
    id_especialidade: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<ProfissionalVinculadoDTO>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.profissional_Especialidade.findMany({
        where: { id_especialidade },
        skip,
        take: limit,
        include: {
          profissional: {
            select: {
              id_profissional: true,
              nome: true,
              registro_conselho: true,
            },
          },
        },
        orderBy: {
          profissional: { nome: "asc" },
        },
      }),
      prisma.profissional_Especialidade.count({
        where: { id_especialidade },
      }),
    ]);

    const mappedData = data.map((r) => ({
      id_profissional: r.profissional.id_profissional,
      nome: r.profissional.nome,
      cargo: r.profissional.registro_conselho, // Mapeando registro para 'cargo' conforme seu DTO visual
    }));

    return { data: mappedData, total };
  }

  async searchProfissionaisPaginated(
    id_especialidade: string,
    query: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<ProfissionalVinculadoDTO>> {
    const skip = (page - 1) * limit;

    const whereClause = {
      id_especialidade,
      profissional: {
        nome: { contains: query, mode: "insensitive" as const },
      },
    };

    const [data, total] = await Promise.all([
      prisma.profissional_Especialidade.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          profissional: {
            select: {
              id_profissional: true,
              nome: true,
              registro_conselho: true,
            },
          },
        },
        orderBy: {
          profissional: { nome: "asc" },
        },
      }),
      prisma.profissional_Especialidade.count({
        where: whereClause,
      }),
    ]);

    const mappedData = data.map((r) => ({
      id_profissional: r.profissional.id_profissional,
      nome: r.profissional.nome,
      cargo: r.profissional.registro_conselho,
    }));

    return { data: mappedData, total };
  }
  async findMany(): Promise<EspecialidadeEntity[]> {
    const especialidades = await prisma.especialidade.findMany({
      orderBy: { nome: "asc" },
    });

    return especialidades as unknown as EspecialidadeEntity[];
  }

  async update(
    id: string,
    data: UpdateEspecialidadeDTO,
  ): Promise<EspecialidadeEntity> {
    const especialidade = await prisma.especialidade.update({
      where: { id_especialidade: id },
      data,
    });

    return especialidade as unknown as EspecialidadeEntity;
  }

  async findById(id: string): Promise<EspecialidadeEntity | null> {
    const especialidade = await prisma.especialidade.findUnique({
      where: { id_especialidade: id },
    });

    return especialidade as unknown as EspecialidadeEntity | null;
  }

  async findByNome(nome: string): Promise<EspecialidadeEntity | null> {
    const especialidade = await prisma.especialidade.findUnique({
      where: { nome },
    });

    return especialidade as unknown as EspecialidadeEntity | null;
  }

  async delete(id: string): Promise<void> {
    await prisma.especialidade.delete({
      where: { id_especialidade: id },
    });
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<EspecialidadeEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.especialidade.findMany({
        skip,
        take: limit,
        orderBy: { nome: "asc" },
      }),
      prisma.especialidade.count(),
    ]);

    return { data: data as unknown as EspecialidadeEntity[], total };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<EspecialidadeEntity>> {
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

    return { data: data as unknown as EspecialidadeEntity[], total };
  }

  // ==============================
  // Relação Especialidade × Profissional
  // ==============================

  async listProfissionais(
    id_especialidade: string,
  ): Promise<ProfissionalVinculadoDTO[]> {
    const result = await prisma.profissional_Especialidade.findMany({
      where: { id_especialidade },
      include: {
        profissional: {
          select: {
            id_profissional: true,
            nome: true,
            registro_conselho: true,
          },
        },
      },
    });

    return result.map((r) => ({
      id_profissional: r.profissional.id_profissional,
      nome: r.profissional.nome,
      conselho: r.profissional.registro_conselho,
    }));
  }

  async addProfissional(
    id_especialidade: string,
    id_profissional: string,
  ): Promise<void> {
    await prisma.profissional_Especialidade.create({
      data: { id_especialidade, id_profissional },
    });
  }

  async removeProfissional(
    id_especialidade: string,
    id_profissional: string,
  ): Promise<void> {
    await prisma.profissional_Especialidade.delete({
      where: {
        id_profissional_id_especialidade: {
          id_profissional,
          id_especialidade,
        },
      },
    });
  }
}
