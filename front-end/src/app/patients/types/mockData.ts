// mockData.ts
import { PatientDetail, MedicalRecord } from "./index";

export const MOCK_PATIENTS: PatientDetail[] = [
  {
    id_paciente: "p1",
    nome_completo: "Ana Beatriz Oliveira",
    cpf: "123.456.789-00",
    telefone: "(11) 98888-7777",
    email: "ana.beatriz@email.com",
    sexo: "Feminino",
    id_usuario: "user-uuid-001",
    data_nascimento: "1990-05-20",
    id_endereco: "end-uuid-101"
  },
  {
    id_paciente: "p2",
    nome_completo: "Carlos Eduardo Santos",
    cpf: "987.654.321-11",
    telefone: "(11) 97777-6666",
    email: "carlos.edu@email.com",
    sexo: "Masculino",
    id_usuario: "user-uuid-002",
    data_nascimento: "1985-10-12",
    id_endereco: "end-uuid-102"
  }
];
export const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  // ANAMNESE (Aparece na coluna fixa esquerda)
  {
    id_prontuario: "rec1",
    id_paciente: "p1",
    id_profissional: "prof-01",
    data_registro: "2023-10-01T10:00:00Z",
    tipo_registro: "ANAMNESE",
    descricao: "Paciente relata dor aguda no molar inferior esquerdo. Histórico de hipertensão controlada. Alergia confirmada a Dipirona."
  },
  // PLANO DE TRATAMENTO (Aparece na coluna fixa esquerda)
  {
    id_prontuario: "rec2",
    id_paciente: "p1",
    id_profissional: "prof-01",
    data_registro: "2023-10-01T10:30:00Z",
    tipo_registro: "PLANO_TRATAMENTO",
    descricao: "1. Limpeza profilática; 2. Restauração do dente 36; 3. Avaliação de canal no dente 37."
  },
  // EVOLUÇÕES (Aparecem na Timeline central)
  {
    id_prontuario: "rec3",
    id_paciente: "p1",
    id_profissional: "prof-01",
    data_registro: "2023-11-15T14:00:00Z",
    tipo_registro: "EVOLUCAO_VISITA",
    descricao: "Realizada restauração em resina composta no dente 36. Paciente colaborativo, anestesia local sem intercorrências."
  },
  {
    id_prontuario: "rec4",
    id_paciente: "p1",
    id_profissional: "prof-01",
    data_registro: "2023-12-20T09:00:00Z",
    tipo_registro: "EVOLUCAO_VISITA",
    descricao: "Limpeza de rotina e aplicação de flúor. Próxima visita agendada para 6 meses."
  }
];