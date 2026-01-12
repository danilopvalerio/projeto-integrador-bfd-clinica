import { PacienteEntity } from "@/app/pacientes/dto/pacienteDTO";


// MOCK - DATABASE
const pacientesDB: PacienteEntity[] = [
  {
    id: "1",
    nome: "Maria Clara Souza",
    cpf: "123.456.789-00",
    telefone: "(11) 91234-5678",
    sexo: "Feminino",
    email: "maria.souza@email.com",
    data_nascimento: "1992-05-18",
  },
  {
    id: "2",
    nome: "João Pedro Almeida",
    cpf: "987.654.321-00",
    telefone: "(21) 99876-5432",
    sexo: "Masculino",
    email: "joao.almeida@email.com",
    data_nascimento: "1985-11-02",
  },
  {
    id: "3",
    nome: "Ana Beatriz Lima",
    cpf: "456.789.123-00",
    telefone: "(31) 93456-7890",
    sexo: "Feminino",
    email: "ana.lima@email.com",
    data_nascimento: "2000-03-27",
  },
];

const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getPaginatedPacientes(
  page: number,
  limit: number,
  search?: string
) {
  await delay();

  let filtered = pacientesDB;

  if (search) {
    filtered = pacientesDB.filter((p) =>
      p.nome.toLowerCase().includes(search.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filtered.slice(start, end),
    page,
    lastPage: Math.ceil(filtered.length / limit),
    total: filtered.length,
  };
}
