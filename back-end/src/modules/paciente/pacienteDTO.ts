import {
  IBaseRepository,
  RepositoryPaginatedResult,
} from "../../shared/dtos/index.dto";

// --- ENUMS LOCAIS (Espelhos do Banco) ---
export enum Sexo {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
}

export enum StatusPagamento {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO",
}

export enum TipoArquivoProntuario {
  RADIOGRAFIA = "RADIOGRAFIA",
  FOTO = "FOTO",
  CONSENTIMENTO = "CONSENTIMENTO",
  RECEITA = "RECEITA",
  ATESTADO = "ATESTADO",
  EXAME_EXTERNO = "EXAME_EXTERNO",
  OUTRO = "OUTRO",
}

// --- ENTITIES (Saídas) ---

export interface EnderecoEntity {
  id_endereco: string;
  rua: string;
  numero?: string | null;
  cidade: string;
  estado: string;
}

export interface PacienteEntity {
  id_paciente: string;
  nome: string;
  sexo: Sexo;
  cpf: string;
  data_nascimento: Date;
  id_usuario: string;
  id_endereco?: string | null;

  // Relations
  endereco?: EnderecoEntity;
  telefones?: PacienteTelefoneEntity[];
}

export interface PacienteTelefoneEntity {
  id_telefone: string;
  telefone: string;
  principal: boolean;
  id_paciente: string;
}

export interface PacienteTagEntity {
  id_tag: string;
  nome: string;
  id_paciente: string;
}

export interface PacienteDebitoEntity {
  id_debito: string;
  id_paciente: string;
  id_agendamento?: string | null;
  valor_total: number;
  valor_pago: number;
  status_pagamento: StatusPagamento;
  data_vencimento: Date;
  observacoes?: string | null;
}

export interface ProntuarioEntity {
  id_prontuario: string;
  id_paciente: string;
  id_profissional: string;
  id_agendamento?: string | null;
  data_registro: Date;
  descricao: string;
  observacao_geral?: string | null;

  // Relation Opcional
  profissional?: { nome: string };
}

export interface ProntuarioArquivoEntity {
  id_arquivo: string;
  id_prontuario: string;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string;
  tipo_documento: TipoArquivoProntuario;
  descricao?: string | null;
  data_upload: Date;
}

// --- INPUTS (Entradas) ---

export interface CreatePacienteDTO {
  nome: string;
  sexo: Sexo;
  cpf: string;
  data_nascimento: Date;

  id_usuario?: string;
  usuario?: {
    email: string;
    senha: string;
    tipo_usuario?: string;
  };

  endereco?: {
    rua: string;
    numero?: string;
    cidade: string;
    estado: string;
  };

  telefones?: { telefone: string; principal: boolean }[];
}

export interface UpdatePacienteDTO {
  nome?: string;
  sexo?: Sexo;
  data_nascimento?: Date;
  cpf?: string; // Caso queira permitir editar CPF

  // Novos campos opcionais
  telefones?: string[]; // Recebe array de strings ["83999...", "83888..."]
  endereco?: {
    rua?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
}

// --- NOVOS ENUMS ---
export enum TipoEntradaProntuario {
  ANAMNESE = "ANAMNESE",
  PLANO_TRATAMENTO = "PLANO_TRATAMENTO",
  EVOLUCAO_VISITA = "EVOLUCAO_VISITA",
  DIAGNOSTICO = "DIAGNOSTICO",
  OBSERVACAO_GERAL = "OBSERVACAO_GERAL",
}

// --- NOVAS ENTITIES (Saídas) ---

export interface ProntuarioEntity {
  id_prontuario: string;
  id_paciente: string;
  criado_em: Date;
}

export interface ProntuarioEntradaEntity {
  id_entrada: string;
  id_prontuario: string;
  id_profissional?: string;
  id_agendamento?: string | null;
  tipo: TipoEntradaProntuario;
  descricao: string;
  criado_em: Date;
  atualizado_em: Date;

  // Relations
  profissional?: {
    nome: string;
    registro_conselho: string;
  };
  arquivos?: ProntuarioArquivoEntity[];
}

export interface ProntuarioArquivoEntity {
  id_arquivo: string;
  id_entrada: string;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string;
  tipo_documento: TipoArquivoProntuario;
  descricao?: string | null;
  data_upload: Date;
}

// --- NOVOS INPUTS (Entradas) ---

export interface CreateProntuarioEntradaDTO {
  tipo: TipoEntradaProntuario;
  descricao: string;
  id_agendamento?: string;
  // id_profissional é resolvido internamente pelo token, não vem no body
}

export interface UpdateProntuarioEntradaDTO {
  descricao: string; // Apenas descrição pode ser editada
}

export interface AddArquivoEntradaDTO {
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string;
  tipo_documento: TipoArquivoProntuario;
  descricao?: string;
}
// --- REPOSITORY INTERFACE ---

export interface IPacienteRepository extends IBaseRepository<
  PacienteEntity,
  CreatePacienteDTO,
  UpdatePacienteDTO
> {
  findByCpf(cpf: string): Promise<PacienteEntity | null>;
  findAll(): Promise<PacienteEntity[]>; // Solicitado sem paginação também

  // Sub-recursos
  addTelefone(
    id_paciente: string,
    data: { telefone: string; principal: boolean },
  ): Promise<PacienteTelefoneEntity>;
  deleteTelefone(id_telefone: string): Promise<void>;
  listTelefones(id_paciente: string): Promise<PacienteTelefoneEntity[]>;

  addTag(id_paciente: string, nome: string): Promise<PacienteTagEntity>;
  removeTag(id_tag: string): Promise<void>;
  listTags(id_paciente: string): Promise<PacienteTagEntity[]>;

  addDebito(
    id_paciente: string,
    data: {
      valor_total: number;
      data_vencimento: Date;
      observacoes?: string;
      id_agendamento?: string;
    },
  ): Promise<PacienteDebitoEntity>;
  listDebitos(id_paciente: string): Promise<PacienteDebitoEntity[]>;

  getProntuarioByPaciente(
    id_paciente: string,
  ): Promise<ProntuarioEntity | null>;

  // Auxiliar para segurança
  findProfissionalByUserId(
    id_usuario: string,
  ): Promise<{ id_profissional: string } | null>;

  // Entradas
  createProntuarioEntrada(
    id_prontuario: string,
    id_profissional: string | null,
    data: CreateProntuarioEntradaDTO,
  ): Promise<ProntuarioEntradaEntity>;

  listProntuarioEntradas(
    id_prontuario: string,
    filters?: { tipo?: TipoEntradaProntuario },
  ): Promise<ProntuarioEntradaEntity[]>;

  getProntuarioEntradaById(
    id_entrada: string,
  ): Promise<ProntuarioEntradaEntity | null>;

  updateProntuarioEntrada(
    id_entrada: string,
    descricao: string,
  ): Promise<ProntuarioEntradaEntity>;

  deleteProntuarioEntrada(id_entrada: string): Promise<void>;

  // Arquivos (Agora ligados à Entrada)
  addArquivoEntrada(
    id_entrada: string,
    data: AddArquivoEntradaDTO,
  ): Promise<ProntuarioArquivoEntity>;

  removeArquivoEntrada(id_arquivo: string): Promise<void>;

  listArquivosByEntrada(id_entrada: string): Promise<ProntuarioArquivoEntity[]>;
}
