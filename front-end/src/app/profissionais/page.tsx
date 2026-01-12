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
import type { ProfissionalSummary } from "./types";

import ProfissionalCard from "./ProfissionalCard";
import AddProfissionalModal from "./AddProfissionalModal";
import ProfissionalDetailModal from "./ProfissionalDetailModal";

const LIMIT = 6;

export default function ProfissionaisPage() {
  const router = useRouter();

  const [profissionais, setProfissionais] = useState<ProfissionalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
    else fetchProfissionais(1);
    
  }, [router]);

  const fetchProfissionais = async (page = 1, term = "") => {
    setLoading(true);
    setError("");

    try {
      let url = `/professionals/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/professionals/search?q=${encodeURIComponent(
          term
        )}&page=${page}&limit=${LIMIT}`;
      }

      const response = await api.get(url);

      setProfissionais(response.data.data);
      setCurrentPage(response.data.page);
      setTotalPages(response.data.lastPage);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => fetchProfissionais(1, searchTerm);

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchProfissionais(1);
  };

  const handleRefresh = () => {
    fetchProfissionais(currentPage, searchTerm);
    setIsAddModalOpen(false);
    setSelectedProfissionalId(null);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: "#e9e9e9" }}>
      <header className="header-panel bg-gradient-vl d-flex align-items-center px-4 shadow-sm">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={() => router.push("/menu")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
        <span className="text-white fw-bold fs-5">Módulo de Profissionais</span>
      </header>

      <div className="container my-5 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          <div className="bg-gradient-vl p-4 text-center text-white">
            <h3 className="fw-bold m-0">Catálogo de Profissionais</h3>
            <p className="opacity-75 small m-0 mt-1">
              Gerencie cadastro, serviços e especialidades
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
                    placeholder="Buscar por nome..."
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
                  Novo Profissional
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
                <p className="text-muted small mt-2">Carregando profissionais...</p>
              </div>
            ) : profissionais.length ? (
              <>
                <div className="row g-3">
                  {profissionais.map((prof) => (
                    <div key={prof.id_profissional} className="col-md-6 col-lg-4">
                      <ProfissionalCard
                        profissional={prof}
                        onClick={() => setSelectedProfissionalId(prof.id_profissional)}
                      />
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                    disabled={currentPage === 1}
                    onClick={() => fetchProfissionais(currentPage - 1, searchTerm)}
                  >
                    Anterior
                  </button>
                  <span className="text-secondary small fw-bold">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                    disabled={currentPage === totalPages}
                    onClick={() => fetchProfissionais(currentPage + 1, searchTerm)}
                  >
                    Próxima
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 bg-light rounded-3 mt-3">
                <p className="text-muted fw-bold mb-0">Nenhum profissional encontrado.</p>
                <small className="text-secondary">
                  Tente mudar os termos da busca ou adicione um novo.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddProfissionalModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleRefresh}
        />
      )}

      {selectedProfissionalId && (
        <ProfissionalDetailModal
          profissionalId={selectedProfissionalId}
          onClose={() => setSelectedProfissionalId(null)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
