import { prisma } from "../../shared/database/prisma";
import {
  IPacienteRepository,
  PacienteEntity,
  CreatePacienteDTO,
  UpdatePacienteDTO,
  PacienteTelefoneEntity,
  PacienteTagEntity,
  PacienteDebitoEntity,
  ProntuarioEntity,
  ProntuarioEntradaEntity,
  CreateProntuarioEntradaDTO,
  ProntuarioArquivoEntity,
  AddArquivoEntradaDTO,
  TipoEntradaProntuario,
} from "./pacienteDTO";
import { RepositoryPaginatedResult } from "../../shared/dtos/index.dto";

import {
  Prisma,
  Sexo,
  TipoArquivoProntuario,
} from "../../shared/database/generated/prisma/client";

export class PacienteRepository implements IPacienteRepository {
  // ================= CRUD BASE =================

  async create(data: CreatePacienteDTO): Promise<PacienteEntity> {
    const { sexo, cpf, data_nascimento, id_usuario, endereco, telefones } =
      data;

    const paciente = await prisma.paciente.create({
      data: {
        sexo: sexo as any,
        cpf,
        data_nascimento,
        usuario: {
          connect: { id_usuario: id_usuario! },
        },
        endereco: endereco
          ? {
              create: {
                rua: endereco.rua,
                numero: endereco.numero,
                cidade: endereco.cidade,
                estado: endereco.estado,
              },
            }
          : undefined,
        telefones: telefones
          ? {
              create: telefones.map((t) => ({
                telefone: t.telefone,
                principal: t.principal,
              })),
            }
          : undefined,

        // Criação Automática do Prontuário
        prontuarios: {
          create: {},
        },
      },
      include: {
        endereco: true,
        telefones: true,
        usuario: true,
      },
    });

    return paciente as unknown as PacienteEntity;
  }

  async findById(id: string): Promise<PacienteEntity | null> {
    const paciente = await prisma.paciente.findUnique({
      where: { id_paciente: id },
      include: {
        endereco: true,
        telefones: true,
        usuario: true,
      },
    });
    return paciente as unknown as PacienteEntity | null;
  }

  async findByCpf(cpf: string): Promise<PacienteEntity | null> {
    const paciente = await prisma.paciente.findUnique({
      where: { cpf },
      include: { usuario: true },
    });
    return paciente as unknown as PacienteEntity | null;
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<PacienteEntity> {
    return await prisma.$transaction(async (tx) => {
      // 1. Tipagem Forte
      const updateData: Prisma.PacienteUpdateInput = {
        data_nascimento: data.data_nascimento,
        cpf: data.cpf,
      };

      if (data.sexo) {
        updateData.sexo = data.sexo as Sexo;
      }

      // 2. Lógica do Usuário (CORRIGIDA)
      if (data.usuario) {
        updateData.usuario = {
          update: {
            nome: data.usuario.nome, // <--- ADICIONADO: Atualiza o nome na tabela Usuario
            email: data.usuario.email,
            senha_hash: data.usuario.senha,
          },
        };
      }

      // 3. Lógica Endereço
      if (data.endereco) {
        updateData.endereco = {
          upsert: {
            create: {
              rua: data.endereco.rua ?? "",
              cidade: data.endereco.cidade ?? "",
              estado: data.endereco.estado ?? "",
              numero: data.endereco.numero ?? null,
            },
            update: { ...data.endereco },
          },
        };
      }

      // 4. Lógica Telefones
      if (data.telefones) {
        await tx.pacienteTelefone.deleteMany({ where: { id_paciente: id } });

        if (data.telefones.length > 0) {
          await tx.pacienteTelefone.createMany({
            data: data.telefones.map((tel, index) => ({
              id_paciente: id,
              telefone: tel,
              principal: index === 0,
            })),
          });
        }
      }

      // 5. Executa o update final
      const pacienteAtualizado = await tx.paciente.update({
        where: { id_paciente: id },
        data: updateData,
        include: {
          telefones: true,
          endereco: true,
          usuario: true, // Retorna o usuário atualizado
        },
      });

      return pacienteAtualizado as unknown as PacienteEntity;
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.paciente.delete({ where: { id_paciente: id } });
  }

  async findAll(): Promise<PacienteEntity[]> {
    const result = await prisma.paciente.findMany({
      include: {
        endereco: true,
        usuario: true,
      },
      orderBy: {
        usuario: {
          nome: "asc",
        },
      },
    });
    return result as unknown as PacienteEntity[];
  }

  async findPaginated(
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<PacienteEntity>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.paciente.findMany({
        skip,
        take: limit,
        include: {
          endereco: true,
          usuario: true,
        },
        orderBy: {
          usuario: {
            nome: "asc",
          },
        },
      }),
      prisma.paciente.count(),
    ]);

    return { data: data as unknown as PacienteEntity[], total };
  }

  async searchPaginated(
    query: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<PacienteEntity>> {
    const skip = (page - 1) * limit;

    const whereCondition = {
      OR: [
        { cpf: { contains: query, mode: "insensitive" as const } },
        {
          usuario: {
            OR: [
              { nome: { contains: query, mode: "insensitive" as const } },
              { email: { contains: query, mode: "insensitive" as const } },
            ],
          },
        },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.paciente.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
          endereco: true,
          usuario: true,
        },
        orderBy: {
          usuario: {
            nome: "asc",
          },
        },
      }),
      prisma.paciente.count({ where: whereCondition }),
    ]);

