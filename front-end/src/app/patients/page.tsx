"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPlus,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { PacienteSummary } from "./types";
import PacienteCard from "./PacienteCard";
import AddPacienteModal from "./AddPatientModal";
import PacienteDetailModal from "./PacienteDetailModal";

const LIMIT = 6;

const PacientesPage = () => {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<PacienteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
    else fetchPacientes(1);
  }, [router]);

  const fetchPacientes = async (page = 1, term = "") => {
    setLoading(true);
    setError("");
    try {
      let url = `/patients/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/patients/search?q=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`;
      }
      const response = await api.get(url);
      setPacientes(response.data.data);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.lastPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchPacientes(1, searchTerm);
  const handleClearSearch = () => {
    setSearchTerm("");
    fetchPacientes(1);
  };
  const handleRefresh = () => {
    fetchPacientes(currentPage, searchTerm);
    setIsAddModalOpen(false);
    setSelectedPacienteId(null);
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#e9e9e9" }}
    >
      <header className="header-panel bg-gradient-vl d-flex align-items-center px-4 shadow-sm">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => router.push("/menu")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
        <span className="text-white fw-bold fs-5">Módulo de Pacientes</span>
      </header>

      <div className="container my-5 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          <div className="bg-gradient-vl p-4 text-center text-white">
            <h3 className="fw-bold m-0">Cadastro de Pacientes</h3>
            <p className="opacity-75 small m-0 mt-1">
              Gerencie fichas, contatos e históricos
            </p>
          </div>

          <div className="p-4">
            <div className="row g-3 mb-4 align-items-end">
              <div className="col-md-6">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                  <input
                    className="form-control ps-5 rounded-pill border-secondary border-opacity-25"
                    placeholder="Buscar por nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchTerm && (
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary cursor-pointer"
                      onClick={handleClearSearch}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>
              </div>
              <div className="col-md-2">
                <button
                  className="button-dark-grey w-100 w-md-auto rounded-pill px-4 py-2 shadow-sm fw-bold"
                  onClick={handleSearch}
                >
                  Pesquisar
                </button>
              </div>
              <div className="col-md-4 text-end">
                <button
                  className="button-dark-grey w-100 w-md-auto rounded-pill px-4 py-2 shadow-sm fw-bold"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" /> Novo
                  Paciente
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger text-center border-0 bg-danger bg-opacity-10 text-danger rounded-3">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" />
                <p className="text-muted small mt-2">Carregando pacientes...</p>
              </div>
            ) : pacientes.length ? (
              <>
                <div className="row g-3">
                  {pacientes.map((paciente) => (
                    <div
                      key={paciente.id_paciente}
                      className="col-md-6 col-lg-4"
                    >
                      <PacienteCard
                        paciente={paciente}
                        onClick={() =>
                          setSelectedPacienteId(paciente.id_paciente)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                    disabled={currentPage === 1}
                    onClick={() => fetchPacientes(currentPage - 1, searchTerm)}
                  >
                    Anterior
                  </button>
                  <span className="text-secondary small fw-bold">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchPacientes(currentPage + 1, searchTerm)}
                  >
                    Próxima
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 bg-light rounded-3 mt-3">
                <p className="text-muted fw-bold mb-0">
                  Nenhum paciente encontrado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <AddPacienteModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}
      {selectedPacienteId && (
        <PacienteDetailModal
          pacienteId={selectedPacienteId}
          onClose={() => setSelectedPacienteId(null)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default PacientesPage;
