export interface PatientSummary {
  id: string;                  
  nome_completo: string;
  cpf: string;
  telefone: string;
  sexo?: string;
  email?: string;
}

// Detalhes completos do paciente
export interface PatientDetail extends PatientSummary {
  data_nascimento: string;
}

// Payload para criar paciente
export interface CreatePatientPayload {
  nome_completo: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  sexo?: string;
  email?: string;
}

// Payload para atualizar paciente (parcial)
export type UpdatePatientPayload = Partial<CreatePatientPayload>;
