import {
  ISpecialtyRepository,
  CreateSpecialtyDTO,
  UpdateSpecialtyDTO,
  SpecialtyResponseDTO,
  SpecialtyEntity,
} from "./specialtyDTO";

import {
  PaginatedResult,
  PaginatedQueryDTO,
  SearchPaginatedQueryDTO,
} from "../../shared/dtos/index.dto";

import { AppError } from "../../shared/http/middlewares/error.middleware";

export class SpecialtyService {
  constructor(private specialtyRepository: ISpecialtyRepository) {}

  private mapToResponse(specialty: SpecialtyEntity): SpecialtyResponseDTO {
    return specialty;
  }

  async create(data: CreateSpecialtyDTO): Promise<SpecialtyResponseDTO> {
    if (!data?.nome || !data.nome.trim()) {
      throw new AppError("Nome da especialidade é obrigatório", 400);
    }

    const nomeExiste = await this.specialtyRepository.findByNome(data.nome);

    if (nomeExiste) {
      throw new AppError("Especialidade já cadastrada", 409);
    }

    const specialty = await this.specialtyRepository.create(data);
    return this.mapToResponse(specialty);
  }

  async findAll(): Promise<SpecialtyResponseDTO[]> {
    const specialties = await this.specialtyRepository.findMany();
    return specialties.map(this.mapToResponse);
  }

  async update(id: string, data: UpdateSpecialtyDTO): Promise<SpecialtyResponseDTO> {
    const specialty = await this.specialtyRepository.findById(id);

    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    // Se atualizar nome, valida duplicidade (sem bloquear o próprio registro)
    if (data?.nome && data.nome.trim()) {
      const nomeExiste = await this.specialtyRepository.findByNome(data.nome);

      if (nomeExiste && nomeExiste.id_especialidade !== id) {
        throw new AppError("Especialidade já cadastrada", 409);
      }
    }

    const updated = await this.specialtyRepository.update(id, data);
    return this.mapToResponse(updated);
  }

  async getById(id: string): Promise<SpecialtyResponseDTO> {
    const specialty = await this.specialtyRepository.findById(id);

    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    return this.mapToResponse(specialty);
  }

  async delete(id: string): Promise<void> {
    const specialty = await this.specialtyRepository.findById(id);

    if (!specialty) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    await this.specialtyRepository.delete(id);
  }

  async listPaginated({
    page,
    limit,
  }: PaginatedQueryDTO): Promise<PaginatedResult<SpecialtyResponseDTO>> {
    const { data, total } = await this.specialtyRepository.findPaginated(page, limit);

    return {
      data: data.map(this.mapToResponse),
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async searchPaginated({
    query,
    page,
    limit,
  }: SearchPaginatedQueryDTO): Promise<PaginatedResult<SpecialtyResponseDTO>> {
    if (!query) {
      throw new AppError("Parâmetro de busca não informado", 400);
    }

    const { data, total } = await this.specialtyRepository.searchPaginated(
      query,
      page,
      limit
    );

    return {
      data: data.map(this.mapToResponse),
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }
}
