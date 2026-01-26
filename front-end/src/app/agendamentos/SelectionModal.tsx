"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faChevronLeft,
  faChevronRight,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";

export interface SelectionItem {
  id: string;
  name: string;
  subInfo?: string;
}

interface Props<T> {
  title: string;
  endpoint: string;
  onSelect: (item: SelectionItem) => void;
  onClose: () => void;
  mapper: (item: T) => SelectionItem;
}

const LIMIT = 10;

const SelectionModal = <T,>({
  title,
  endpoint,
  onSelect,
  onClose,
  mapper,
}: Props<T>) => {
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(
    async (currentPage: number, term: string) => {
      setLoading(true);
      try {
        let url = `${endpoint}/paginated?page=${currentPage}&limit=${LIMIT}`;
        if (term) {
          url = `${endpoint}/search?q=${encodeURIComponent(term)}&page=${currentPage}&limit=${LIMIT}`;
        }

        const response = await api.get(url);
        const rawData = response.data.data as T[];
        const mappedItems = rawData.map((item) => mapper(item));

        setItems(mappedItems);
        setTotalPages(response.data.lastPage || 1);
      } catch (error) {
        console.error("Erro ao buscar dados", error);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, mapper],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchItems(1, searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchItems]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchItems(newPage, searchTerm);
    }
  };

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4 bg-white overflow-hidden">
          <div className="modal-header border-bottom-0 p-3 bg-light">
            <h6 className="modal-title fw-bold text-secondary">{title}</h6>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-3">
            <div className="input-group mb-3">
              <span className="input-group-text bg-white border-end-0 text-secondary">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                className="form-control border-start-0 shadow-none"
                style={{ boxShadow: "none" }} // REMOVE FOCO
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div
              className="list-group mb-3 custom-scroll"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-secondary"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  Nenhum resultado encontrado.
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    className="list-group-item list-group-item-action border-0 mb-1 rounded px-3 py-2 d-flex align-items-center gap-3 shadow-none"
                    style={{ outline: "none", boxShadow: "none" }} // REMOVE FOCO
                    onClick={() => onSelect(item)}
                  >
                    <div
                      className="bg-light rounded-circle d-flex align-items-center justify-content-center text-secondary"
                      style={{ width: 32, height: 32 }}
                    >
                      <FontAwesomeIcon icon={faUser} size="sm" />
                    </div>
                    <div className="text-start">
                      <div className="fw-bold text-dark small">{item.name}</div>
                      {item.subInfo && (
                        <div
                          className="text-muted"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {item.subInfo}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center border-top pt-2">
              <button
                className="btn btn-sm btn-light text-secondary shadow-none"
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span className="small text-muted">
                Pág {page} de {totalPages}
              </span>
              <button
                className="btn btn-sm btn-light text-secondary shadow-none"
                disabled={page === totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;
