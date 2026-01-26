"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faUserMd,
  faSearch,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { ProfissionalSummary } from "../profissionais/types"; // Importe a tipagem correta

interface ProfessionalCandidate {
  id_profissional: string;
  nome: string;
  cargo: string;
}

interface Props {
  especialidadeId: string;
}

const EspecialidadeProfissionaisList = ({ especialidadeId }: Props) => {
  const [viewMode, setViewMode] = useState<"LIST" | "ADD">("LIST");
  const [showList, setShowList] = useState(false);

  // --- LISTA VINCULADOS ---
  const [profissionais, setProfissionais] = useState<ProfissionalSummary[]>([]);
  const [loadingVinculados, setLoadingVinculados] = useState(false);
  const [linkedSearch, setLinkedSearch] = useState("");
  const [linkedPage, setLinkedPage] = useState(1);
  const [linkedTotalPages, setLinkedTotalPages] = useState(1);

  // --- LISTA CANDIDATOS ---
  const [candidates, setCandidates] = useState<ProfessionalCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateTotalPages, setCandidateTotalPages] = useState(1);

  // --- MODAL ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [profToRemove, setProfToRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const LIMIT = 5;

  const fetchVinculados = useCallback(
    async (page = 1, term = "") => {
      if (!especialidadeId) return;
      try {
        setLoadingVinculados(true);
        let url = `/specialities/${especialidadeId}/profissionais/paginated?page=${page}&limit=${LIMIT}`;
        if (term) {
          url = `/specialities/${especialidadeId}/profissionais/search?q=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`;
        }
        const res = await api.get(url);
        setProfissionais(res.data.data || []);
        setLinkedPage(res.data.page);
        setLinkedTotalPages(res.data.lastPage);
      } catch (error) {
        console.error(getErrorMessage(error));
      } finally {
        setLoadingVinculados(false);
      }
    },
    [especialidadeId],
  );

  const handleToggleList = () => {
    if (!showList) fetchVinculados(1, linkedSearch);
    setShowList((prev) => !prev);
  };

  const handleLinkedSearch = () => {
    fetchVinculados(1, linkedSearch);
  };

  const fetchCandidates = useCallback(async (page = 1, term = "") => {
    try {
      setLoadingCandidates(true);
      let url = `/professionals/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/professionals/search?q=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`;
      }
      const res = await api.get(url);
      setCandidates(res.data.data || []);
      setCandidatePage(res.data.page);
      setCandidateTotalPages(res.data.lastPage);
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === "ADD") fetchCandidates(1, "");
  }, [viewMode, fetchCandidates]);

  const handleCandidateSearch = () => {
    fetchCandidates(1, candidateSearch);
  };

  const handleAdd = async (idProfissional: string) => {
    if (!idProfissional) return alert("Erro: ID inválido.");
    try {
      setLoadingCandidates(true);
      await api.post(`/specialities/${especialidadeId}/profissionais`, {
        id_profissional: idProfissional,
      });
      setViewMode("LIST");
      setLinkedSearch("");
      setShowList(true);
      fetchVinculados(1, "");
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoadingCandidates(false);
    }
  };

  const requestRemove = (profId: string) => {
    setProfToRemove(profId);
    setShowConfirmModal(true);
  };

  const confirmRemove = async () => {
    if (!profToRemove) return;
    try {
      setRemoving(true);
      await api.delete(`/specialities/${especialidadeId}/profissionais`, {
        data: { id_profissional: profToRemove },
      });
      await fetchVinculados(linkedPage, linkedSearch);
      setShowConfirmModal(false);
      setProfToRemove(null);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setRemoving(false);
    }
  };

  const cancelRemove = () => {
    setShowConfirmModal(false);
    setProfToRemove(null);
  };

  if (viewMode === "ADD") {
    return (
      <div className="mt-4 pt-3 border-top animate-fade-in bg-light p-3 rounded border">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            onClick={() => setViewMode("LIST")}
            className="btn btn-sm btn-link text-decoration-none text-secondary p-0 fw-bold shadow-none"
            style={{ boxShadow: "none" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Voltar
          </button>
          <h6 className="fw-bold text-secondary m-0">Vincular Profissional</h6>
        </div>

        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control form-control-sm shadow-none"
            style={{ boxShadow: "none" }}
            placeholder="Buscar candidato..."
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCandidateSearch()}
            autoFocus
          />
          <button
            className="btn btn-sm btn-outline-secondary shadow-none"
            type="button"
            onClick={handleCandidateSearch}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        {loadingCandidates ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-secondary"></div>
          </div>
        ) : (
          <div className="list-group list-group-flush bg-white rounded shadow-sm">
            {candidates.length > 0 ? (
              candidates.map((cand) => (
                <button
                  key={cand.id_profissional}
                  type="button"
                  onClick={() => handleAdd(cand.id_profissional)}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-2 small shadow-none"
                  style={{ border: "none", outline: "none" }}
                >
                  <div>
                    <div className="fw-bold text-dark">{cand.nome}</div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {cand.cargo}
                    </div>
                  </div>
                  <FontAwesomeIcon icon={faPlus} className="text-primary" />
                </button>
              ))
            ) : (
              <div className="text-center text-muted small py-2">
                Nenhum candidato encontrado.
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0 shadow-none"
            disabled={candidatePage === 1}
            onClick={() => fetchCandidates(candidatePage - 1, candidateSearch)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="small text-muted">
            {candidatePage} / {candidateTotalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0 shadow-none"
            disabled={candidatePage === candidateTotalPages}
            onClick={() => fetchCandidates(candidatePage + 1, candidateSearch)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 pt-3 border-top animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="fw-bold text-secondary m-0">
            Profissionais Especializados
          </h6>
          <button
            type="button"
            className="btn btn-sm button-dark-grey rounded-pill px-3 fw-bold shadow-none"
            style={{ boxShadow: "none" }}
            onClick={() => setViewMode("ADD")}
          >
            <FontAwesomeIcon icon={faPlus} className="me-1" /> Vincular
          </button>
        </div>

        <button
          type="button"
          onClick={handleToggleList}
          className="btn btn-link text-decoration-none text-secondary p-0 mb-3 small fw-bold d-flex align-items-center gap-2 shadow-none"
          style={{ boxShadow: "none" }}
        >
          {showList ? (
            <>
              <FontAwesomeIcon icon={faChevronUp} /> Ocultar Lista
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faChevronDown} /> Ver Profissionais
            </>
          )}
        </button>

        {showList && (
          <div className="animate-fade-in bg-light p-3 rounded border">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control form-control-sm shadow-none"
                style={{ boxShadow: "none", background: "#fff" }}
                placeholder="Filtrar vinculados..."
                value={linkedSearch}
                onChange={(e) => setLinkedSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLinkedSearch()}
              />
              <button
                className="btn btn-sm btn-outline-secondary bg-white shadow-none"
                type="button"
                onClick={handleLinkedSearch}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>

            {loadingVinculados ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-secondary"></div>
              </div>
            ) : (
              <div className="list-group list-group-flush rounded-3 border-0">
                {profissionais.length > 0 ? (
                  profissionais.map((prof) => (
                    <div
                      key={prof.id_profissional}
                      className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0 mb-2 bg-white rounded px-3 border shadow-sm"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary"
                          style={{ width: "32px", height: "32px" }}
                        >
                          <FontAwesomeIcon icon={faUserMd} className="small" />
                        </div>
                        <div className="d-flex flex-column">
                          <span className="fw-bold small text-dark">
                            {prof.nome}
                          </span>
                          <span
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {prof.registro_conselho || "S/ Reg"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 opacity-50 hover-opacity-100 shadow-none"
                        style={{ boxShadow: "none" }}
                        onClick={() => requestRemove(prof.id_profissional)}
                        title="Desvincular"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-3 fst-italic">
                    Nenhum profissional encontrado.
                  </div>
                )}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0 shadow-none"
                disabled={linkedPage === 1}
                onClick={() => fetchVinculados(linkedPage - 1, linkedSearch)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span className="small text-muted">
                {linkedPage} / {linkedTotalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0 shadow-none"
                disabled={linkedPage === linkedTotalPages}
                onClick={() => fetchVinculados(linkedPage + 1, linkedSearch)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center animate-fade-in"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1070 }}
          onClick={cancelRemove}
        >
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="mb-3 text-warning">
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
              </div>
              <h5 className="fw-bold text-secondary">
                Desvincular Profissional?
              </h5>
              <p className="text-muted small mb-0">
                O profissional não aparecerá mais nesta especialidade.
              </p>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-light text-secondary fw-bold px-4 rounded-pill shadow-none"
                onClick={cancelRemove}
                disabled={removing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-none"
                onClick={confirmRemove}
                disabled={removing}
              >
                {removing ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FontAwesomeIcon icon={faTrash} />
                )}
                <span>{removing ? "Removendo..." : "Sim, remover"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EspecialidadeProfissionaisList;
