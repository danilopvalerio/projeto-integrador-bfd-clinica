import { IBaseRepository, RepositoryPaginatedResult } from "@/shared/dtos/index.dto";  

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

    // Relação Serviço e Profissional
    addProfissional(id_servico: string, id_profissional: string): Promise<any>;
    removeProfissional(id_servico: string, id_profissional: string): Promise<void>;
    listProfissionais(id_servico: string): Promise<any[]>; 
    findProfissionaisPaginated(id_servico: string, page: number, limit: number): Promise<RepositoryPaginatedResult<any>>;
    searchProfissionaisPaginated(id_servico: string, query: string, page: number, limit: number): Promise<RepositoryPaginatedResult<any>>;
    syncProfissionais(id_servico: string, profissionalIds: string[]): Promise<any[]>;
}