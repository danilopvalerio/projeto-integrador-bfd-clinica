// src/modules/servico/types.ts

export interface ServicoSummary {
  id_servico: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada: number;
  ativo: boolean;
}

export interface ServicoDetail extends ServicoSummary {
  preco_visivel_paciente: boolean;
}

export interface CreateServicoPayload {
  nome: string;
  descricao: string;
  preco: number;
  duracao_estimada: number;
  ativo: boolean;
  preco_visivel_paciente: boolean;
}

export type UpdateServicoPayload = Partial<CreateServicoPayload>;

export interface ProfissionalVinculado {
  id_profissional: string;
  nome: string;
  cargo: string;
}
