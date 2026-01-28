export interface ProfissionalSummary {
  id_profissional: string;
  cpf: string;
  registro_conselho: string;
  id_usuario: string;

  usuario?: {
    id_usuario: string;
    nome: string;
    email: string;
    ativo: boolean;
  };
}

export type ProfissionalDetail = ProfissionalSummary;

export interface CreateProfissionalPayload {
  cpf: string;
  registro_conselho: string;

  // Nome movido para dentro de usuario
  usuario: {
    nome: string; // <--- CAMPO MOVIDO PARA CÁ
    email: string;
    senha: string;
    tipo_usuario?: string; // default: "PROFISSIONAL"
  };

  telefones?: { telefone: string; principal: boolean }[];
  horarios?: { dia_semana: number; hora_inicio: Date; hora_fim: Date }[];
}

export interface UpdateProfissionalPayload {
  registro_conselho?: string;

  // Atualização de dados do usuário (nome)
  usuario?: {
    nome?: string;
  };
}

export interface UpdateTelefonePayload {
  telefone?: string;
  principal?: boolean;
}

export enum UserType {
  GERENTE = "GERENTE",
  RECEPCIONISTA = "RECEPCIONISTA",
  PROFISSIONAL = "PROFISSIONAL",
  CLIENTE = "CLIENTE",
}

export interface UpdateHorarioPayload {
  dia_semana?: number;
  hora_inicio?: Date;
  hora_fim?: Date;
}

// ======= Paginação =======

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

// ======= Tipos de vínculos =======

export interface ServicoEntityForProfissional {
  id_servico: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada: number;
  ativo: boolean;
}

export interface EspecialidadeEntityForProfissional {
  id_especialidade: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

// ======= DTOs de request para vincular/desvincular =======

export interface AddServicoToProfissionalPayload {
  id_servico: string;
}

export interface AddEspecialidadeToProfissionalPayload {
  id_especialidade: string;
}

// ======= Form do modal (UI Helper) =======

export interface ProfissionalFormData {
  nome?: string; // Mantemos plano aqui para facilitar o formulário
  cpf?: string;
  registro_conselho?: string;
  email?: string;
  senha?: string;
  id_usuario?: string;
}

export type HorarioEntity = {
  id_horario: string;
  id_profissional: string;
  dia_semana: number; // 0..6
  hora_inicio: string; // ISO string
  hora_fim: string; // ISO string
};
