//src/modules/profissional/profissionalDTO.ts
import {
  IBaseRepository,
  RepositoryPaginatedResult,
} from "../../shared/dtos/index.dto";
import { ServicoEntity } from "../servico/servicoDTO";
import { EspecialidadeEntity } from "../especialidade/especialidadeDTO";

export interface ProfissionalEntity {
  id_profissional: string;
  nome: string;
  cpf: string;
  registro_conselho: string;
  id_usuario: string;
}

export interface CreateProfissionalDTO {
  nome: string;
  cpf: string;
  registro_conselho: string;

  id_usuario?: string;

  usuario?: {
    email: string;
    senha: string;
    tipo_usuario?: string; // default: "PROFISSIONAL"
  };

  telefones?: { telefone: string; principal: boolean }[];
  horarios?: { dia_semana: number; hora_inicio: Date; hora_fim: Date }[];
}

export interface UpdateProfissionalDTO {
  nome?: string;
  registro_conselho?: string;
}

export interface UpdateTelefoneDTO {
  telefone?: string;
  principal?: boolean;
}

export interface UpdateHorarioDTO {
  dia_semana?: number;
  hora_inicio?: Date;
  hora_fim?: Date;
}

export interface IProfissionalRepository
  extends IBaseRepository<
    ProfissionalEntity,
    CreateProfissionalDTO,
    UpdateProfissionalDTO
  > {
  findByCpf(cpf: string): Promise<ProfissionalEntity | null>;

  // --- Telefones ---
  addTelefone(
    id_profissional: string,
    data: { telefone: string; principal: boolean }
  ): Promise<any>;
  updateTelefone(id_telefone: string, data: UpdateTelefoneDTO): Promise<any>;
  deleteTelefone(id_telefone: string): Promise<void>;
  listTelefones(id_profissional: string): Promise<any[]>;

  // --- Horários ---
  addHorario(
    id_profissional: string,
    data: { dia_semana: number; hora_inicio: Date; hora_fim: Date }
  ): Promise<any>;
  updateHorario(id_horario: string, data: UpdateHorarioDTO): Promise<any>;
  deleteHorario(id_horario: string): Promise<void>;
  listHorarios(id_profissional: string): Promise<any[]>;

  // --- Especialidades (Profissional x Especialidade) ---
  addEspecialidade(
    id_profissional: string,
    id_especialidade: string
  ): Promise<void>;
  removeEspecialidade(
    id_profissional: string,
    id_especialidade: string
  ): Promise<void>;
  listEspecialidades(id_profissional: string): Promise<EspecialidadeEntity[]>;
  findEspecialidadesPaginated(
    id_profissional: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<EspecialidadeEntity>>;
  searchEspecialidadesPaginated(
    id_profissional: string,
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<EspecialidadeEntity>>;
  syncEspecialidades(
    id_profissional: string,
    especialidadesIds: string[]
  ): Promise<EspecialidadeEntity[]>;

  // --- Serviços (Profissional x Servico) ---
  addServico(id_profissional: string, id_servico: string): Promise<any>;
  removeServico(id_profissional: string, id_servico: string): Promise<void>;
  listServicos(id_profissional: string): Promise<ServicoEntity[]>;
  findServicosPaginated(
    id_profissional: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ServicoEntity>>;
  searchServicosPaginated(
    id_profissional: string,
    query: string,
    page: number,
    limit: number
  ): Promise<RepositoryPaginatedResult<ServicoEntity>>;
  syncServicos(
    id_profissional: string,
    servicoIds: string[]
  ): Promise<ServicoEntity[]>;
}
