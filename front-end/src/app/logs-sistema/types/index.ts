export interface LogUsuario {
  id_usuario: string;
  email: string;
  nome: string; // Agora é obrigatório e direto
  tipo_usuario: string; // Antigo cargo
  ativo: boolean;
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
  dados: JSON; // JSON
}

export interface LogResponse {
  data: Log[];
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}
