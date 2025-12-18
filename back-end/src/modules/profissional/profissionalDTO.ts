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

export interface IProfissionalRepository
  extends IBaseRepository<
    ProfissionalEntity,
    CreateProfissionalDTO,
    UpdateProfissionalDTO
  > {
  findByCpf(cpf: string): Promise<ProfissionalEntity | null>;
}
