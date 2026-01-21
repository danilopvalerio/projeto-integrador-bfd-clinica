export type LogTipo = "ACESSO" | "SISTEMA";

export type LogAcaoAcesso = "LOGIN" | "LOGOUT";

export interface LogEntity {
  id_log: string;
  tipo: LogTipo;
  id_usuario: string | null;
  acao: string;
  ip?: string;
  user_agent?: string;
  sucesso?: boolean;
  detalhes?: string;
  data: Date;
}


export interface CreateLogDTO {
  tipo: LogTipo;
  id_usuario?: string;
  // ACESSO
  acao?: LogAcaoAcesso;
  ip?: string;
  user_agent?: string;
  sucesso?: boolean;
  data?: Date;
}
