export interface LogUsuario {
  id_usuario: string;
  email: string;
  cargo?: string;
  nome?: string; // Fallback direto se o back retornar flat
  // Relações opcionais vindas do Prisma include
  paciente?: { nome: string } | null;
  profissional?: { nome: string } | null;
  funcionario?: { nome: string } | null;
}

export interface Log {
  id: string;
  tipo: string;
  acao: string;
  descricao?: string;
  ip?: string;
  user_agent?: string;
  sucesso: boolean;
  data: string; // ISO Date string
  id_usuario?: string;
  usuario?: LogUsuario | null;
  dados: JSON;
}

export interface LogResponse {
  data: Log[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}
