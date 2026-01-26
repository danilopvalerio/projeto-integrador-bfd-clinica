// --- ENUMS ---
export enum Sexo {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
}

export enum UserType {
  GERENTE = "GERENTE",
  RECEPCIONISTA = "RECEPCIONISTA",
  PROFISSIONAL = "PROFISSIONAL",
  PACIENTE = "PACIENTE", // Ajuste conforme seu backend (CLIENTE ou PACIENTE)
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
}

// --- ENTIDADE PRINCIPAL DE PACIENTE ---

export interface PacienteSummary {
  id_paciente: string;
  nome: string;
  sexo: Sexo;
  cpf: string;
  data_nascimento: string;

  // ID do usuário vinculado (fica na raiz do paciente no seu modelo)
  id_usuario: string;
  id_endereco?: string | null;

  // Relations
  endereco?: Endereco;
  telefones?: PacienteTelefone[];

  // CORREÇÃO: O objeto usuário retornado pelo backend geralmente traz o id e email
  usuario?: {
    id_usuario: string; // Adicionado para corrigir o erro de acesso
    email: string;
  };
}

export type PacienteDetail = PacienteSummary;

// --- PAYLOADS DE CRIAÇÃO/ATUALIZAÇÃO ---

export interface CreatePacientePayload {
  nome: string;
  sexo: Sexo;
  cpf: string;
  data_nascimento: string | Date;

  // Objeto de Usuário (Para criar o login)
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

export interface UpdatePacientePayload {
  nome?: string;
  sexo?: Sexo;
  data_nascimento?: string | Date;
  cpf?: string;
  telefones?: string[];
  endereco?: {
    rua: string;
    numero: string;
    cidade: string;
    estado: string;
  };
  // usuario?: ... removido pois usamos rota específica agora
  usuario?: {
    email?: string;
    senha?: string;
  };
}

// --- ACRÉSCIMOS PARA O PRONTUÁRIO (UI/Mocks) ---

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

export interface DebitoData {
  id_debito: string;
  data_vencimento: string;
  observacoes?: string | null;
  valor_total: number;
  valor_pago: number;
  status_pagamento: StatusPagamento;
}

export enum TipoEntradaProntuario {
  ANAMNESE = "ANAMNESE",
  PLANO_TRATAMENTO = "PLANO_TRATAMENTO",
  EVOLUCAO_VISITA = "EVOLUCAO_VISITA",
  DIAGNOSTICO = "DIAGNOSTICO",
  OBSERVACAO_GERAL = "OBSERVACAO_GERAL",
}

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
    nome: string;
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
