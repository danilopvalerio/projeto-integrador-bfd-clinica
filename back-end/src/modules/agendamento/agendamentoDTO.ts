import { StatusAgendamento } from "../../shared/database/generated/prisma/client";
import {
  IBaseRepository,
  RepositoryPaginatedResult,
} from "../../shared/dtos/index.dto";

// --- Entities (Saída do Banco) ---
export interface AgendamentoEntity {
  id_agendamento: string;
  id_profissional: string;
  id_paciente: string;
  data_hora_inicio: Date;
  data_hora_fim: Date;
  status: StatusAgendamento;
  observacoes: string | null;
  criado_em: Date;
  atualizado_em: Date;

  // Relations
  paciente: {
    id_paciente: string;
    cpf: string;
    sexo: string;
    // CORREÇÃO: Nome vem de usuário
    usuario: {
      nome: string;
    };
  };
  profissional: {
    id_profissional: string;
    registro_conselho: string;
    // CORREÇÃO: Nome vem de usuário
    usuario: {
      nome: string;
    };
    especialidades: { especialidade: { nome: string } }[];
  };

  servicos: {
    preco_cobrado: number;
    ordem: number;
    servico: {
      id_servico: string;
      nome: string;
      duracao_estimada: number;
    };
  }[];
}

// --- Inputs (Entrada) ---
export interface CreateAgendamentoDTO {
  id_profissional: string;
  id_paciente: string;
  ids_servicos: string[];
  data_hora_inicio: Date;
  data_hora_fim?: Date;
  observacoes?: string;
}

export interface UpdateAgendamentoDTO {
  id_profissional?: string;
  ids_servicos?: string[];
  data_hora_inicio?: Date;
  data_hora_fim?: Date;
  status?: StatusAgendamento;
  observacoes?: string;
}

// --- Outputs (Para o Frontend / FullCalendar) ---

interface AgendamentoUI {
  color: string;
  title: string;
}

export interface AgendamentoCalendarDTO {
  id_agendamento: string;
  start: string;
  end: string;
  status: StatusAgendamento;

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

  // ATUALIZADO AQUI
  servico: {
    nomes: string; // Mantém para exibir no card do calendário (resumo)
    duracao_total: number;
    valor_total: number;
    // Nova lista para o formulário de edição
    itens: {
      id_servico: string;
      nome: string;
      preco: number;
    }[];
  };

  ui: AgendamentoUI;
}

// --- Repository Interface ---
export interface IAgendamentoRepository extends IBaseRepository<
  AgendamentoEntity,
  CreateAgendamentoDTO,
  UpdateAgendamentoDTO
> {
  createWithServices(
    data: CreateAgendamentoDTO,
    servicosData: { id_servico: string; preco: number }[],
  ): Promise<AgendamentoEntity>;

  updateWithServices(
    id: string,
    data: UpdateAgendamentoDTO,
    novosServicosData?: { id_servico: string; preco: number }[],
  ): Promise<AgendamentoEntity>;

  checkAvailability(
    id_profissional: string,
    inicio: Date,
    fim: Date,
    excludeAgendamentoId?: string,
  ): Promise<boolean>;

  findByDateRange(
    inicio: Date,
    fim: Date,
    filters?: { id_profissional?: string },
  ): Promise<AgendamentoEntity[]>;

  findPaginated(
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<AgendamentoEntity>>;

  searchPaginated(
    query: string,
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<AgendamentoEntity>>;

  findByPersonPaginated(
    filter: { id_paciente?: string; id_profissional?: string },
    page: number,
    limit: number,
  ): Promise<RepositoryPaginatedResult<AgendamentoEntity>>;
}
