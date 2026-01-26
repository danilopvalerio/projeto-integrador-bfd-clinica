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
  Sexo, // Enum do Prisma
  TipoArquivoProntuario, // Enum do Prisma
} from "../../shared/database/generated/prisma/client";

export class PacienteRepository implements IPacienteRepository {
  // ================= CRUD BASE =================

  async create(data: CreatePacienteDTO): Promise<PacienteEntity> {
    const {
      nome,
      sexo,
      cpf,
      data_nascimento,
      id_usuario,
      endereco,
      telefones,
    } = data;

    const paciente = await prisma.paciente.create({
      data: {
        nome,
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

        // --- NOVA REGRA: Criação Automática do Prontuário ---
        prontuarios: {
          create: {}, // Cria um registro vazio na tabela de prontuários vinculado a este paciente
        },
      },
      include: {
        endereco: true,
        telefones: true,
        // Não precisamos retornar o prontuário aqui, apenas garantir que foi criado
      },
    });

    return paciente as unknown as PacienteEntity;
  }

  async findById(id: string): Promise<PacienteEntity | null> {
    const paciente = await prisma.paciente.findUnique({
      where: { id_paciente: id },
      include: { endereco: true, telefones: true },
    });
    return paciente as unknown as PacienteEntity | null;
  }

  async findByCpf(cpf: string): Promise<PacienteEntity | null> {
    const paciente = await prisma.paciente.findUnique({
      where: { cpf },
    });
    return paciente as unknown as PacienteEntity | null;
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<PacienteEntity> {
    return await prisma.$transaction(async (tx) => {
      // 1. Tipagem Forte: Usamos o tipo gerado pelo Prisma
      const updateData: Prisma.PacienteUpdateInput = {
        nome: data.nome,
        data_nascimento: data.data_nascimento,
        cpf: data.cpf,
      };

      // Cast seguro para o Enum do Prisma se o valor existir
      if (data.sexo) {
        updateData.sexo = data.sexo as Sexo;
      }

      // 2. Lógica do Usuário (Nested Update tipado)
      if (data.usuario) {
        updateData.usuario = {
          update: {
            email: data.usuario.email,
            senha_hash: data.usuario.senha,
          },
        };
      }

      // 3. Lógica Endereço
      if (data.endereco) {
        updateData.endereco = {
          upsert: {
            // No CREATE, não podemos aceitar undefined.
            // Usamos '?? ""' para garantir que seja uma string caso venha nulo.
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

      // 4. Lógica Telefones (Manual pois o Prisma não tem 'Replace' nativo para One-to-Many puro)
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
      orderBy: { nome: "asc" },
      include: { endereco: true },
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
        orderBy: { nome: "asc" },
        include: { endereco: true },
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
        { nome: { contains: query, mode: "insensitive" as const } },
        { cpf: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [data, total] = await Promise.all([
      prisma.paciente.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { nome: "asc" },
        include: { endereco: true },
      }),
      prisma.paciente.count({ where: whereCondition }),
    ]);

    return { data: data as unknown as PacienteEntity[], total };
  }

  // ================= SUB-RECURSOS =================

  // --- Telefones ---
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

  // --- Tags ---
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

  // --- Débitos ---
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

  // Adicionar na Interface e na Classe

  async payDebito(id_debito: string): Promise<PacienteDebitoEntity> {
    const result = await prisma.pacienteDebito.update({
      where: { id_debito },
      data: {
        status_pagamento: "PAGO",
        valor_pago: { increment: 0 }, // Logica simples, idealmente seria o valor total
        // Aqui vc pode definir se valor_pago vira o valor_total automaticamente
      },
    });
    // Hackzinho: Se pagou, iguala o valor pago ao total se estiver 0
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
    // Retorna o primeiro prontuário (regra de negócio diz que só tem 1)
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
    id_profissional: string | null, // <--- ACEITA NULL
    data: CreateProntuarioEntradaDTO,
  ): Promise<ProntuarioEntradaEntity> {
    const entrada = await prisma.prontuarioEntrada.create({
      data: {
        id_prontuario,

        // Se tiver ID, usa. Se for null, passa null (o Prisma aceita se o campo for String?)
        id_profissional: id_profissional,

        tipo: data.tipo,
        descricao: data.descricao,
        id_agendamento: data.id_agendamento,
      },
      include: {
        // Como profissional agora é opcional, o include pode retornar null nele
        profissional: {
          select: { nome: true, registro_conselho: true },
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
          select: { nome: true, registro_conselho: true },
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
          select: { nome: true, registro_conselho: true },
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
        profissional: { select: { nome: true, registro_conselho: true } },
        arquivos: true,
      },
    });
    return entrada as unknown as ProntuarioEntradaEntity;
  }

  async deleteProntuarioEntrada(id_entrada: string): Promise<void> {
    // O Prisma fará Cascade Delete nos arquivos devido à configuração do schema
    await prisma.prontuarioEntrada.delete({
      where: { id_entrada },
    });
  }

  // --- Arquivos da Entrada ---

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
        tipo_documento: data.tipo_documento as any, // Cast necessário devido ao enum do Prisma vs DTO
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
