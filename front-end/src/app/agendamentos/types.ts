export enum StatusAgendamento {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  CANCELADO = "CANCELADO",
  CONCLUIDO = "CONCLUIDO",
  NAO_COMPARECEU = "NAO_COMPARECEU",
}

export interface AgendamentoDetailDTO {
  id_agendamento: string;
  start: string;
  end: string;
  status: StatusAgendamento;
  observacoes?: string;
  paciente: {
    id_paciente: string;
    nome: string;
  };
  profissional: {
    id_profissional: string;
    nome: string;
  };
  servicos: {
    id_servico: string;
    nome: string;
    preco: number;
    duracao_estimada: number;
  }[];
  ui: { color: string; title: string };
}

// O que usamos na agenda (mais simples)
export interface AgendamentoCalendarDTO extends AgendamentoDetailDTO {
  servico: {
    nomes: string;
    valor_total: number;
    duracao_total: number;
  };
}

export interface CreateAgendamentoPayload {
  id_profissional: string;
  id_paciente: string;
  ids_servicos: string[];
  data_hora_inicio: string;
  data_hora_fim?: string;
  observacoes?: string;
}

export interface UpdateAgendamentoPayload {
  id_profissional?: string;
  ids_servicos?: string[];
  data_hora_inicio?: string;
  data_hora_fim?: string;
  status?: StatusAgendamento;
  observacoes?: string;
  id_paciente?: string; // Caso decidamos permitir mudar paciente no futuro
}

export interface ServicoSummary {
  id_servico: string;
  nome: string;
  preco: number;
  duracao_estimada: number;
}

// Atualizado com CPF opcional
export interface PacienteSummary {
  id_paciente: string;
  nome: string;
  cpf?: string;
}

export interface ProfissionalSummary {
  id_profissional: string;
  nome: string;
  registro_conselho: string;
  cpf: string;
}
