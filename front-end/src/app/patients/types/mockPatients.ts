// types/mockPatients.ts
import { PatientSummary, PatientDetail } from "./index";

// Mock para a listagem (Summary)
export const MOCK_PATIENTS_SUMMARY: PatientSummary[] = [
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    nome_completo: "Ana Beatriz Oliveira",
    cpf: "123.456.789-00",
    telefone: "(11) 98888-7777",
    sexo: "Feminino",
    email: "ana.oliveira@email.com"
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    nome_completo: "Carlos Eduardo Santos",
    cpf: "987.654.321-11",
    telefone: "(21) 97777-6666",
    sexo: "Masculino",
    email: "carlos.santos@email.com"
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    nome_completo: "Mariana Souza Lima",
    cpf: "456.789.123-22",
    telefone: "(31) 96666-5555",
    sexo: "Feminino",
    email: "mariana.lima@email.com"
  }
];

// Mock para o detalhe de um paciente específico
export const MOCK_PATIENT_DETAIL: PatientDetail = {
  id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  nome_completo: "Ana Beatriz Oliveira",
  cpf: "123.456.789-00",
  telefone: "(11) 98888-7777",
  sexo: "Feminino",
  email: "ana.oliveira@email.com",
  data_nascimento: "1992-05-15"
};
