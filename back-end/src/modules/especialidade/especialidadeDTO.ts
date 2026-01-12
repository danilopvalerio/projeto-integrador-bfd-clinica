import { IBaseRepository } from "../../shared/dtos/index.dto";

// Espelho da tabela do banco (Prisma)
export interface EspecialidadeEntity {
  id_especialidade: string;
  nome: string;
  descricao?: string | null;
  // Removi created_at e updated_at pois não constam no seu Schema Prisma para esta tabela
}

export interface CreateEspecialidadeDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateEspecialidadeDTO {
  nome?: string;
  descricao?: string;
}

// O tipo que devolvemos para o Frontend
export type EspecialidadeResponseDTO = EspecialidadeEntity;

/**
 * Interface do Repositório de Especialidade.
 */
export interface IEspecialidadeRepository
  extends IBaseRepository<
    EspecialidadeEntity,
    CreateEspecialidadeDTO,
    UpdateEspecialidadeDTO
  > {
  findByNome(nome: string): Promise<EspecialidadeEntity | null>;
  findMany(): Promise<EspecialidadeEntity[]>;
}
