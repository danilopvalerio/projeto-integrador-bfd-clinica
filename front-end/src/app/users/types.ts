export enum UserType {
  GERENTE = "GERENTE",
  RECEPCIONISTA = "RECEPCIONISTA",
  PROFISSIONAL = "PROFISSIONAL",
  CLIENTE = "CLIENTE",
}

export interface UserSummary {
  id_usuario: string;
  nome: string;
  email: string;
  tipo_usuario: UserType;
  ativo: boolean;
}

export interface UserDetail extends UserSummary {
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserPayload {
  nome: string;
  email: string;
  senha_hash: string;
  tipo_usuario: UserType;
}

export interface UpdateUserPayload {
  nome?: string;
  email?: string;
  senha_hash?: string;
  tipo_usuario?: UserType;
  ativo?: boolean;
}
