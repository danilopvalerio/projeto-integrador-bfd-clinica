import { IBaseRepository } from "@/shared/dtos/index.dto";

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
  id_usuario: string;

  telefones?: { telefone: string; principal: boolean }[];
  horarios?: { dia_semana: number; hora_inicio: Date; hora_fim: Date }[];
}

export interface UpdateProfissionalDTO {
  nome: string;
  registro_conselho: string;
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
  extends IBaseRepository<ProfissionalEntity, CreateProfissionalDTO, UpdateProfissionalDTO> {
  findByCpf(cpf: string): Promise<ProfissionalEntity | null>;
  
  // Métodos de Telefone - Use nomes claros para os IDs
  addTelefone(id_profissional: string, data: { telefone: string; principal: boolean }): Promise<any>;
  updateTelefone(id_telefone: string, data: UpdateTelefoneDTO): Promise<any>;
  deleteTelefone(id_telefone: string): Promise<void>;
  listTelefones(id_profissional: string): Promise<any[]>;

  // Métodos de Horário
  addHorario(id_profissional: string, data: { dia_semana: number; hora_inicio: Date; hora_fim: Date }): Promise<any>;
  updateHorario(id_horario: string, data: UpdateHorarioDTO): Promise<any>;
  deleteHorario(id_horario: string): Promise<void>;
  listHorarios(id_profissional: string): Promise<any[]>;
}