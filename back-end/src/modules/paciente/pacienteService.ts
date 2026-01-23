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
import { PacienteDebito } from "@/shared/database/generated/prisma/client";

export class PacienteService {
  constructor(private repository: IPacienteRepository) {}

  async create(data: CreatePacienteDTO): Promise<PacienteEntity> {
    const cpfExists = await this.repository.findByCpf(data.cpf);
    if (cpfExists) throw new AppError("CPF já cadastrado", 409);

    if (!data.id_usuario && !data.usuario) {
      throw new AppError("Envie id_usuario ou objeto usuario.", 400);
    }

    if (data.telefones && data.telefones.length > 2) {
      throw new AppError("O paciente pode ter no máximo 2 telefones", 400);
    }

    return await prisma.$transaction(async (tx) => {
      let id_usuario = data.id_usuario;

      // 1. Cria ou busca Usuário
      if (!id_usuario && data.usuario) {
        const email = data.usuario.email.trim().toLowerCase();
        const emailExists = await tx.usuario.findUnique({ where: { email } });
        if (emailExists) throw new AppError("E-mail já cadastrado", 409);

        const usuarioCriado = await tx.usuario.create({
          data: {
            email,
            senha_hash: data.usuario.senha,
            tipo_usuario: data.usuario.tipo_usuario ?? "PACIENTE",
            ativo: true,
          },
        });
        id_usuario = usuarioCriado.id_usuario;
      }

      if (id_usuario) {
        const user = await tx.usuario.findUnique({ where: { id_usuario } });
        if (!user) throw new AppError("Usuário não encontrado", 404);
      }

      // 2. Cria o Paciente
      const created = await tx.paciente.create({
        data: {
          nome: data.nome,
          sexo: data.sexo as any,
          cpf: data.cpf,
          data_nascimento: data.data_nascimento,
          usuario: {
            connect: { id_usuario: id_usuario! },
          },
          endereco: data.endereco ? { create: data.endereco } : undefined,
          telefones: data.telefones ? { create: data.telefones } : undefined,
        },
        include: { endereco: true, telefones: true },
      });

      // ---------------------------------------------------------
      // 3. CORREÇÃO: Cria o Prontuário vazio vinculado ao Paciente
      // ---------------------------------------------------------
      await tx.prontuario.create({
        data: {
          id_paciente: created.id_paciente,
          // Se tiver outros campos obrigatórios no model Prontuario, adicione aqui
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
    await this.getById(id);
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
    // Não precisa de getById aqui, pois é uma busca
    const { data, total } = await this.repository.searchPaginated(
      query,
      page,
      limit,
    );
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async delete(id: string) {
    await this.getById(id); // Valida se o paciente existe antes de deletar
    await this.repository.delete(id);
  }

  // --- Sub Recursos ---

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
      // Remove todos os telefones atuais
      await tx.pacienteTelefone.deleteMany({
        where: { id_paciente },
      });

      // Se não vier nenhum telefone, só apaga e retorna
      if (telefones.length === 0) {
        return [];
      }

      // Cria os novos telefones
      await tx.pacienteTelefone.createMany({
        data: telefones.map((t) => ({
          ...t,
          id_paciente,
        })),
      });

      // Retorna os telefones atualizados
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

  // 1. Obter Prontuário (Container)
  async getProntuario(id_paciente: string) {
    // Verifica se paciente existe
    await this.getById(id_paciente);

    const prontuario =
      await this.repository.getProntuarioByPaciente(id_paciente);

    // Auto-fix: Se por algum motivo bizarro o paciente não tiver prontuário (banco legado),
    // a regra diz "Todo paciente nasce com prontuário". Poderíamos criar aqui,
    // mas vamos lançar erro 404 por enquanto.
    if (!prontuario) {
      throw new AppError("Prontuário não encontrado para este paciente.", 404);
    }

    return prontuario;
  }

  // 2. Criar Entrada (Núcleo)
  // pacienteRepository.ts

  async createProntuarioEntrada(
    id_prontuario: string,
    id_profissional: string | null,
    data: CreateProntuarioEntradaDTO,
  ): Promise<ProntuarioEntradaEntity> {
    const entrada = await prisma.prontuarioEntrada.create({
      data: {
        id_prontuario,

        // CORREÇÃO AQUI:
        // Se id_profissional for null, passamos undefined (ou null, dependendo da atualização do prisma).
        // A forma mais segura que o TS aceita se a tipagem não atualizou 100% é:
        id_profissional: id_profissional ?? undefined,

        tipo: data.tipo,
        descricao: data.descricao,
        id_agendamento: data.id_agendamento,
      },
      include: {
        profissional: {
          select: { nome: true, registro_conselho: true },
        },
        arquivos: true,
      },
    });

    return entrada as unknown as ProntuarioEntradaEntity;
  }

  // 3. Listar Entradas
  async listEntradas(id_prontuario: string, tipo?: string) {
    // Validação básica do Enum se tipo for passado
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

  // 4. Detalhar Entrada
  async getEntrada(id_entrada: string) {
    const entrada = await this.repository.getProntuarioEntradaById(id_entrada);
    if (!entrada) throw new AppError("Entrada não encontrada", 404);
    return entrada;
  }

  // 5. Editar Entrada (Apenas Texto)
  async updateEntrada(
    id_entrada: string,
    id_usuario_logado: string,
    data: UpdateProntuarioEntradaDTO,
  ) {
    // Valida se entrada existe
    const entrada = await this.getEntrada(id_entrada);

    // Valida se quem está editando é um profissional (Regra de negócio não exige ser o MESMO autor,
    // mas exige ser profissional. Se exigir ser o mesmo, descomentar abaixo)
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    // Opcional: Bloquear se não for o autor
    // if (entrada.id_profissional !== profissional.id_profissional) throw new AppError("Apenas o autor pode editar.", 403);

    return await this.repository.updateProntuarioEntrada(
      id_entrada,
      data.descricao,
    );
  }

  // 6. Remover Entrada
  async deleteEntrada(id_entrada: string, id_usuario_logado: string) {
    // Valida permissão
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    await this.getEntrada(id_entrada); // garante que existe
    await this.repository.deleteProntuarioEntrada(id_entrada);
  }

  // 7. Arquivos
  async addArquivo(
    id_entrada: string,
    id_usuario_logado: string,
    data: AddArquivoEntradaDTO,
  ) {
    // Valida Profissional
    const profissional =
      await this.repository.findProfissionalByUserId(id_usuario_logado);
    if (!profissional) throw new AppError("Acesso negado.", 403);

    // Valida Entrada
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
