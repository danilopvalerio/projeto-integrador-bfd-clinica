import { prisma } from "../../shared/database/prisma";
import {
  IProfissionalRepository,
  ProfissionalEntity,
  CreateProfissionalDTO,
  UpdateProfissionalDTO,
} from "./profissionalDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

export class ProfissionalRepository implements IProfissionalRepository {
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
}
