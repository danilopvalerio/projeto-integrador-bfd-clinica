"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCheck,
  faPlus,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { ServicoSummary } from "./types";

interface Props {
  selectedIds: string[];
  onToggle: (id: string, servico: ServicoSummary) => void;
}

const LIMIT = 10;

const ServiceSelector = ({ selectedIds, onToggle }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState<ServicoSummary[]>([]);
  const [loading, setLoading] = useState(false);

  // Paginação interna do seletor
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = useCallback(
    async (currentPage: number, term: string) => {
      setLoading(true);
      try {
        // Lógica corrigida conforme solicitado
        let url = `/services/paginated?page=${currentPage}&limit=${LIMIT}`;
        if (term) {
          url = `/services/search?q=${encodeURIComponent(term)}&page=${currentPage}&limit=${LIMIT}`;
        }

        const response = await api.get(url);
        setServices(response.data.data);
        setTotalPages(response.data.lastPage || 1); // Garante que tenha pelo menos 1
      } catch (error) {
        console.error("Erro ao buscar serviços", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounce para busca
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); // Reseta para pág 1 ao buscar
      fetchServices(1, searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fetchServices]);

  // Navegação de página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchServices(newPage, searchTerm);
    }
  };

  return (
    <div className="border rounded-3 p-3 bg-light">
      <label className="form-label fw-bold small text-secondary">
        Adicionar Serviços
      </label>

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
        />
      </div>

      {/* Lista de Resultados com Scroll */}
      <div
        className="list-group overflow-auto custom-scroll mb-2"
        style={{ maxHeight: "160px" }}
      >
        {loading ? (
          <div className="text-center py-3">
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
                onClick={() => onToggle(s.id_servico, s)}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center small py-2 px-2 border-0 mb-1 rounded ${isSelected ? "bg-primary bg-opacity-10 text-primary fw-bold" : ""}`}
                style={{ outline: "none", boxShadow: "none" }}
              >
                <div
                  className="text-start text-truncate"
                  style={{ maxWidth: "85%" }}
                >
                  <div className="text-truncate">{s.nome}</div>
                  <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                    {s.duracao_estimada} min • R$ {s.preco.toFixed(2)}
                  </div>
                </div>
                {isSelected ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <FontAwesomeIcon
                    icon={faPlus}
                    className="text-secondary opacity-50"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Paginação Compacta */}
      <div className="d-flex justify-content-between align-items-center pt-1">
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
    </div>
  );
};

export default ServiceSelector;
