import { prisma } from "../../shared/database/prisma";
import { Log } from "../../shared/database/generated/prisma/client";

export class LogRepository {
  // Configuração padrão de include para trazer nomes
  private includeConfig = {
    usuario: {
      select: {
        id_usuario: true,
        email: true,
        tipo_usuario: true, // ou 'tipo'
        // Traz as relações para sabermos o nome real da pessoa
        paciente: { select: { nome: true } },
        profissional: { select: { nome: true } },
      },
    },
  };

  async findAll(): Promise<Log[]> {
    return prisma.log.findMany({
      orderBy: { data: "desc" },
      include: this.includeConfig,
    });
  }

  async listPaginated(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [total, data] = await Promise.all([
      prisma.log.count(),
      prisma.log.findMany({
        skip,
        take: limit,
        orderBy: { data: "desc" },
        include: this.includeConfig,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchPaginated(term: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Busca em múltiplos campos e tabelas relacionadas
    const whereClause = {
      OR: [
        { acao: { contains: term, mode: "insensitive" } },
        { tipo: { contains: term, mode: "insensitive" } },
        { descricao: { contains: term, mode: "insensitive" } },
        // Busca no email do usuário associado
        { usuario: { email: { contains: term, mode: "insensitive" } } },
        // Busca no nome do Paciente associado ao usuário
        {
          usuario: {
            paciente: { nome: { contains: term, mode: "insensitive" } },
          },
        },
        // Busca no nome do Profissional associado ao usuário
        {
          usuario: {
            profissional: { nome: { contains: term, mode: "insensitive" } },
          },
        },
      ],
    };

    // @ts-ignore
    const [total, data] = await Promise.all([
      // @ts-ignore
      prisma.log.count({ where: whereClause }),
      prisma.log.findMany({
        // @ts-ignore
        where: whereClause,
        skip,
        take: limit,
        orderBy: { data: "desc" },
        include: this.includeConfig,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
    };
  }
}
