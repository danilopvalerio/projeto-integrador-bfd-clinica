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
import { EspecialidadeResponse  } from "./types";

// Componentes
import EspecialidadeCard from "./EspecialidadeCard";
import AddEspecialidadeModal from "./AddEspecialidadeModal";
import EspecialidadeDetailModal from "./EspecialidadeDetailModal";

const LIMIT = 6;

const EspecialidadesPage = () => {
  const router = useRouter();

  // Dados
  const [especialidades, setEspecialidades] =
    useState<EspecialidadeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Paginação + busca
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEspecialidadeId, setSelectedEspecialidadeId] =
    useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
    else fetchEspecialidades(1);
  }, [router]);

  const fetchEspecialidades = async (page = 1, term = "") => {
    setLoading(true);
    setError("");

    try {
      let url = `/specialities/paginated?page=${page}&limit=${LIMIT}`;

      if (term) {
        url = `/specialities/search?q=${encodeURIComponent(
          term
        )}&page=${page}&limit=${LIMIT}`;
      }

      const response = await api.get(url);

      setEspecialidades(response.data.data);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.lastPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchEspecialidades(1, searchTerm);

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchEspecialidades(1);
  };

  const handleRefresh = () => {
    setIsAddModalOpen(false);
    setSelectedEspecialidadeId(null);
    fetchEspecialidades(currentPage, searchTerm);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#e9e9e9" }}>
      {/* Header */}
      <header className="header-panel bg-gradient-vl d-flex align-items-center px-4 shadow-sm">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => router.push("/menu")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
        <span className="text-white fw-bold fs-5">
          Módulo de Especialidades
        </span>
      </header>

      <div className="container my-5 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-vl p-4 text-center text-white">
            <h3 className="fw-bold m-0">Catálogo de Especialidades</h3>
            <p className="opacity-75 small m-0 mt-1">
              Gerencie as áreas de atuação da clínica
            </p>
          </div>

          <div className="p-4">
            {/* Toolbar */}
            <div className="row g-3 mb-4 align-items-end">
              <div className="col-md-6">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                  <input
                    className="form-control ps-5 rounded-pill"
                    placeholder="Buscar especialidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchTerm && (
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      onClick={handleClearSearch}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </span>
                  )}
                </div>
              </div>

              <div className="col-md-2">
                <button
                  className="button-dark-grey w-100 rounded-pill"
                  onClick={handleSearch}
                >
                  Pesquisar
                </button>
              </div>

              <div className="col-md-4 text-end">
                <button
                  className="button-dark-grey rounded-pill px-4"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Nova Especialidade
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" />
              </div>
            ) : especialidades.length ? (
              <>
                <div className="row g-3">
                  {especialidades.map((esp) => (
                    <div key={esp.id_especialidade} className="col-md-6 col-lg-4">
                      <EspecialidadeCard
                        especialidade={esp}
                        onClick={() =>
                          setSelectedEspecialidadeId(esp.id_especialidade)
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                <div className="d-flex justify-content-center gap-3 mt-5">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      fetchEspecialidades(currentPage - 1, searchTerm)
                    }
                  >
                    Anterior
                  </button>

                  <span className="small fw-bold">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    className="btn btn-outline-secondary btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      fetchEspecialidades(currentPage + 1, searchTerm)
                    }
                  >
                    Próxima
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-muted">
                Nenhuma especialidade encontrada.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {isAddModalOpen && (
        <AddEspecialidadeModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {selectedEspecialidadeId && (
        <EspecialidadeDetailModal
          especialidadeId={selectedEspecialidadeId}
          onClose={() => setSelectedEspecialidadeId(null)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default EspecialidadesPage;
