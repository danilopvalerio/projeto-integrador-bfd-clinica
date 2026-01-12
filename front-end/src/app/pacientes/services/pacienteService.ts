import api from "@/utils/api";
import { CreatePacienteDTO, PacienteEntity, SearchPacienteParams} from "../dto/pacienteDTO";

const pacientesDB: PacienteEntity[] = [];

//CRIAR PACIENTE
export async function createPaciente(data: CreatePacienteDTO) {
  const response = await api.post("/users", {
    ...data,
    tipo_usuario: "CLIENTE",
  });
  return response.data;
}

//BUSCAR PACIENTE
export async function searchPacientes(params: SearchPacienteParams) {
  const { query, page, limit } = params;
  const response = await api.get("/users/search", {
    params: {
      q: query,
      page,
      limit,
    },
  });
  return response.data;
}

export async function getPacienteById(id: string) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

//EDITAR PACIENTE
export async function updatePaciente(
  id: string,
  data: CreatePacienteDTO
): Promise<PacienteEntity> {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
}

//DELETAR PACIENTE
export async function deletePaciente(id: string) {
  await api.delete(`/users/${id}`);
}

//PAGINADA
export async function getPaginatedPacientes({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  return {
    data: pacientesDB.slice((page - 1) * limit, page * limit),
    page,
    lastPage: Math.ceil(pacientesDB.length / limit),
    total: pacientesDB.length,
  };
}
