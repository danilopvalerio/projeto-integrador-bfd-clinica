// src/app/profissionais/ProfissionalEspecialidadesList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faChevronDown,
  faChevronUp,
  faArrowLeft,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";
import { EspecialidadeEntityForProfissional } from "../types";

interface Props {
  profissionalId: string;
}

const ProfissionalEspecialidadesList = ({ profissionalId }: Props) => {
  const [viewMode, setViewMode] = useState<"LIST" | "ADD">("LIST");
  const [showList, setShowList] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // --- LISTA VINCULADOS (Principal) ---
  const [linked, setLinked] = useState<EspecialidadeEntityForProfissional[]>(
    [],
  );
  const [linkedLoading, setLinkedLoading] = useState(false);
  const [linkedSearch, setLinkedSearch] = useState("");
  const [linkedPage, setLinkedPage] = useState(1);
  const [linkedTotalPages, setLinkedTotalPages] = useState(1);

  // --- LISTA CANDIDATOS (Para adicionar) ---
  const [candidates, setCandidates] = useState<
    EspecialidadeEntityForProfissional[]
  >([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidatePage, setCandidatePage] = useState(1);
  const [candidateTotalPages, setCandidateTotalPages] = useState(1);

  // --- MODAL / REMOÇÃO ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const LIMIT = 5;

  // Busca vinculados
  const fetchLinked = useCallback(
    async (page = 1, term = "") => {
      if (!profissionalId) return;
      try {
        setLinkedLoading(true);
        let url = `/professionals/${profissionalId}/especialidades/paginated?page=${page}&limit=${LIMIT}`;
        if (term) {
          url = `/professionals/${profissionalId}/especialidades/search?q=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`;
        }
        const res = await api.get(url);
        setLinked(res.data.data || []);
        setLinkedPage(res.data.page);
        setLinkedTotalPages(res.data.lastPage);
        setHasLoaded(true);
      } catch (error) {
        console.error(getErrorMessage(error));
      } finally {
        setLinkedLoading(false);
      }
    },
    [profissionalId],
  );

  // Carrega ao montar
  useEffect(() => {
    fetchLinked(1, "");
  }, [fetchLinked]);

  const handleToggleList = () => {
    setShowList((prev) => !prev);
  };

  const handleLinkedSearch = () => {
    fetchLinked(1, linkedSearch);
  };

  // Busca candidatos
  const fetchCandidates = useCallback(async (page = 1, term = "") => {
    try {
      setLoadingCandidates(true);
      let url = `/specialities/paginated?page=${page}&limit=${LIMIT}`;
      if (term) {
        url = `/specialities/search?q=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`;
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

  // --- AÇÃO PRINCIPAL: VINCULAR ---
  const handleAdd = async (idEspecialidade: string) => {
    try {
      setLoadingCandidates(true);

      // 1. Vincula
      await api.post(`/professionals/${profissionalId}/especialidades`, {
        id_especialidade: idEspecialidade,
      });

      // 2. Atualiza a lista principal IMEDIATAMENTE
      await fetchLinked(1, "");

      // 3. Retorna para a visualização principal
      setLinkedSearch("");
      setShowList(true);
      setViewMode("LIST");
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoadingCandidates(false);
    }
  };

  // --- AÇÃO: REMOVER ---
  const requestRemove = (id: string) => {
    setItemToRemove(id);
    setShowConfirmModal(true);
  };

  const confirmRemove = async () => {
    if (!itemToRemove) return;
    try {
      setRemoving(true);
      await api.delete(`/professionals/${profissionalId}/especialidades`, {
        data: { id_especialidade: itemToRemove },
      });
      await fetchLinked(linkedPage, linkedSearch);
      setShowConfirmModal(false);
      setItemToRemove(null);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setRemoving(false);
    }
  };

  const cancelRemove = () => {
    setShowConfirmModal(false);
    setItemToRemove(null);
  };

  // --- RENDERIZAÇÃO: MODO ADICIONAR ---
  if (viewMode === "ADD") {
    return (
      <div className="bg-light p-3 rounded border animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            type="button"
            onClick={() => setViewMode("LIST")}
            className="btn btn-sm btn-link text-decoration-none text-secondary p-0 fw-bold shadow-none"
            style={{ boxShadow: "none" }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" /> Voltar
          </button>
          <h6 className="fw-bold text-secondary m-0">Vincular Especialidade</h6>
        </div>

        <div className="input-group mb-3">
          <input
            type="text"
            autoFocus
            className="form-control form-control-sm shadow-none"
            style={{ boxShadow: "none" }}
            placeholder="Buscar especialidade..."
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCandidateSearch()}
          />
          <button
            className="btn btn-sm btn-outline-secondary shadow-none"
            type="button"
            onClick={handleCandidateSearch}
            style={{ boxShadow: "none" }}
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
              candidates.map((cand) => {
                // Checagem de duplicação local
                const isLinked = linked.some(
                  (l) => l.id_especialidade === cand.id_especialidade,
                );

                return (
                  <button
                    key={cand.id_especialidade}
                    type="button"
                    disabled={isLinked}
                    onClick={() =>
                      !isLinked && handleAdd(cand.id_especialidade)
                    }
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center px-3 py-2 small shadow-none ${
                      isLinked ? "bg-light text-muted" : ""
                    }`}
                    style={{ border: "none", outline: "none" }}
                  >
                    <div>
                      <div className="fw-bold">{cand.nome}</div>
                    </div>
                    {isLinked ? (
                      <span className="badge bg-secondary opacity-50 fw-normal">
                        <FontAwesomeIcon icon={faCheck} className="me-1" />
                        Já vinculada
                      </span>
                    ) : (
                      <FontAwesomeIcon icon={faPlus} className="text-primary" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center text-muted small py-2">
                Nenhuma especialidade encontrada.
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary py-0 shadow-none"
            style={{ boxShadow: "none" }}
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
            style={{ boxShadow: "none" }}
            disabled={candidatePage === candidateTotalPages}
            onClick={() => fetchCandidates(candidatePage + 1, candidateSearch)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO: MODO LISTA ---
  return (
    <>
      <div className="animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small text-muted">
            {hasLoaded
              ? linked.length > 0
                ? `${linked.length} especialidades vinculadas`
                : "Nenhuma especialidade vinculada"
              : "Carregando..."}
          </span>
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
              <FontAwesomeIcon icon={faChevronDown} /> Ver Detalhes
            </>
          )}
        </button>

        {showList && (
          <div className="bg-light p-3 rounded border">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control form-control-sm shadow-none"
                style={{ boxShadow: "none", background: "#fff" }}
                placeholder="Filtrar vinculadas..."
                value={linkedSearch}
                onChange={(e) => setLinkedSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLinkedSearch()}
              />
              <button
                className="btn btn-sm btn-outline-secondary bg-white shadow-none"
                type="button"
                onClick={handleLinkedSearch}
                style={{ boxShadow: "none" }}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>

            {linkedLoading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-secondary"></div>
              </div>
            ) : (
              <div className="list-group list-group-flush rounded-3 border-0">
                {linked.length > 0 ? (
                  linked.map((item) => (
                    <div
                      key={item.id_especialidade}
                      className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0 mb-2 bg-white rounded px-3 border shadow-sm"
                    >
                      <span className="fw-bold small text-dark">
                        {item.nome}
                      </span>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0 opacity-50 hover-opacity-100 shadow-none"
                        style={{ boxShadow: "none" }}
                        onClick={() => requestRemove(item.id_especialidade)}
                        title="Desvincular"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted small py-3 fst-italic">
                    Nenhuma especialidade vinculada.
                  </div>
                )}
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0 shadow-none"
                style={{ boxShadow: "none" }}
                disabled={linkedPage === 1}
                onClick={() => fetchLinked(linkedPage - 1, linkedSearch)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span className="small text-muted">
                {linkedPage} / {linkedTotalPages}
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-0 shadow-none"
                style={{ boxShadow: "none" }}
                disabled={linkedPage === linkedTotalPages}
                onClick={() => fetchLinked(linkedPage + 1, linkedSearch)}
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
                Desvincular Especialidade?
              </h5>
              <p className="text-muted small mb-0">
                O profissional deixará de ter essa especialidade.
              </p>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-light text-secondary fw-bold px-4 rounded-pill shadow-none"
                style={{ boxShadow: "none" }}
                onClick={cancelRemove}
                disabled={removing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-none"
                style={{ boxShadow: "none" }}
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

export default ProfissionalEspecialidadesList;
