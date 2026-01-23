import { prisma } from "../../shared/database/prisma";


export interface CreateLogDTO {
  acao: string;
  tipo?: string;
  ip?: string;
  user_agent?: string;
  sucesso: boolean;
  id_usuario?: string;
  data?: Date;
}

export class LogRepository {
  async create(data: CreateLogDTO) {
    return prisma.log.create({
      data: {
        ...data,
        tipo: data.tipo || "ACESSO",
        data: data.data || new Date(),
      },
    });
  }

  async findAll({
    page = 1,
    perPage = 5,
  }: {
    page?: number;
    perPage?: number;
  }) {
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      prisma.log.findMany({
        skip,
        take: perPage,
        orderBy: { data: "desc" },
      }),
      prisma.log.count(),
    ]);

    return {
      data,
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    };
  }

  async findBySearch({
    term,
    page = 1,
    perPage = 5,
  }: {
    term: string;
    page?: number;
    perPage?: number;
  }) {
    const skip = (page - 1) * perPage;

    const [data, total] = await Promise.all([
      prisma.log.findMany({
        where: {
          OR: [
            { acao: { contains: term, mode: "insensitive" } },
            { tipo: { contains: term, mode: "insensitive" } },
            { ip: { contains: term, mode: "insensitive" } },
          ],
        },
        skip,
        take: perPage,
        orderBy: { data: "desc" },
      }),
      prisma.log.count({
        where: {
          OR: [
            { acao: { contains: term, mode: "insensitive" } },
            { tipo: { contains: term, mode: "insensitive" } },
            { ip: { contains: term, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return {
      data,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
