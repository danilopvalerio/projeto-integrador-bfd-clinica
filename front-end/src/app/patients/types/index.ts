export interface PatientSummary {
  id_paciente: string;               
  nome_completo: string;
  cpf: string;
  telefone: string;
  sexo?: string;
  email?: string;
  id_usuario: string; 
}

// Detalhes completos do paciente
export interface PatientDetail extends PatientSummary {
  data_nascimento: string;
  id_endereco: string;
}

// Payload para criar paciente
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