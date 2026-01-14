import {
  IEspecialidadeRepository,
  CreateEspecialidadeDTO,
  UpdateEspecialidadeDTO,
  EspecialidadeResponseDTO,
  EspecialidadeEntity,
} from "./especialidadeDTO";

import {
  PaginatedResult,
  PaginatedQueryDTO,
  SearchPaginatedQueryDTO,
} from "../../shared/dtos/index.dto";

import { AppError } from "../../shared/http/middlewares/error.middleware";

export class EspecialidadeService {
  constructor(private especialidadeRepository: IEspecialidadeRepository) {}

  private mapToResponse(
    especialidade: EspecialidadeEntity
  ): EspecialidadeResponseDTO {
    return especialidade;
  }

  async create(
    data: CreateEspecialidadeDTO
  ): Promise<EspecialidadeResponseDTO> {
    if (!data?.nome || !data.nome.trim()) {
      throw new AppError("Nome da especialidade é obrigatório", 400);
    }

    const nomeExiste = await this.especialidadeRepository.findByNome(data.nome);

    if (nomeExiste) {
      throw new AppError("Especialidade já cadastrada", 409);
    }

    const especialidade = await this.especialidadeRepository.create(data);
    return this.mapToResponse(especialidade);
  }

  async findAll(): Promise<EspecialidadeResponseDTO[]> {
    const especialidades = await this.especialidadeRepository.findMany();
    return especialidades.map(this.mapToResponse);
  }

  async update(
    id: string,
    data: UpdateEspecialidadeDTO
  ): Promise<EspecialidadeResponseDTO> {
    const especialidade = await this.especialidadeRepository.findById(id);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    // Se atualizar nome, valida duplicidade (sem bloquear o próprio registro)
    if (data?.nome && data.nome.trim()) {
      const nomeExiste = await this.especialidadeRepository.findByNome(
        data.nome
      );

      if (nomeExiste && nomeExiste.id_especialidade !== id) {
        throw new AppError("Especialidade já cadastrada", 409);
      }
    }

    const updated = await this.especialidadeRepository.update(id, data);
    return this.mapToResponse(updated);
  }

  async getById(id: string): Promise<EspecialidadeResponseDTO> {
    const especialidade = await this.especialidadeRepository.findById(id);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    return this.mapToResponse(especialidade);
  }

  async delete(id: string): Promise<void> {
    const especialidade = await this.especialidadeRepository.findById(id);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    await this.especialidadeRepository.delete(id);
  }

  async listPaginated({
    page,
    limit,
  }: PaginatedQueryDTO): Promise<PaginatedResult<EspecialidadeResponseDTO>> {
    const { data, total } = await this.especialidadeRepository.findPaginated(
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

  async searchPaginated({
    query,
    page,
    limit,
  }: SearchPaginatedQueryDTO): Promise<
    PaginatedResult<EspecialidadeResponseDTO>
  > {
    if (!query) {
      throw new AppError("Parâmetro de busca não informado", 400);
    }

    const { data, total } = await this.especialidadeRepository.searchPaginated(
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

