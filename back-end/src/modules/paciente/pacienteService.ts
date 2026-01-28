import {
  IPacienteRepository,
  CreatePacienteDTO,
  PacienteEntity,
  UpdatePacienteDTO,
  CreateProntuarioEntradaDTO,
  UpdateProntuarioEntradaDTO,
  AddArquivoEntradaDTO,
  TipoEntradaProntuario,
  PacienteDebitoEntity,
  ProntuarioEntradaEntity,
} from "./pacienteDTO";
import { AppError } from "../../shared/http/middlewares/error.middleware";
import { prisma } from "../../shared/database/prisma";
import { hash } from "bcryptjs";

export class PacienteService {
  constructor(private repository: IPacienteRepository) {}

  async create(data: CreatePacienteDTO): Promise<PacienteEntity> {
    // 1. Valida CPF
    const cpfExists = await this.repository.findByCpf(data.cpf);
    if (cpfExists) throw new AppError("CPF já cadastrado", 409);

    if (!data.id_usuario && !data.usuario) {
      throw new AppError("Envie id_usuario ou objeto usuario completo.", 400);
    }

    if (data.telefones && data.telefones.length > 2) {
      throw new AppError("O paciente pode ter no máximo 2 telefones", 400);
    }

    return await prisma.$transaction(async (tx) => {
      let id_usuario = data.id_usuario;

      // 2. Cria ou busca Usuário
      if (!id_usuario && data.usuario) {
        const email = data.usuario.email.trim().toLowerCase();

        // Verifica duplicidade de email
        const emailExists = await tx.usuario.findUnique({ where: { email } });
        if (emailExists) throw new AppError("E-mail já cadastrado", 409);

        // Verifica se NOME foi enviado (obrigatório agora)
        if (!data.usuario.nome) {
          throw new AppError("Nome do usuário é obrigatório.", 400);
        }

        const hashedPassword = await hash(data.usuario.senha, 8);

        const usuarioCriado = await tx.usuario.create({
          data: {
            nome: data.usuario.nome, // <--- NOME AGORA VAI AQUI
            email,
            senha_hash: hashedPassword, // Hash feito aqui ou recebido? Se o DTO já mandar hash, cuidado. Assumindo plain text.
            tipo_usuario: data.usuario.tipo_usuario ?? "PACIENTE",
            ativo: true,
          },
        });
        id_usuario = usuarioCriado.id_usuario;
      }

      // Valida existência do usuário se passou ID
      if (id_usuario) {
        const user = await tx.usuario.findUnique({ where: { id_usuario } });
        if (!user) throw new AppError("Usuário não encontrado", 404);
      }

      // 3. Cria o Paciente (SEM NOME AQUI)
      const created = await tx.paciente.create({
        data: {
          // nome: data.nome, <--- REMOVIDO (Está no usuário)
          sexo: data.sexo as any,
          cpf: data.cpf,
          data_nascimento: data.data_nascimento,
          usuario: {
            connect: { id_usuario: id_usuario! },
          },
          endereco: data.endereco ? { create: data.endereco } : undefined,
          telefones: data.telefones ? { create: data.telefones } : undefined,
        },
        include: {
          endereco: true,
          telefones: true,
          usuario: true, // Importante para retornar o nome no final
        },
      });

      // 4. Cria Prontuário Vazio
      await tx.prontuario.create({
        data: {
          id_paciente: created.id_paciente,
        },
      });

      return created as unknown as PacienteEntity;
    });
  }

  async getById(id: string): Promise<PacienteEntity> {
    const p = await this.repository.findById(id);
    if (!p) throw new AppError("Paciente não encontrado", 404);
    return p;
  }

  async update(id: string, data: UpdatePacienteDTO): Promise<PacienteEntity> {
    // 1. Busca o paciente atual
    const pacienteAtual = await this.repository.findById(id);
    if (!pacienteAtual) throw new AppError("Paciente não encontrado", 404);

    // 2. Validações de E-mail (Se foi enviado um novo e-mail)
    if (data.usuario?.email) {
      const emailEmUso = await prisma.usuario.findFirst({
        where: {
          email: data.usuario.email,
          NOT: { id_usuario: pacienteAtual.id_usuario },
        },
      });

      if (emailEmUso) {
        throw new AppError("Este e-mail já está sendo utilizado.", 409);
      }
    }

    // 3. Criptografia da Senha
    if (data.usuario?.senha) {
      const hashedPassword = await hash(data.usuario.senha, 8);
      data.usuario.senha = hashedPassword;
    }

    // Opcional: Se nome vier no DTO de paciente, ele deve ser repassado para o DTO de usuário
    // O Controller deve garantir essa estrutura correta (UpdatePacienteDTO -> usuario -> nome)

    // 4. Chama o repositório
    return await this.repository.update(id, data);
  }

