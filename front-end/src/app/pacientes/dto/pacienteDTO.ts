export interface CreatePacienteDTO {
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  email: string;
  telefone: string;
}

export interface PacienteEntity {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  sexo: string;
  email: string;
  data_nascimento: string;
}

export interface SearchPacienteParams {
  query: string;
  page: number;
  limit: number;
}

