// src/modules/user/userDTO.ts

import { IBaseRepository } from "../../shared/dtos/index.dto";

export enum UserType {
  GERENTE = "GERENTE",
  RECEPCIONISTA = "RECEPCIONISTA",
  PROFISSIONAL = "PROFISSIONAL",
  CLIENTE = "CLIENTE",
}

// Espelho da tabela do banco (Prisma)
export interface UserEntity {
  id_usuario: string;
  email: string;
  senha_hash: string;
  tipo_usuario: UserType;
  ativo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateUserDTO {
  email: string;
  senha_hash: string;
  tipo_usuario: UserType;
}

export interface UpdateUserDTO {
  email?: string;
  senha_hash?: string;
  tipo_usuario?: UserType;
  ativo?: boolean;
}

// O tipo que devolvemos para o Frontend (Sem a senha)
export type UserResponseDTO = Omit<UserEntity, "senha_hash">;

/**
 * Interface do Repositório de Usuário.
 * Estende a base genérica e adiciona métodos exclusivos.
 */
export interface IUserRepository
  extends IBaseRepository<UserEntity, CreateUserDTO, UpdateUserDTO> {
  findByEmail(email: string): Promise<UserEntity | null>;
  findMany(): Promise<UserEntity[]>;
}
