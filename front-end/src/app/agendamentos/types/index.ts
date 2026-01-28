// src/app/agendamentos/types.ts

export enum StatusAgendamento {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  CANCELADO = "CANCELADO",
  CONCLUIDO = "CONCLUIDO",
  NAO_COMPARECEU = "NAO_COMPARECEU",
}

// --- DTO DO CALENDÁRIO (O Service do Back já "achata" o nome aqui) ---
export interface AgendamentoCalendarDTO {
  id_agendamento: string;
  start: string;
  end: string;
  status: StatusAgendamento;

  // Aqui o nome vem direto pois o Service fez o map
  paciente: {
    id_paciente: string;
    nome: string;
    sexo: string;
    cpf: string;
  };

  profissional: {
    id_profissional: string;
    nome: string;
    registro_conselho: string;
    especialidades: string[];
  };

  servico: {
    nomes: string;
    duracao_total: number;
    valor_total: number;
  };

  ui: {
    color: string;
    title: string;
  };
}

export interface AgendamentoDetailDTO extends AgendamentoCalendarDTO {
  observacoes?: string;
  servicos: ServicoSummary[];
}

// --- SUMMARIES (Usados nos Selects/Modais de busca) ---
// Estes vêm direto dos Repositories de Paciente/Profissional, então têm estrutura aninhada

export interface PacienteSummary {
  id_paciente: string;
  cpf: string;
  // O nome agora reside em usuario
  usuario?: {
    nome: string;
  };
}

export interface ProfissionalSummary {
  id_profissional: string;
  cpf: string;
  registro_conselho: string;
  // O nome agora reside em usuario
  usuario?: {
    nome: string;
  };
}

export interface ServicoSummary {
  id_servico: string;
  nome: string;
  duracao_estimada: number;
  preco: number;
}

// --- PAYLOADS ---

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
}
