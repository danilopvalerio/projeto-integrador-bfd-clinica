export type LogType = "ACESSO" | "SISTEMA";

export interface LogUsuario {
  id_usuario: string;
  nome?: string;
  email: string;
}

export interface Log {
  id: string;
  tipo: string;
  acao: string;
  descricao?: string;
  ip?: string;
  user_agent?: string;
  sucesso: boolean;
  data: string; 
  usuario?: LogUsuario;
}
