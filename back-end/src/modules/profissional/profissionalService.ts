//src/modules/profissional/profissionalService.ts
import { hashPassword } from "../../shared/utils/hash";
import {
  IProfissionalRepository,
  CreateProfissionalDTO,
  ProfissionalEntity,
  UpdateProfissionalDTO,
  UpdateTelefoneDTO,
  UpdateHorarioDTO,
} from "./profissionalDTO";
import { AppError } from "../../shared/http/middlewares/error.middleware";
import { prisma } from "../../shared/database/prisma";

export class ProfissionalService {
  constructor(private profissionalRepository: IProfissionalRepository) {}

  // =====================================================
  // CREATE (com transaction: cria usuário + profissional)
  // =====================================================
  async create(data: CreateProfissionalDTO): Promise<ProfissionalEntity> {
    const cpfExists = await this.profissionalRepository.findByCpf(data.cpf);
    if (cpfExists) throw new AppError("CPF já cadastrado", 409);

    const hasIdUsuario = !!data.id_usuario;
    const hasUsuarioPayload = !!data.usuario;

    if (!hasIdUsuario && !hasUsuarioPayload) {
      throw new AppError(
        "Envie id_usuario (legado) ou usuario { email, senha } para criar automaticamente.",
        400
      );
    }

    const profissional = await prisma.$transaction(async (tx) => {
      let id_usuario = data.id_usuario;

      // Se vier usuario, cria automaticamente
      if (!id_usuario && data.usuario) {
        const email = data.usuario.email.trim().toLowerCase();
        const emailExists = await tx.usuario.findUnique({ where: { email } });
        if (emailExists) throw new AppError("E-mail já cadastrado", 409);

        const senhaTexto = data.usuario.senha || "Mudar123!";
        const senhaCriptografada = await hashPassword(senhaTexto);

        const usuarioCriado = await tx.usuario.create({
          data: {
            email,
            senha_hash: senhaCriptografada, // Salva criptografado
            tipo_usuario: data.usuario.tipo_usuario ?? "PROFISSIONAL",
            ativo: true,
          },
        });

        id_usuario = usuarioCriado.id_usuario;
      }

      // Se veio id_usuario, valida existência
      if (id_usuario) {
        const user = await tx.usuario.findUnique({ where: { id_usuario } });
        if (!user) throw new AppError("Usuário não encontrado", 404);
      }

      // Cria Profissional (com nested create opcional)
      const created = await tx.profissional.create({
        data: {
          nome: data.nome,
          cpf: data.cpf,
          registro_conselho: data.registro_conselho,
          id_usuario: id_usuario!,

          telefones: data.telefones
            ? {
                create: data.telefones.map((t) => ({
                  telefone: t.telefone,
                  principal: t.principal ?? false,
                })),
              }
            : undefined,

          horarios: data.horarios
            ? {
                create: data.horarios.map((h) => ({
                  dia_semana: h.dia_semana,
                  hora_inicio: h.hora_inicio,
                  hora_fim: h.hora_fim,
                })),
              }
            : undefined,
        },
      });

      return created as unknown as ProfissionalEntity;
    });

    return profissional;
  }

  // =======================
  // CRUD / Consultas básicas
  // =======================
  async update(
    id: string,
    data: UpdateProfissionalDTO
  ): Promise<ProfissionalEntity> {
    const profissional = await this.profissionalRepository.findById(id);
    if (!profissional) throw new AppError("Profissional não encontrado", 404);

    return await this.profissionalRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const profissional = await this.profissionalRepository.findById(id);
    if (!profissional) throw new AppError("Profissional não encontrado", 404);

    await this.profissionalRepository.delete(id);
  }

  async getById(id: string): Promise<ProfissionalEntity> {
    const profissional = await this.profissionalRepository.findById(id);
    if (!profissional) throw new AppError("Profissional não encontrado", 404);
    return profissional;
  }

