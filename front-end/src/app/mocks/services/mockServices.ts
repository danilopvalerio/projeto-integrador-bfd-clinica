import { ServicoSummary, ServicoDetail, CreateServicoPayload, UpdateServicoPayload} from "@/app/services/types";


// MOCK - DATABASE
let servicesDB: ServicoDetail[] = [
  {
    id_servico: "1",
    nome: "Consulta Geral",
    descricao: "Avaliação clínica geral do paciente",
    preco: 150,
    duracao_estimada: 30,
    ativo: true,
    preco_visivel_paciente: true,
  },
  {
    id_servico: "2",
    nome: "Exame Laboratorial",
    descricao: "Coleta de material para análise",
    preco: 80,
    duracao_estimada: 20,
    ativo: true,
    preco_visivel_paciente: true,
  },
  {
    id_servico: "3",
    nome: "Retorno Médico",
    descricao: "Consulta de retorno",
    preco: 0,
    duracao_estimada: 15,
    ativo: false,
    preco_visivel_paciente: false,
  },
];



const delay = (ms = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const generateId = () => Math.random().toString(36).substring(2, 9);


// LISTAGEM PAGINADA
export async function getPaginatedServicos(
  page: number,
  limit: number,
) {
  await delay();

  const start = (page - 1) * limit;
  const end = start + limit;

  const data: ServicoSummary[] = servicesDB.slice(start, end);

  return {
    data,
    page,
    lastPage: Math.ceil(servicesDB.length / limit),
    total: servicesDB.length,
  };
}


// BUSCA PAGINADA
export async function searchServicos(
  query: string,
  page: number,
  limit: number
) {
  await delay();

  const filtered = servicesDB.filter(
    (s) =>
      s.nome.toLowerCase().includes(query.toLowerCase()) ||
      (s.descricao ?? "")
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: filtered.slice(start, end),
    page,
    lastPage: Math.ceil(filtered.length / limit),
    total: filtered.length,
  };
}


export async function getServicoById(id: string) {
  await delay();
  const servico = servicesDB.find((s) => s.id_servico === id);
  if (!servico) throw new Error("Serviço não encontrado");
  return servico;
}


// CRIAR
export async function createServico(
  payload: CreateServicoPayload
) {
  await delay();

  const newServico: ServicoDetail = {
    id_servico: generateId(),
    ...payload,
  };

  servicesDB.unshift(newServico);
  return newServico;
}


// ATUALIZAR
export async function updateServico(
  id: string,
  payload: UpdateServicoPayload
) {
  await delay();

  servicesDB = servicesDB.map((s) =>
    s.id_servico === id ? { ...s, ...payload } : s
  );

  return true;
}


// EXCLUIR
export async function deleteServico(id: string) {
  await delay();
  servicesDB = servicesDB.filter((s) => s.id_servico !== id);
  return true;
}
