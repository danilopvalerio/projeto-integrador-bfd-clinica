export interface PatientSummary {
  id_paciente: string;
  nome_completo: string;
  cpf: string;
  telefone: string;
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
  id_usuario?: string;
  id_endereco?: string;
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;