  async listPaginated(page: number, limit: number) {
    const { data, total } = await this.repository.findPaginated(page, limit);
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async listAll() {
    return await this.repository.findAll();
  }

  async searchPaginated(query: string, page: number, limit: number) {
    const { data, total } = await this.repository.searchPaginated(
      query,
      page,
      limit,
    );
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
  }

  // --- Sub Recursos (Mantidos Iguais) ---

  async addTelefone(
    id_paciente: string,
    data: { telefone: string; principal: boolean },
  ) {
    await this.getById(id_paciente);

    const totalTelefones = await prisma.pacienteTelefone.count({
      where: { id_paciente },
    });

    if (totalTelefones >= 2) {
      throw new AppError(
        "O paciente já possui o limite máximo de 2 telefones",
        400,
      );
    }

    return await this.repository.addTelefone(id_paciente, data);
  }

  async deleteTelefone(id_telefone: string) {
    await this.repository.deleteTelefone(id_telefone);
  }

  async listTelefones(id_paciente: string) {
    await this.getById(id_paciente);
    return await this.repository.listTelefones(id_paciente);
  }

  async replaceTelefones(
    id_paciente: string,
    telefones: { telefone: string; principal: boolean }[],
  ) {
    await this.getById(id_paciente);

    if (!Array.isArray(telefones)) {
      throw new AppError("Telefones deve ser um array", 400);
    }

    if (telefones.length > 2) {
      throw new AppError("O paciente pode ter no máximo 2 telefones", 400);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.pacienteTelefone.deleteMany({
        where: { id_paciente },
      });

      if (telefones.length === 0) {
        return [];
      }

      await tx.pacienteTelefone.createMany({
        data: telefones.map((t) => ({
          ...t,
          id_paciente,
        })),
      });

      return await tx.pacienteTelefone.findMany({
        where: { id_paciente },
      });
    });
  }

  async addTag(id_paciente: string, nome: string) {
    await this.getById(id_paciente);
    return await this.repository.addTag(id_paciente, nome);
  }

  async removeTag(id_tag: string) {
    await this.repository.removeTag(id_tag);
  }

  async listTags(id_paciente: string) {
    await this.getById(id_paciente);
    return await this.repository.listTags(id_paciente);
  }

  async addDebito(
    id_paciente: string,
    data: {
      valor_total: number;
      data_vencimento: Date;
      observacoes?: string;
      id_agendamento?: string;
    },
  ) {
    await this.getById(id_paciente);
    return await this.repository.addDebito(id_paciente, data);
  }

  async listDebitos(id_paciente: string) {
    await this.getById(id_paciente);
    return await this.repository.listDebitos(id_paciente);
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

  // --- Prontuário ---

  async getProntuario(id_paciente: string) {
    await this.getById(id_paciente);

    const prontuario =
      await this.repository.getProntuarioByPaciente(id_paciente);

    if (!prontuario) {
      throw new AppError("Prontuário não encontrado para este paciente.", 404);
    }

    return prontuario;
  }

  async createProntuarioEntrada(
    id_prontuario: string,
    id_profissional: string | null, // <--- Aqui é string | null
    data: CreateProntuarioEntradaDTO,
  ): Promise<ProntuarioEntradaEntity> {
    // 1. Cria a entrada passando id_profissional (que pode ser null)
    // O Repository sabe lidar com o connect/disconnect ou passar undefined
    const entrada = await this.repository.createProntuarioEntrada(
      id_prontuario,
      id_profissional,
      data,
    );

    return entrada;
  }

  async listEntradas(id_prontuario: string, tipo?: string) {
    let tipoEnum: TipoEntradaProntuario | undefined;
    if (tipo) {
      if (
        !Object.values(TipoEntradaProntuario).includes(
          tipo as TipoEntradaProntuario,
        )
      ) {
        throw new AppError("Tipo de registro inválido", 400);
      }
      tipoEnum = tipo as TipoEntradaProntuario;
    }

    return await this.repository.listProntuarioEntradas(id_prontuario, {
      tipo: tipoEnum,
    });
  }

  async getEntrada(id_entrada: string) {
    const entrada = await this.repository.getProntuarioEntradaById(id_entrada);
    if (!entrada) throw new AppError("Entrada não encontrada", 404);
    return entrada;
  }

  async updateEntrada(
    id_entrada: string,
    id_usuario_logado: string,
    data: UpdateProntuarioEntradaDTO,
  ) {
    await this.getEntrada(id_entrada);
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    return await this.repository.updateProntuarioEntrada(
      id_entrada,
      data.descricao,
    );
  }

  async deleteEntrada(id_entrada: string, id_usuario_logado: string) {
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    await this.getEntrada(id_entrada);
    await this.repository.deleteProntuarioEntrada(id_entrada);
  }

  async addArquivo(
    id_entrada: string,
    id_usuario_logado: string,
    data: AddArquivoEntradaDTO,
  ) {
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    await this.getEntrada(id_entrada);

    return await this.repository.addArquivoEntrada(id_entrada, data);
  }

  async removeArquivo(id_arquivo: string, id_usuario_logado: string) {
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    await this.repository.removeArquivoEntrada(id_arquivo);
  }
}
