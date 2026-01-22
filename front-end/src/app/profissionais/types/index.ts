export interface ProfissionalSummary {
  id_profissional: string;
  nome: string;
  cpf: string;
  registro_conselho: string;
  id_usuario: string;
}


export type ProfissionalDetail = ProfissionalSummary;

export interface CreateProfissionalPayload {
  nome: string;
  cpf: string;
  registro_conselho: string;

  // legado (opcional agora)
  id_usuario?: string;

  
  usuario?: {
    email: string;
    senha: string;
    tipo_usuario?: string; // default: "PROFISSIONAL"
  };

  telefones?: { telefone: string; principal: boolean }[];
  horarios?: { dia_semana: number; hora_inicio: Date; hora_fim: Date }[];
}

export interface UpdateProfissionalPayload {
  nome?: string;
  registro_conselho?: string;
}

export interface UpdateTelefonePayload {
  telefone?: string;
  principal?: boolean;
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

// ======= Form do modal =======

export interface ProfissionalFormData {
  nome?: string;
  cpf?: string;
  registro_conselho?: string;

 
  email?: string;
  senha?: string;

  
  id_usuario?: string;
}
