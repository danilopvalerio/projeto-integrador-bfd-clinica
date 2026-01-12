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

  async create(data: CreateProfissionalDTO): Promise<ProfissionalEntity> {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: data.id_usuario },
    });
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const cpfExists = await this.profissionalRepository.findByCpf(data.cpf);
    if (cpfExists)
      throw new AppError("CPF já cadastrado para um profissional", 409);

    return await this.profissionalRepository.create(data);
  }

  async update(id: string, data: UpdateProfissionalDTO) {
    await this.getById(id);
    return await this.profissionalRepository.update(id, data);
  }

  async getById(id: string) {
    const prof = await this.profissionalRepository.findById(id);
    if (!prof) throw new AppError("Profissional não encontrado", 404);
    return prof;
  }

  async listPaginated({ page, limit }: { page: number; limit: number }) {
    const { data, total } = await this.profissionalRepository.findPaginated(
      page,
      limit
    );
    return { data, total, page, lastPage: Math.ceil(total / limit) };
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
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async delete(id: string) {
    await this.getById(id);
    await this.profissionalRepository.delete(id);
  }

  // --- Telefones ---
  async addTelefone(id: string, data: any) {
    return await this.profissionalRepository.addTelefone(id, data);
  }
  async updateTelefone(id_tel: string, data: UpdateTelefoneDTO) {
    return await this.profissionalRepository.updateTelefone(id_tel, data);
  }
  async listTelefones(id: string) {
    return await this.profissionalRepository.listTelefones(id);
  }
  async deleteTelefone(id_tel: string) {
    await this.profissionalRepository.deleteTelefone(id_tel);
  }

  // --- Horários ---
  async addHorario(id: string, data: any) {
    return await this.profissionalRepository.addHorario(id, data);
  }
  async updateHorario(id_horario: string, data: UpdateHorarioDTO) {
    return await this.profissionalRepository.updateHorario(id_horario, data);
  }
  async listHorarios(id: string) {
    return await this.profissionalRepository.listHorarios(id);
  }
  async deleteHorario(id_horario: string) {
    await this.profissionalRepository.deleteHorario(id_horario);
  }

  // --- Especialidades ---
  async addEspecialidade(id_profissional: string, id_especialidade: string) {
    await this.getById(id_profissional);
    const especialidade = await prisma.especialidade.findUnique({
      where: { id_especialidade },
    });
    if (!especialidade) throw new AppError("Especialidade não encontrada", 404);

    return await this.profissionalRepository.addEspecialidade(
      id_profissional,
      id_especialidade
    );
  }

  async removeEspecialidade(id_profissional: string, id_especialidade: string) {
    await this.getById(id_profissional);
    await this.profissionalRepository.removeEspecialidade(
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
    // Opcional: Validar se IDs existem
    return await this.profissionalRepository.syncEspecialidades(
      id_profissional,
      especialidadesIds || []
    );
  }

  // --- Serviços ---
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
    await this.profissionalRepository.removeServico(
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
    if (servicoIds && servicoIds.length > 0) {
      const encontrados = await prisma.servico.findMany({
        where: { id_servico: { in: servicoIds } },
        select: { id_servico: true },
      });
      const encontradosIds = new Set(encontrados.map((s) => s.id_servico));
      const invalid = servicoIds.filter((id) => !encontradosIds.has(id));
      if (invalid.length > 0) {
        throw new AppError(
          `Serviços não encontrados: ${invalid.join(", ")}`,
          404
        );
      }
    }
    return await this.profissionalRepository.syncServicos(
      id_profissional,
      servicoIds || []
    );
  }
}
