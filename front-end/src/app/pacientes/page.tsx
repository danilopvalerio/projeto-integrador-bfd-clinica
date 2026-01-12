"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen, faTrash, faSearch } from "@fortawesome/free-solid-svg-icons";

import { getPaginatedPacientes, searchPacientes, deletePaciente, createPaciente, updatePaciente } from "../pacientes/services/pacienteService";

import { PacienteEntity, CreatePacienteDTO } from "./dto/pacienteDTO";
import PacienteModal from "./components/PacienteModal";

const LIMIT = 6;

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] =
    useState<PacienteEntity | null>(null);

  async function loadPacientes(p = 1, term = "") {
    setLoading(true);

    const response = term
      ? await searchPacientes({ query: term, page: p, limit: LIMIT })
      : await getPaginatedPacientes({ page: p, limit: LIMIT });

    setPacientes(response.data);
    setPage(response.page);
    setLastPage(response.lastPage);
    setLoading(false);
  }

  useEffect(() => {
    loadPacientes();
  }, []);

  async function handleSubmit(data: CreatePacienteDTO) {
    if (selectedPaciente) {
      await updatePaciente(selectedPaciente.id, data);
    } else {
      await createPaciente(data);
    }

    setModalOpen(false);
    setSelectedPaciente(null);
    loadPacientes(page, search);
  }

  async function handleDelete(id: string) {
    const confirmacao = confirm("Deseja excluir este paciente?");
    if (!confirmacao) return;

    await deletePaciente(id);
    loadPacientes(page, search);
  }

  return (
    <div className="container my-5">
      <div className="bg-white rounded-4 shadow-sm p-4">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold m-0">Pacientes</h3>

          <button
            className="button-dark-grey rounded-pill px-4 py-2 fw-bold"
            onClick={() => {
              setSelectedPaciente(null);
              setModalOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Novo Paciente
          </button>
        </div>

        {/* BUSCA */}
        <div className="input-group mb-4">
          <span className="input-group-text">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            className="form-control"
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && loadPacientes(1, search)
            }
          />
        </div>

        {/* LISTAGEM */}
        {loading ? (
          <p className="text-center text-muted">Carregando...</p>
        ) : pacientes.length === 0 ? (
          <p className="text-center text-muted">
            Nenhum paciente encontrado
          </p>
        ) : (
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Email</th>
                <th>Telefone</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.cpf}</td>
                  <td>{p.email}</td>
                  <td>{p.telefone}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => {
                        setSelectedPaciente(p);
                        setModalOpen(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINAÇÃO */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === 1}
            onClick={() => loadPacientes(page - 1, search)}
          >
            Anterior
          </button>

          <span className="fw-bold text-secondary">
            Página {page} de {lastPage}
          </span>

          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={page === lastPage}
            onClick={() => loadPacientes(page + 1, search)}
          >
            Próxima
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <PacienteModal
        open={modalOpen}
        paciente={selectedPaciente ?? undefined}
        onClose={() => {
          setModalOpen(false);
          setSelectedPaciente(null);
        }}
        onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
