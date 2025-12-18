import { IBaseRepository } from "../../shared/dtos/index.dto";

// Espelho da tabela do banco (Prisma)
export interface SpecialtyEntity {
  id_especialidade: string;
  nome: string;
  descricao?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateSpecialtyDTO {
  nome: string;
  descricao?: string;
}

export interface UpdateSpecialtyDTO {
  nome?: string;
  descricao?: string;
}

// O tipo que devolvemos para o Frontend
export type SpecialtyResponseDTO = SpecialtyEntity;

/**
 * Interface do Repositório de Especialidade.
 * Estende a base genérica e adiciona métodos exclusivos.
 */
export interface ISpecialtyRepository
  extends IBaseRepository<SpecialtyEntity, CreateSpecialtyDTO, UpdateSpecialtyDTO> {
  findByNome(nome: string): Promise<SpecialtyEntity | null>;
  findMany(): Promise<SpecialtyEntity[]>;
}
