// --- Interfaces existentes (Mantidas conforme solicitado) ---

export interface PatientSummary {
  id_paciente: string;               
  nome_completo: string;
  cpf: string;
  telefone: string;
  sexo?: string;
  email?: string;
  id_usuario: string; 
}

export interface PatientDetail extends PatientSummary {
  data_nascimento: string;
  id_endereco: string;
}

export interface CreatePatientPayload {
  nome_completo: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  sexo?: string;
  email?: string;
  id_usuario: string;
  id_endereco?: string; 
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

// --- NOVAS INTERFACES PARA O PRONTUÁRIO ---

/**
 * Tipos de registros permitidos no prontuário (ENUM do Banco de Dados)
 */
export type MedicalRecordType = 
  | 'ANAMNESE'           // Histórico inicial, doenças e hábitos
  | 'PLANO_TRATAMENTO'   // Planejamento de procedimentos futuros
  | 'EVOLUCAO_VISITA'    // Diário clínico de cada consulta
  | 'DIAGNOSTICO'        // Identificação de patologias específicas
  | 'OBSERVACAO_GERAL'  // Notas administrativas ou lembretes
  | 'CONDUTA'   //Medicamento, Exames e Orientações
  | 'ALERTA'  //Alergias e Doenças Crônicas
  | 'QUEIXA_PRINCIPAL';  //Motivo da Consulta

/**
 * Interface para a Tabela Prontuarios
 */
export interface MedicalRecord {
  id_prontuario: string;       // PK (UUID)
  id_paciente: string;         // FK (UUID)
  id_profissional: string;     // FK (UUID)
  id_agendamento?: string;     // FK (UUID) - Opcional
  data_registro: string;       // TIMESTAMP
  tipo_registro: MedicalRecordType; // ENUM
  descricao: string;           // TEXT
  profissional_nome?: string;  // Campo auxiliar para exibição
}

/**
 * Tipos de documentos aceitos na galeria de arquivos
 */
export type MedicalFileType = 
  | 'RADIOGRAFIA' 
  | 'FOTO' 
  | 'CONSENTIMENTO' 
  | 'RECEITA' 
  | 'ATESTADO' 
  | 'EXAME_EXTERNO' 
  | 'OUTRO';

/**
 * Interface para a Tabela Prontuario_Arquivos
 */
export interface MedicalFile {
  id_arquivo: string;          // PK (UUID)
  id_prontuario: string;       // FK (UUID)
  id_agendamento?: string;     // FK (UUID/INT)
  url_arquivo: string;         // VARCHAR
  nome_arquivo: string;        // VARCHAR
  tipo_arquivo: string;        // VARCHAR (MimeType)
  tipo_documento: MedicalFileType; // ENUM
  descricao?: string;          // TEXT
  data_upload: string;         // TIMESTAMP
}