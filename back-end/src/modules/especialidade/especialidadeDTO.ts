import {
  IBaseRepository,
  RepositoryPaginatedResult,
} from "../../shared/dtos/index.dto";

// Espelho da tabela do banco (Prisma)
export interface EspecialidadeEntity {
  id_especialidade: string;
  nome: string;
  descricao?: string | null;
}

export interface CreateEspecialidadeDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateEspecialidadeDTO {
  nome?: string;
  descricao?: string;
}

export interface ProfissionalVinculadoDTO {
  id_profissional: string;
  nome: string;
  cargo?: string;
}

// O tipo que devolvemos para o Frontend
export type EspecialidadeResponseDTO = EspecialidadeEntity;

/**
 * Interface do Repositório de Especialidade.
 */
export interface IEspecialidadeRepository extends IBaseRepository<
  EspecialidadeEntity,
  CreateEspecialidadeDTO,
  UpdateEspecialidadeDTO
> {
  findById(id: string): Promise<EspecialidadeEntity | null>;
  findByNome(nome: string): Promise<EspecialidadeEntity | null>;
  findMany(): Promise<EspecialidadeEntity[]>;

  listProfissionais(
    id_especialidade: string,
  ): Promise<ProfissionalVinculadoDTO[]>;

  addProfissional(
    id_especialidade: string,
    id_profissional: string,
  ): Promise<void>;

  removeProfissional(
    id_especialidade: string,
    id_profissional: string,
  ): Promise<void>;
  listProfissionaisPaginated(
    id_especialidade: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<ProfissionalVinculadoDTO>>;

  searchProfissionaisPaginated(
    id_especialidade: string,
    query: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<ProfissionalVinculadoDTO>>;
}
