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
    const { data, total } = await this.profissionalRepository.findPaginated(page, limit);
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async searchPaginated({ query, page, limit }: { query: string; page: number; limit: number }) {
    const { data, total } = await this.profissionalRepository.searchPaginated(query, page, limit);
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

 async delete(id: string) {
  await this.getById(id);
  await this.profissionalRepository.delete(id);
  }

  // Telefones
  async addTelefone(id: string, data: any) { return await this.profissionalRepository.addTelefone(id, data); }
  async updateTelefone(id_tel: string, data: UpdateTelefoneDTO) { return await this.profissionalRepository.updateTelefone(id_tel, data); }
  async listTelefones(id: string) { return await this.profissionalRepository.listTelefones(id); }
  async deleteTelefone(id_tel: string) { await this.profissionalRepository.deleteTelefone(id_tel); }
  
  // Horários
  async addHorario(id: string, data: any) { return await this.profissionalRepository.addHorario(id, data); }
  async updateHorario(id_horario: string, data: UpdateHorarioDTO) { return await this.profissionalRepository.updateHorario(id_horario, data); }
  async listHorarios(id: string) { return await this.profissionalRepository.listHorarios(id); }
  async deleteHorario(id_horario: string) { await this.profissionalRepository.deleteHorario(id_horario); }
}