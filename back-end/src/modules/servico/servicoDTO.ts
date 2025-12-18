import { IBaseRepository } from "@/shared/dtos/index.dto";  

export interface ServicoEntity {
    id_servico: string;
    id_especialidade: string;
    nome: string;
    duracao_estimada: number;
    descricao: string;
    preco: number;
    ativo: boolean;
    preco_visivel_paciente: boolean;
}

export interface CreateServicoDTO {
    id_especialidade: string;
    nome: string;
    duracao_estimada: number;
    descricao: string;
    preco: number;
    ativo: boolean;
    preco_visivel_paciente: boolean;
}

export interface UpdateServicoDTO {
    id_especialidade?: string;
    nome?: string;
    duracao_estimada?: number;
    descricao?: string;
    preco?: number;
    ativo?: boolean;
    preco_visivel_paciente?: boolean;
}

export type ServicoResponseDTO = ServicoEntity;

export interface IServicoRepository
    extends IBaseRepository<ServicoEntity, CreateServicoDTO, UpdateServicoDTO> {
    findByNome(nome: string): Promise<ServicoEntity | null>;
    findMany(): Promise<ServicoEntity[]>;
}