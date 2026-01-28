import { prisma } from "../../shared/database/prisma";
import { Log } from "../../shared/database/generated/prisma/client";

export class LogRepository {
  // Configuração padrão de include
  private includeConfig = {
    usuario: {
      select: {
        id_usuario: true,
        email: true,
        nome: true, // <--- O NOME AGORA VEM DAQUI
        tipo_usuario: true,
        // Mantemos a relação apenas para saber o tipo específico se necessário (pelo ID)
        // mas não buscamos mais o nome lá dentro.
        paciente: { select: { id_paciente: true } },
        profissional: {
          select: { id_profissional: true, registro_conselho: true },
        },
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

    // Busca em múltiplos campos
    const whereClause = {
      OR: [
        { acao: { contains: term, mode: "insensitive" as const } },
        { tipo: { contains: term, mode: "insensitive" as const } },
        { descricao: { contains: term, mode: "insensitive" as const } },

        // Busca no USUÁRIO (Nome e Email centralizados)
        {
          usuario: {
            OR: [
              { email: { contains: term, mode: "insensitive" as const } },
              { nome: { contains: term, mode: "insensitive" as const } }, // <--- Busca pelo nome aqui
            ],
          },
        },
      ],
    };

    const [total, data] = await Promise.all([
      prisma.log.count({ where: whereClause }),
      prisma.log.findMany({
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
