import { UserType } from "../user/userDTO";

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

// O payload que vai dentro do JWT
export interface TokenPayload {
  userId: string; // id_usuario
  role: UserType | string; // O tipo (GERENTE, PACIENTE, etc)
}

// Resposta para o Front-end
export interface SessionResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserType | string;
  };
}
