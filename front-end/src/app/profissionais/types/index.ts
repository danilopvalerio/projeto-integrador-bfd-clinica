// src/app/professionals/types/index.ts

// ======= Tipos principais (espelho do back-end) =======

export interface ProfissionalSummary {
  id_profissional: string;
  nome: string;
  cpf: string;
  registro_conselho: string;
  id_usuario: string;
}

// No back, o "detail" do profissional é basicamente o entity.
// Se no futuro o back retornar mais campos (telefones/horarios), você adiciona aqui.
export type ProfissionalDetail = ProfissionalSummary;

export interface CreateProfissionalPayload {
  nome: string;
  cpf: string;
  registro_conselho: string;
  id_usuario: string;
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

// ======= Paginação (igual padrão que o services/page.tsx espera) =======

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

// ======= Tipos de vínculos (usados dentro do módulo Profissionais) =======
// Regra do líder: usar DTO próprio do módulo de Profissional.
// Então a gente declara aqui os shapes necessários pro front.

// O back retorna ServicoEntity (muito parecido com o ServicoSummary do módulo Services)
export interface ServicoEntityForProfissional {
  id_servico: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada: number;
  ativo: boolean;
  // se o back incluir mais campos, você adiciona aqui sem medo
}

// EspecialidadeEntity do back (não recebi o DTO, então fiz o mínimo seguro)
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

export interface ProfissionalFormData {
  nome?: string;
  cpf?: string;
  registro_conselho?: string;
  id_usuario?: string;
}
