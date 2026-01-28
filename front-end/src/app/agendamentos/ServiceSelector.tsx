"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheck,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faListUl,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { ServicoSummary } from "./types";

interface Props {
  selectedIds: string[];
  onToggle: (id: string, servico: ServicoSummary) => void;
}

const LIMIT = 10;

const ServiceSelector = ({ selectedIds, onToggle }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false); // Controla a exibição da busca
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<ServicoSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = useCallback(
    async (currentPage: number, term: string) => {
      setLoading(true);
      try {
        let url = `/services/paginated?page=${currentPage}&limit=${LIMIT}`;
        if (term) {
          url = `/services/search?q=${encodeURIComponent(term)}&page=${currentPage}&limit=${LIMIT}`;
        }

        const response = await api.get(url);
        setServices(response.data.data);
        setTotalPages(response.data.lastPage || 1);
      } catch (error) {
        console.error("Erro ao buscar serviços", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Efeito só dispara se o componente estiver expandido
  useEffect(() => {
    if (!isExpanded) return;

    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchServices(1, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchServices, isExpanded]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchServices(newPage, searchTerm);
    }
  };

  // ESTADO INICIAL: Botão para carregar
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="btn btn-outline-secondary btn-sm w-100 border-dashed rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 shadow-none"
        style={{ borderStyle: "dashed" }}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span className="fw-bold">Adicionar Serviço</span>
      </button>
    );
  }

  // ESTADO EXPANDIDO: Busca e Lista
  return (
    <div className="border rounded-3 p-3 bg-light animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label fw-bold small text-secondary mb-0">
          <FontAwesomeIcon icon={faListUl} className="me-2" />
          Catálogo de Serviços
        </label>
        <button
          type="button"
          className="btn-close small shadow-none"
          aria-label="Close"
          onClick={() => setIsExpanded(false)}
          style={{ fontSize: "0.7rem" }}
        />
      </div>

      {/* Input de Busca */}
      <div className="input-group mb-2">
        <span className="input-group-text bg-white border-end-0 text-secondary">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input
          type="text"
          className="form-control border-start-0 shadow-none"
          style={{ boxShadow: "none" }}
          placeholder="Buscar serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus // Foca automaticamente ao abrir
        />
      </div>

      {/* Lista de Resultados */}
      <div
        className="list-group overflow-auto custom-scroll mb-2"
        style={{ maxHeight: "180px" }}
      >
        {loading ? (
          <div className="text-center py-4">
            <span className="spinner-border spinner-border-sm text-secondary"></span>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-3 text-muted small">
            Nenhum serviço encontrado.
          </div>
        ) : (
          services.map((s) => {
            const isSelected = selectedIds.includes(s.id_servico);

            return (
              <button
                key={s.id_servico}
                type="button"
                disabled={isSelected} // Bloqueia clique se já selecionado
                onClick={() => !isSelected && onToggle(s.id_servico, s)}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center small py-2 px-2 border-0 mb-1 rounded 
                  ${
                    isSelected
                      ? "bg-secondary bg-opacity-10 text-secondary cursor-not-allowed"
                      : "bg-white"
                  }`}
                style={{
                  outline: "none",
                  boxShadow: "none",
                  cursor: isSelected ? "not-allowed" : "pointer",
                  opacity: isSelected ? 0.7 : 1,
                }}
              >
                <div
                  className="text-start text-truncate"
                  style={{ maxWidth: "75%" }}
                >
                  <div className="text-truncate fw-bold">{s.nome}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {s.duracao_estimada} min • R$ {s.preco.toFixed(2)}
                  </div>
                </div>

                {isSelected ? (
                  <span className="badge bg-secondary text-white d-flex align-items-center gap-1 rounded-pill px-2">
                    <FontAwesomeIcon icon={faCheck} size="xs" />
                    <span style={{ fontSize: "0.6rem" }}>Adicionado</span>
                  </span>
                ) : (
                  <div
                    className="btn btn-sm btn-light text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 24, height: 24 }}
                  >
                    <FontAwesomeIcon icon={faPlus} size="xs" />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center pt-1 border-top mt-2">
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary p-0 shadow-none"
            disabled={page === 1 || loading}
            onClick={() => handlePageChange(page - 1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="small text-muted" style={{ fontSize: "0.7rem" }}>
            Pág {page} de {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary p-0 shadow-none"
            disabled={page === totalPages || loading}
            onClick={() => handlePageChange(page + 1)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceSelector;
