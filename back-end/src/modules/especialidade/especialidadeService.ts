import {
  IEspecialidadeRepository,
  CreateEspecialidadeDTO,
  UpdateEspecialidadeDTO,
  EspecialidadeResponseDTO,
  EspecialidadeEntity,
  ProfissionalVinculadoDTO,
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
    especialidade: EspecialidadeEntity,
  ): EspecialidadeResponseDTO {
    return especialidade;
  }
  async listProfissionaisPaginated(
    id_especialidade: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ProfissionalVinculadoDTO>> {
    // Valida se a especialidade existe
    const especialidade =
      await this.especialidadeRepository.findById(id_especialidade);
    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    const { data, total } =
      await this.especialidadeRepository.listProfissionaisPaginated(
        id_especialidade,
        page,
        limit,
      );

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async searchProfissionaisPaginated(
    id_especialidade: string,
    query: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<ProfissionalVinculadoDTO>> {
    const especialidade =
      await this.especialidadeRepository.findById(id_especialidade);
    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    const { data, total } =
      await this.especialidadeRepository.searchProfissionaisPaginated(
        id_especialidade,
        query,
        page,
        limit,
      );

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }
  async create(
    data: CreateEspecialidadeDTO,
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
    return especialidades.map((e) => this.mapToResponse(e));
  }

  async update(
    id: string,
    data: UpdateEspecialidadeDTO,
  ): Promise<EspecialidadeResponseDTO> {
    const especialidade = await this.especialidadeRepository.findById(id);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    if (data?.nome && data.nome.trim()) {
      const nomeExiste = await this.especialidadeRepository.findByNome(
        data.nome,
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
      limit,
    );

    return {
      data: data.map((e) => this.mapToResponse(e)),
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
      limit,
    );

    return {
      data: data.map((e) => this.mapToResponse(e)),
      total,
      page,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  //profissionais
  async listProfissionais(
    idEspecialidade: string,
  ): Promise<ProfissionalVinculadoDTO[]> {
    const especialidade =
      await this.especialidadeRepository.findById(idEspecialidade);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    return this.especialidadeRepository.listProfissionais(idEspecialidade);
  }

  async addProfissional(
    idEspecialidade: string,
    idProfissional: string,
  ): Promise<void> {
    if (!idProfissional) {
      throw new AppError("Profissional não informado", 400);
    }

    const especialidade =
      await this.especialidadeRepository.findById(idEspecialidade);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    await this.especialidadeRepository.addProfissional(
      idEspecialidade,
      idProfissional,
    );
  }

  async removeProfissional(
    idEspecialidade: string,
    idProfissional: string,
  ): Promise<void> {
    const especialidade =
      await this.especialidadeRepository.findById(idEspecialidade);

    if (!especialidade) {
      throw new AppError("Especialidade não encontrada", 404);
    }

    await this.especialidadeRepository.removeProfissional(
      idEspecialidade,
      idProfissional,
    );
  }
}
