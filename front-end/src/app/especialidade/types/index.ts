export interface CreateEspecialidadePayload {
  nome: string;
  descricao?: string;
}

export interface EspecialidadeResponse {
  id_especialidade: string;
  nome: string;
  descricao?: string | null;
}

export interface ProfissionalVinculado {
  id_profissional: string;
  nome: string;
  cargo: string
}

export interface UpdateEspecialidadePayload {
  nome: string;
  descricao?: string;

}