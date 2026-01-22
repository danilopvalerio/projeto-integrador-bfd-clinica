// src/app/patient/[id]/types.ts

// --- SEU CÓDIGO ORIGINAL ---

// Espelho dos Enums do Backend
export enum Sexo {
  MASCULINO = "MASCULINO",
  FEMININO = "FEMININO",
}

// Entidade de Endereço
export interface Endereco {
  id_endereco: string;
  rua: string;
  numero?: string | null;
  cidade: string;
  estado: string;
}

// Entidade de Telefone
export interface PacienteTelefone {
  id_telefone: string;
  telefone: string;
  principal: boolean;
  id_paciente: string;
}

// Entidade Principal de Paciente (Leitura)
export interface PacienteSummary {
  id_paciente: string;
  nome: string;
  sexo: Sexo;
  cpf: string;
  data_nascimento: string; // JSON retorna data como string
  id_usuario: string;
  id_endereco?: string | null;

  // Relations
  endereco?: Endereco;
  telefones?: PacienteTelefone[];
}

// Para o Detail (se houver campos extras no futuro, estende o Summary)
export type PacienteDetail = PacienteSummary;

// Payload de Criação (Entrada) - ATUALIZADO
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

  // Opcionais aninhados
  endereco?: {
    rua: string;
    numero?: string;
    cidade: string;
    estado: string;
  };

  telefones?: { telefone: string; principal: boolean }[];
}

// Payload de Atualização (Restrito conforme seu backend)
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

// Mock para a aba de Débitos
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

// --- ENTIDADES DE PRONTUÁRIO (Respostas da API) ---

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

  // Relations (opcionais dependendo do include do prisma)
  profissional?: {
    nome: string;
    registro_conselho: string;
  };
  arquivos?: ProntuarioArquivo[];
}

// --- PAYLOADS (Envio para API) ---

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