    return { data: data as unknown as PacienteEntity[], total };
  }

  // ================= SUB-RECURSOS (MANTIDOS) =================

  async addTelefone(
    id_paciente: string,
    data: { telefone: string; principal: boolean },
  ): Promise<PacienteTelefoneEntity> {
    const result = await prisma.pacienteTelefone.create({
      data: { ...data, id_paciente },
    });
    return result as unknown as PacienteTelefoneEntity;
  }

  async deleteTelefone(id_telefone: string): Promise<void> {
    await prisma.pacienteTelefone.delete({ where: { id_telefone } });
  }

  async listTelefones(id_paciente: string): Promise<PacienteTelefoneEntity[]> {
    const result = await prisma.pacienteTelefone.findMany({
      where: { id_paciente },
    });
    return result as unknown as PacienteTelefoneEntity[];
  }

  async addTag(id_paciente: string, nome: string): Promise<PacienteTagEntity> {
    const result = await prisma.pacienteTag.create({
      data: { nome, id_paciente },
    });
    return result as unknown as PacienteTagEntity;
  }

  async removeTag(id_tag: string): Promise<void> {
    await prisma.pacienteTag.delete({ where: { id_tag } });
  }

  async listTags(id_paciente: string): Promise<PacienteTagEntity[]> {
    const result = await prisma.pacienteTag.findMany({
      where: { id_paciente },
    });
    return result as unknown as PacienteTagEntity[];
  }

  async addDebito(
    id_paciente: string,
    data: {
      valor_total: number;
      data_vencimento: Date;
      observacoes?: string;
      id_agendamento?: string;
    },
  ): Promise<PacienteDebitoEntity> {
    const result = await prisma.pacienteDebito.create({
      data: {
        id_paciente,
        valor_total: data.valor_total,
        data_vencimento: data.data_vencimento,
        observacoes: data.observacoes,
        id_agendamento: data.id_agendamento,
        status_pagamento: "PENDENTE",
        valor_pago: 0,
      },
    });
    return result as unknown as PacienteDebitoEntity;
  }

  async listDebitos(id_paciente: string): Promise<PacienteDebitoEntity[]> {
    const result = await prisma.pacienteDebito.findMany({
      where: { id_paciente },
      orderBy: { data_vencimento: "asc" },
    });
    return result as unknown as PacienteDebitoEntity[];
  }

  async payDebito(id_debito: string): Promise<PacienteDebitoEntity> {
    const result = await prisma.pacienteDebito.update({
      where: { id_debito },
      data: {
        status_pagamento: "PAGO",
        valor_pago: { increment: 0 },
      },
    });
    if (result.status_pagamento === "PAGO" && result.valor_pago === 0) {
      return (await prisma.pacienteDebito.update({
        where: { id_debito },
        data: { valor_pago: result.valor_total },
      })) as unknown as PacienteDebitoEntity;
    }
    return result as unknown as PacienteDebitoEntity;
  }

  async deleteDebito(id_debito: string): Promise<void> {
    await prisma.pacienteDebito.delete({ where: { id_debito } });
  }

  async getProntuarioByPaciente(
    id_paciente: string,
  ): Promise<ProntuarioEntity | null> {
    const prontuario = await prisma.prontuario.findFirst({
      where: { id_paciente },
    });
    return prontuario as unknown as ProntuarioEntity | null;
  }

  async findProfissionalByUserId(
    id_usuario: string,
  ): Promise<{ id_profissional: string } | null> {
    const profissional = await prisma.profissional.findUnique({
      where: { id_usuario },
      select: { id_profissional: true },
    });
    return profissional;
  }

  async createProntuarioEntrada(
    id_prontuario: string,
    id_profissional: string | null,
    data: CreateProntuarioEntradaDTO,
  ): Promise<ProntuarioEntradaEntity> {
    const entrada = await prisma.prontuarioEntrada.create({
      data: {
        id_prontuario,
        id_profissional: id_profissional,
        tipo: data.tipo,
        descricao: data.descricao,
        id_agendamento: data.id_agendamento,
      },
      include: {
        profissional: {
          select: { registro_conselho: true },
        },
        arquivos: true,
      },
    });

    return entrada as unknown as ProntuarioEntradaEntity;
  }
  async listProntuarioEntradas(
    id_prontuario: string,
    filters?: { tipo?: TipoEntradaProntuario },
  ): Promise<ProntuarioEntradaEntity[]> {
    const where: any = { id_prontuario };

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    const entradas = await prisma.prontuarioEntrada.findMany({
      where,
      orderBy: { criado_em: "desc" },
      include: {
        profissional: {
          select: { registro_conselho: true },
        },
        arquivos: true,
      },
    });

    return entradas as unknown as ProntuarioEntradaEntity[];
  }

  async getProntuarioEntradaById(
    id_entrada: string,
  ): Promise<ProntuarioEntradaEntity | null> {
    const entrada = await prisma.prontuarioEntrada.findUnique({
      where: { id_entrada },
      include: {
        profissional: {
          select: { registro_conselho: true },
        },
        arquivos: true,
      },
    });
    return entrada as unknown as ProntuarioEntradaEntity | null;
  }

  async updateProntuarioEntrada(
    id_entrada: string,
    descricao: string,
  ): Promise<ProntuarioEntradaEntity> {
    const entrada = await prisma.prontuarioEntrada.update({
      where: { id_entrada },
      data: { descricao },
      include: {
        profissional: { select: { registro_conselho: true } },
        arquivos: true,
      },
    });
    return entrada as unknown as ProntuarioEntradaEntity;
  }

  async deleteProntuarioEntrada(id_entrada: string): Promise<void> {
    await prisma.prontuarioEntrada.delete({
      where: { id_entrada },
    });
  }

  async addArquivoEntrada(
    id_entrada: string,
    data: AddArquivoEntradaDTO,
  ): Promise<ProntuarioArquivoEntity> {
    const arquivo = await prisma.prontuarioArquivo.create({
      data: {
        id_entrada,
        nome_arquivo: data.nome_arquivo,
        url_arquivo: data.url_arquivo,
        tipo_arquivo: data.tipo_arquivo,
        tipo_documento: data.tipo_documento as any,
        descricao: data.descricao,
      },
    });
    return arquivo as unknown as ProntuarioArquivoEntity;
  }

  async removeArquivoEntrada(id_arquivo: string): Promise<void> {
    await prisma.prontuarioArquivo.delete({
      where: { id_arquivo },
    });
  }

  async listArquivosByEntrada(
    id_entrada: string,
  ): Promise<ProntuarioArquivoEntity[]> {
    const arquivos = await prisma.prontuarioArquivo.findMany({
      where: { id_entrada },
      orderBy: { data_upload: "desc" },
    });
    return arquivos as unknown as ProntuarioArquivoEntity[];
  }
}