  async listPaginated({ page, limit }: { page: number; limit: number }) {
    const { data, total } = await this.profissionalRepository.findPaginated(
      page,
      limit
    );
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async searchPaginated({
    query,
    page,
    limit,
  }: {
    query: string;
    page: number;
    limit: number;
  }) {
    const { data, total } = await this.profissionalRepository.searchPaginated(
      query,
      page,
      limit
    );
    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // ==========
  // Telefones
  // ==========
  async addTelefone(
    id_profissional: string,
    data: { telefone: string; principal: boolean }
  ) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.addTelefone(id_profissional, data);
  }

  async updateTelefone(id_telefone: string, data: UpdateTelefoneDTO) {
    return await this.profissionalRepository.updateTelefone(id_telefone, data);
  }

  async deleteTelefone(id_telefone: string) {
    await this.profissionalRepository.deleteTelefone(id_telefone);
  }

  async listTelefones(id_profissional: string) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.listTelefones(id_profissional);
  }

  // ==========
  // Horários
  // ==========
  async addHorario(
    id_profissional: string,
    data: { dia_semana: number; hora_inicio: Date; hora_fim: Date }
  ) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.addHorario(id_profissional, data);
  }

  async updateHorario(id_horario: string, data: UpdateHorarioDTO) {
    return await this.profissionalRepository.updateHorario(id_horario, data);
  }

  async deleteHorario(id_horario: string) {
    await this.profissionalRepository.deleteHorario(id_horario);
  }

  async listHorarios(id_profissional: string) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.listHorarios(id_profissional);
  }

  // =================
  // Especialidades
  // =================
  async addEspecialidade(id_profissional: string, id_especialidade: string) {
    await this.getById(id_profissional);

    const esp = await prisma.especialidade.findUnique({
      where: { id_especialidade },
    });
    if (!esp) throw new AppError("Especialidade não encontrada", 404);

    return await this.profissionalRepository.addEspecialidade(
      id_profissional,
      id_especialidade
    );
  }

  async removeEspecialidade(id_profissional: string, id_especialidade: string) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.removeEspecialidade(
      id_profissional,
      id_especialidade
    );
  }

  async listEspecialidades(id_profissional: string) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.listEspecialidades(
      id_profissional
    );
  }

  async listEspecialidadesPaginated(
    id_profissional: string,
    page: number,
    limit: number
  ) {
    await this.getById(id_profissional);
    const { data, total } =
      await this.profissionalRepository.findEspecialidadesPaginated(
        id_profissional,
        page,
        limit
      );

    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async searchEspecialidadesPaginated(
    id_profissional: string,
    query: string,
    page: number,
    limit: number
  ) {
    await this.getById(id_profissional);
    const { data, total } =
      await this.profissionalRepository.searchEspecialidadesPaginated(
        id_profissional,
        query,
        page,
        limit
      );

    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async syncEspecialidades(
    id_profissional: string,
    especialidadesIds: string[]
  ) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.syncEspecialidades(
      id_profissional,
      especialidadesIds || []
    );
  }

  // ==========
  // Serviços
  // ==========
  async addServico(id_profissional: string, id_servico: string) {
    await this.getById(id_profissional);

    const servico = await prisma.servico.findUnique({ where: { id_servico } });
    if (!servico) throw new AppError("Serviço não encontrado", 404);

    return await this.profissionalRepository.addServico(
      id_profissional,
      id_servico
    );
  }

  async removeServico(id_profissional: string, id_servico: string) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.removeServico(
      id_profissional,
      id_servico
    );
  }

  async listServicos(id_profissional: string) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.listServicos(id_profissional);
  }

  async listServicosPaginated(
    id_profissional: string,
    page: number,
    limit: number
  ) {
    await this.getById(id_profissional);
    const { data, total } =
      await this.profissionalRepository.findServicosPaginated(
        id_profissional,
        page,
        limit
      );

    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async searchServicosPaginated(
    id_profissional: string,
    query: string,
    page: number,
    limit: number
  ) {
    await this.getById(id_profissional);
    const { data, total } =
      await this.profissionalRepository.searchServicosPaginated(
        id_profissional,
        query,
        page,
        limit
      );

    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async syncServicos(id_profissional: string, servicoIds: string[]) {
    await this.getById(id_profissional);
    return await this.profissionalRepository.syncServicos(
      id_profissional,
      servicoIds || []
    );
  }
}
