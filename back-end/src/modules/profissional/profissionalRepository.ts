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

// --- MÉTODOS DE TELEFONE ---
  async addTelefone(id_profissional: string, data: { telefone: string; principal: boolean }) {
    return await prisma.profissional_telefone.create({ data: { ...data, id_profissional } });
  }
  async updateTelefone(id_telefone: string, data: UpdateTelefoneDTO) {
    return await prisma.profissional_telefone.update({ where: { id_telefone }, data });
  }
  async deleteTelefone(id_telefone: string) {
    await prisma.profissional_telefone.delete({ where: { id_telefone } });
  }
  async listTelefones(id_profissional: string) {
    return await prisma.profissional_telefone.findMany({ where: { id_profissional } });
  }


  // --- MÉTODOS DE HORÁRIO ---
  async addHorario(id_profissional: string, data: { dia_semana: number; hora_inicio: Date; hora_fim: Date }
) {
    return await prisma.horario_Trabalho.create({ data: { ...data, id_profissional } });
  }
  async updateHorario(id_horario: string, data: UpdateHorarioDTO) {
    return await prisma.horario_Trabalho.update({ where: { id_horario }, data });
  }
  async deleteHorario(id_horario: string) {
    await prisma.horario_Trabalho.delete({ where: { id_horario } });
  }
  async listHorarios(id_profissional: string) {
    return await prisma.horario_Trabalho.findMany({ where: { id_profissional }, orderBy: { dia_semana: 'asc' } });
  }
}