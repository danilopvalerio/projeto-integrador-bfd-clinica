// src/app/patient/types.ts

// --- ENUMS ---
export enum Sexo {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
}

export enum UserType {
  GERENTE = "GERENTE",
  RECEPCIONISTA = "RECEPCIONISTA",
  PROFISSIONAL = "PROFISSIONAL",
  PACIENTE = "PACIENTE",
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

export enum TipoEntradaProntuario {
  ANAMNESE = "ANAMNESE",
  PLANO_TRATAMENTO = "PLANO_TRATAMENTO",
  EVOLUCAO_VISITA = "EVOLUCAO_VISITA",
  DIAGNOSTICO = "DIAGNOSTICO",
  OBSERVACAO_GERAL = "OBSERVACAO_GERAL",
}

// --- ENTIDADES AUXILIARES ---

export interface Endereco {
  id_endereco: string;
  rua: string;
  numero?: string | null;
  cidade: string;
  estado: string;
}

export interface PacienteTelefone {
  id_telefone: string;
  telefone: string;
  principal: boolean;
  id_paciente: string;
}

// --- ENTIDADES DE USUÁRIO (NECESSÁRIAS PARA O UserCredentialsForm) ---

export interface UserEntity {
  id_usuario: string;
  email: string;
  senha_hash: string;
  tipo_usuario: UserType;
  ativo: boolean;
  created_at?: Date;
  updated_at?: Date;
  nome: string; // Agora o nome existe aqui
}

// --- ENTIDADE PRINCIPAL DE PACIENTE ---

export interface PacienteSummary {
  id_paciente: string;
  sexo: Sexo;
  cpf: string;
  data_nascimento: string;

  id_usuario: string;
  id_endereco?: string | null;

  // Relations
  endereco?: Endereco;
  telefones?: PacienteTelefone[];

  // ATUALIZADO: O nome agora vem dentro do objeto usuário
  usuario?: {
    id_usuario: string;
    nome: string;
    email: string;
    ativo: boolean;
  };
}

export type PacienteDetail = PacienteSummary;

// --- PAYLOADS DE CRIAÇÃO/ATUALIZAÇÃO ---

export interface CreatePacientePayload {
  // Nome removido da raiz e colocado em usuario
  cpf: string;
  sexo: Sexo;
  data_nascimento: string | Date;

  // Objeto de Usuário (Para criar o login e agora o NOME)
  usuario: {
    nome: string; // <--- CAMPO MOVIDO PARA CÁ
    email: string;
    senha: string;
    tipo_usuario: string;
  };

  endereco?: {
    rua: string;
    numero?: string;
    cidade: string;
    estado: string;
  };

  telefones?: { telefone: string; principal: boolean }[];
}

export interface UpdatePacientePayload {
  cpf?: string;
  sexo?: Sexo;
  data_nascimento?: string | Date;

  telefones?: string[];

  endereco?: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
  };

  // Atualização de dados do usuário (apenas nome, email/senha editados separadamente)
  usuario?: {
    nome?: string;
    email?: string;
    senha?: string;
  };
}

// --- DÉBITOS E FINANCEIRO ---

export interface DebitoData {
  id_debito: string;
  data_vencimento: string;
  observacoes?: string | null;
  valor_total: number;
  valor_pago: number;
  status_pagamento: StatusPagamento;
}

// --- PRONTUÁRIO E ARQUIVOS ---

export interface ProntuarioEntity {
  id_prontuario: string;
  id_paciente: string;
  criado_em: string;
}

export interface ProntuarioArquivo {
  id_arquivo: string;
  id_entrada: string;
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string;
  tipo_documento: TipoArquivoProntuario;
  descricao?: string | null;
  data_upload: string;
}

export interface ProntuarioEntrada {
  id_entrada: string;
  id_prontuario: string;
  id_profissional: string;
  tipo: TipoEntradaProntuario;
  descricao: string;
  criado_em: string;
  atualizado_em: string;

  profissional?: {
    // Como Profissional não tem mais nome direto, ele virá via Usuario também no back
    // Mas para o front, geralmente o back já manda o "nome" tratado ou dentro de usuario
    usuario?: {
      nome: string;
    };
    registro_conselho: string;
  };
  arquivos?: ProntuarioArquivo[];
}

export interface CreateEntradaPayload {
  tipo: TipoEntradaProntuario;
  descricao: string;
  id_agendamento?: string;
}

export interface UpdateEntradaPayload {
  descricao: string;
}

export interface AddArquivoPayload {
  nome_arquivo: string;
  url_arquivo: string;
  tipo_arquivo: string;
  tipo_documento: TipoArquivoProntuario;
  descricao?: string;
}
