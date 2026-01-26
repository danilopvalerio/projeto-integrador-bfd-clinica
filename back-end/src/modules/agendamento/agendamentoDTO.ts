import { StatusAgendamento } from "../../shared/database/generated/prisma/client";
import {
  IBaseRepository,
  RepositoryPaginatedResult,
} from "../../shared/dtos/index.dto";

// --- Entities (Saída do Banco) ---
// Reflete a estrutura do banco com os includes
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
    nome: string;
    cpf: string;
    sexo: string; // O Prisma gera Enum, mas no JS tratamos como string na visualização
  };
  profissional: {
    id_profissional: string;
    nome: string;
    registro_conselho: string;
    especialidades: { especialidade: { nome: string } }[];
  };
  // Relação N:N através da tabela pivô
  servicos: {
    preco_cobrado: number; // Preço histórico salvo na pivô
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
  ids_servicos: string[]; // Recebe apenas os IDs
  data_hora_inicio: Date;
  data_hora_fim?: Date; // Opcional, calculado se omitido
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

  // Objeto Agregado (Resumo para o card)
  servico: {
    nomes: string; // Ex: "Consulta + Exame"
    duracao_total: number;
    valor_total: number; // Soma dos preços cobrados (histórico)
  };

  ui: AgendamentoUI;
}

// --- Repository Interface ---
export interface IAgendamentoRepository extends IBaseRepository<
  AgendamentoEntity,
  CreateAgendamentoDTO,
  UpdateAgendamentoDTO
> {
  // Método customizado para garantir integridade do snapshot de preço
  createWithServices(
    data: CreateAgendamentoDTO,
    servicosData: { id_servico: string; preco: number }[],
  ): Promise<AgendamentoEntity>;

  // Método customizado para atualização complexa de N:N
  updateWithServices(
    id: string,
    data: UpdateAgendamentoDTO,
    novosServicosData?: { id_servico: string; preco: number }[],
  ): Promise<AgendamentoEntity>;

  // Checagem de conflito de horário
  checkAvailability(
    id_profissional: string,
    inicio: Date,
    fim: Date,
    excludeAgendamentoId?: string,
  ): Promise<boolean>;

  // Busca por intervalo de datas (para o calendário)
  findByDateRange(
    inicio: Date,
    fim: Date,
    filters?: { id_profissional?: string },
  ): Promise<AgendamentoEntity[]>;

  // As assinaturas de findPaginated e searchPaginated vêm de IBaseRepository,
  // mas reforçamos o retorno tipado aqui:
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
