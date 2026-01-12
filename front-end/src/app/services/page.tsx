//src/app/services/page.tsx
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
import { ServicoSummary } from "./types";

// Importação dos Componentes da Feature
import ServicoCard from "./ServicoCard";
import AddServicoModal from "./AddServicoModal";
import ServicoDetailModal from "./ServicoDetailModal";

const LIMIT = 6;

const ServicosPage = () => {
  const router = useRouter();

  // Estados de Dados
  const [servicos, setServicos] = useState<ServicoSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Paginação e Busca
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedServicoId, setSelectedServicoId] = useState<string | null>(
    null
  );

  // Auth simples
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
    else fetchServicos(1);
  }, [router]);

  const fetchServicos = async (page = 1, term = "") => {
    setLoading(true);
    setError("");
    try {
      let url = `/services/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/services/search?q=${encodeURIComponent(
          term
        )}&page=${page}&limit=${LIMIT}`;
      }

      const response = await api.get(url);

      // Adaptando para a estrutura retornada pelo RepositoryPaginatedResult
      setServicos(response.data.data);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.lastPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchServicos(1, searchTerm);

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchServicos(1);
  };

  const handleRefresh = () => {
    fetchServicos(currentPage, searchTerm);
    setIsAddModalOpen(false);
    setSelectedServicoId(null);
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ background: "#e9e9e9" }}
    >
      {/* Header */}
      <header className="header-panel bg-gradient-vl d-flex align-items-center px-4 shadow-sm">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => router.push("/menu")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
        <span className="text-white fw-bold fs-5">Módulo de Serviços</span>
      </header>

      <div className="container my-5 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          {/* Banner Interno */}
          <div className="bg-gradient-vl p-4 text-center text-white">
            <h3 className="fw-bold m-0">Catálogo de Serviços</h3>
            <p className="opacity-75 small m-0 mt-1">
              Gerencie preços, duração e profissionais
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
                    className="form-control ps-5 rounded-pill border-secondary border-opacity-25"
                    placeholder="Buscar por nome ou descrição..."
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
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Novo Serviço
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="alert alert-danger text-center border-0 bg-danger bg-opacity-10 text-danger rounded-3">
                {error}
              </div>
            )}

            {/* Grid de Cards */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" />
                <p className="text-muted small mt-2">Carregando serviços...</p>
              </div>
            ) : servicos.length ? (
              <>
                <div className="row g-3">
                  {servicos.map((servico) => (
                    <div key={servico.id_servico} className="col-md-6 col-lg-4">
                      <ServicoCard
                        servico={servico}
                        onClick={() => setSelectedServicoId(servico.id_servico)}
                      />
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                    disabled={currentPage === 1}
                    onClick={() => fetchServicos(currentPage - 1, searchTerm)}
                  >
                    Anterior
                  </button>
                  <span className="text-secondary small fw-bold">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchServicos(currentPage + 1, searchTerm)}
                  >
                    Próxima
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 bg-light rounded-3 mt-3">
                <p className="text-muted fw-bold mb-0">
                  Nenhum serviço encontrado.
                </p>
                <small className="text-secondary">
                  Tente mudar os termos da busca ou adicione um novo.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {isAddModalOpen && (
        <AddServicoModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {selectedServicoId && (
        <ServicoDetailModal
          servicoId={selectedServicoId}
          onClose={() => setSelectedServicoId(null)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default ServicosPage;
