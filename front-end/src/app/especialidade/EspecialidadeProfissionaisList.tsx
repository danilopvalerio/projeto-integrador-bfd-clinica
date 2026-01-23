"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faUserMd,
  faSearch,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";

// IMPORTANTE: Ajuste o caminho abaixo para onde está o seu arquivo 'types.ts' do módulo de profissionais
import type {
  ProfissionalSummary,
  PaginatedResponse,
} from "../profissionais/types";

interface Props {
  especialidadeId: string;
}

const SEARCH_LIMIT = 5;

const EspecialidadeProfissionaisList = ({ especialidadeId }: Props) => {
  // --- Estados da Lista de Vinculados ---
  // Agora tipado corretamente como ProfissionalSummary[]
  const [profissionais, setProfissionais] = useState<ProfissionalSummary[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // --- Estados da Busca (Candidatos) ---
  const [candidates, setCandidates] = useState<ProfissionalSummary[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginação da busca
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchError, setSearchError] = useState("");

  // 1. Busca os profissionais JÁ vinculados à especialidade
  const fetchLinkedProfissionais = useCallback(async () => {
    if (!especialidadeId) return;

    try {
      setLoadingList(true);
      // Assumindo que essa rota retorna ProfissionalSummary[]
      const res = await api.get<ProfissionalSummary[]>(
        `/specialities/${especialidadeId}/profissionais`,
      );
      setProfissionais(res.data);
    } catch (error) {
      console.error(getErrorMessage(error));
    } finally {
      setLoadingList(false);
    }
  }, [especialidadeId]);

  useEffect(() => {
    fetchLinkedProfissionais();
  }, [fetchLinkedProfissionais]);

  // 2. Busca profissionais no banco geral (com paginação)
  const fetchCandidates = async (page = 1, term = "") => {
    setLoadingSearch(true);
    setSearchError("");

    try {
      let url = `/professionals/paginated?page=${page}&limit=${SEARCH_LIMIT}`;

      if (term) {
        url = `/professionals/search?q=${encodeURIComponent(term)}&page=${page}&limit=${SEARCH_LIMIT}`;
      }

      // Tipando o retorno da API usando o Generics que você definiu: PaginatedResponse<ProfissionalSummary>
      const response =
        await api.get<PaginatedResponse<ProfissionalSummary>>(url);

      setCandidates(response.data.data);
      setSearchPage(response.data.page);
      setSearchTotalPages(response.data.lastPage);
    } catch (err) {
      setSearchError(getErrorMessage(err));
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearch = () => fetchCandidates(1, searchTerm);

  const handleClearSearch = () => {
    setSearchTerm("");
    setCandidates([]);
    setSearchTotalPages(0);
    setSearchPage(1);
  };

  // 3. Ação de Vincular (POST)
  const handleAdd = async (profId: string) => {
    // Verificação visual para evitar request desnecessário
    if (profissionais.some((p) => p.id_profissional === profId)) {
      return;
    }

    try {
      await api.post(`/specialities/${especialidadeId}/profissionais`, {
        id_profissional: profId,
      });

      // Atualiza a lista de cima
      fetchLinkedProfissionais();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  // 4. Ação de Desvincular (DELETE)
  const handleRemove = async (profId: string) => {
    if (!confirm("Desvincular profissional dessa especialidade?")) return;

    try {
      // DELETE com body precisa da propriedade 'data' no axios
      await api.delete(`/specialities/${especialidadeId}/profissionais`, {
        data: { id_profissional: profId },
      });

      fetchLinkedProfissionais();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="mt-4 pt-3 border-top animate-fade-in">
      {/* === LISTA DE PROFISSIONAIS JÁ VINCULADOS === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold text-secondary m-0">
          Profissionais Especializados
        </h6>
        <span className="badge bg-secondary bg-opacity-10 text-secondary">
          {profissionais.length}
        </span>
      </div>

      {loadingList ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-secondary"></div>
        </div>
      ) : (
        <div className="list-group list-group-flush rounded-3 border-0 mb-4">
          {profissionais.length > 0 ? (
            profissionais.map((prof) => (
              <div
                key={prof.id_profissional}
                className="list-group-item d-flex justify-content-between align-items-center px-0 border-bottom-0 mb-2 bg-light rounded px-3"
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="bg-white rounded-circle d-flex align-items-center justify-content-center text-secondary shadow-sm"
                    style={{ width: "32px", height: "32px" }}
                  >
                    <FontAwesomeIcon icon={faUserMd} className="small" />
                  </div>
                  <div className="d-flex flex-column">
                    <span className="fw-bold small text-dark">{prof.nome}</span>
                    <span
                      className="text-muted"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {/* Usando o campo correto 'registro_conselho' */}
                      {prof.registro_conselho || "S/ registro"}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-link text-danger p-0 opacity-50 hover-opacity-100"
                  onClick={() => handleRemove(prof.id_profissional)}
                  title="Desvincular"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-muted small py-2 fst-italic">
              Nenhum profissional vinculado a esta especialidade.
            </div>
          )}
        </div>
      )}

      <hr className="text-secondary opacity-25 my-4" />

      {/* === ÁREA DE BUSCA E VINCULAÇÃO === */}
      <h6 className="fw-bold text-secondary mb-3">
        Vincular Novo Profissional
      </h6>

      {/* Input de Busca */}
      <div className="position-relative mb-3">
        <input
          type="text"
          className="form-control form-control-sm rounded-pill ps-4"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <FontAwesomeIcon
          icon={faSearch}
          className="position-absolute top-50 start-0 translate-middle-y ms-2 text-secondary small"
        />
        {searchTerm && (
          <span
            className="position-absolute top-50 end-0 translate-middle-y me-2 cursor-pointer p-1"
            onClick={handleClearSearch}
            style={{ cursor: "pointer" }}
          >
            <FontAwesomeIcon icon={faTimes} className="text-secondary small" />
          </span>
        )}
      </div>

      <div className="d-grid mb-3">
        <button
          className="btn btn-sm btn-outline-secondary rounded-pill"
          onClick={handleSearch}
          disabled={loadingSearch}
        >
          {loadingSearch ? "Buscando..." : "Pesquisar Candidatos"}
        </button>
      </div>

      {/* Mensagens de Erro da Busca */}
      {searchError && (
        <div className="alert alert-danger py-1 px-2 small mb-2 rounded-3">
          {searchError}
        </div>
      )}

      {/* Resultados da Busca */}
      {loadingSearch ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-secondary"></div>
        </div>
      ) : candidates.length > 0 ? (
        <div className="animate-fade-in">
          <div className="list-group list-group-flush small">
            {candidates.map((cand) => {
              // Verifica se o ID já existe na lista de cima
              const isAlreadyLinked = profissionais.some(
                (p) => p.id_profissional === cand.id_profissional,
              );

              return (
                <div
                  key={cand.id_profissional}
                  className="list-group-item d-flex justify-content-between align-items-center bg-white border mb-1 rounded"
                >
                  <div className="text-truncate me-2">
                    <div className="fw-bold text-dark">{cand.nome}</div>
                    <div
                      className="d-flex gap-2 text-muted"
                      style={{ fontSize: "0.7rem" }}
                    >
                      <span>Reg: {cand.registro_conselho || "N/A"}</span>
                      <span>•</span>
                      <span>CPF: {cand.cpf}</span>
                    </div>
                  </div>

                  {isAlreadyLinked ? (
                    <span className="badge bg-light text-success border border-success">
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Vinculado
                    </span>
                  ) : (
                    <button
                      className="btn btn-sm btn-success rounded-circle shadow-sm"
                      style={{ width: "30px", height: "30px", padding: 0 }}
                      onClick={() => handleAdd(cand.id_profissional)}
                      title="Adicionar à especialidade"
                    >
                      <FontAwesomeIcon icon={faPlus} className="small" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Paginação da Busca */}
          <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
            <button
              className="btn btn-light btn-sm border rounded-circle"
              disabled={searchPage === 1}
              onClick={() => fetchCandidates(searchPage - 1, searchTerm)}
              style={{ width: "30px", height: "30px", padding: 0 }}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="small" />
            </button>
            <span className="small text-muted fw-bold">
              {searchPage} de {searchTotalPages}
            </span>
            <button
              className="btn btn-light btn-sm border rounded-circle"
              disabled={searchPage === searchTotalPages}
              onClick={() => fetchCandidates(searchPage + 1, searchTerm)}
              style={{ width: "30px", height: "30px", padding: 0 }}
            >
              <FontAwesomeIcon icon={faChevronRight} className="small" />
            </button>
          </div>
        </div>
      ) : (
        searchTerm &&
        !loadingSearch &&
        !searchError && (
          <div className="text-center text-muted small py-2">
            Nenhum candidato encontrado.
          </div>
        )
      )}
    </div>
  );
};

export default EspecialidadeProfissionaisList;
