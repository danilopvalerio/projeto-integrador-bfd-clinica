"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faTimes,
  faClipboardList,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { Log, LogResponse } from "./types";
import { LogRow } from "./LogRow";
import { LogDetailsModal } from "./LogDetailModal"; // <--- IMPORTAR MODAL

const LIMIT = 10;

const LogsPage = () => {
  const router = useRouter();

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // --- ESTADO DO MODAL ---
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const fetchLogs = useCallback(async (page: number, term: string) => {
    setLoading(true);
    setError("");
    try {
      let url = `/logs/paginated?page=${page}&limit=${LIMIT}`;
      if (term.trim()) {
        url = `/logs/search?q=${encodeURIComponent(term)}&page=${page}&limit=${LIMIT}`;
      }

      const response = await api.get<LogResponse>(url);
      const data = response.data;

      setLogs(data.data);
      setTotalPages(data.lastPage || 1);
      setCurrentPage(data.page || 1);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);

      if (typeof err === "object" && err !== null && "response" in err) {
        const apiError = err as { response: { status: number } };
        if (apiError.response.status === 403) {
          setError("Você não tem permissão para visualizar os logs.");
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchLogs(1, "");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      {/* Header */}
      <header className="bg-white border-bottom shadow-sm px-4 py-3 d-flex align-items-center gap-3">
        <button
          className="btn btn-light rounded-circle shadow-sm"
          style={{ width: 40, height: 40 }}
          onClick={() => router.push("/menu")}
          title="Voltar ao Menu"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-secondary" />
        </button>
        <div>
          <h5 className="mb-0 fw-bold text-secondary">Logs de Auditoria</h5>
          <small className="text-muted">
            Histórico de atividades do sistema
          </small>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container my-4 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-bottom bg-light bg-opacity-50">
            <div className="row g-3">
              <div className="col-md-8 col-lg-6">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50"
                  />
                  <input
                    type="text"
                    className="form-control ps-5 rounded-pill shadow-none border"
                    placeholder="Buscar por usuário, ação, IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-muted"
                      onClick={handleClearSearch}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-auto">
                <button
                  className="btn btn-secondary rounded-pill px-4 fw-bold shadow-sm"
                  onClick={handleSearch}
                >
                  Filtrar
                </button>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger m-4 rounded-3 d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
            </div>
          )}

          {/* Table */}
          <div className="table-responsive">
            <table
              className="table table-hover align-middle mb-0"
              style={{ fontSize: "0.85rem" }}
            >
              <thead className="bg-light text-secondary">
                <tr>
                  <th className="ps-4 py-3 border-0">STATUS</th>
                  <th className="py-3 border-0">DATA</th>
                  <th className="py-3 border-0">AÇÃO</th>
                  <th className="py-3 border-0">USUÁRIO</th>
                  <th className="py-3 border-0">IP</th>
                  <th className="py-3 border-0">DEVICE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div
                        className="spinner-border text-secondary mb-2"
                        role="status"
                      />
                      <p className="text-muted small mb-0">Carregando...</p>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <FontAwesomeIcon
                        icon={faClipboardList}
                        size="2x"
                        className="mb-2 opacity-25"
                      />
                      <p className="mb-0">Nenhum registro encontrado.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      onClick={() => setSelectedLog(log)} // <--- CLIQUE AQUI
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="p-3 border-top bg-light d-flex justify-content-between align-items-center">
              <span className="text-muted small ms-2">
                Página <strong>{currentPage}</strong> de{" "}
                <strong>{totalPages}</strong>
              </span>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-white border shadow-sm btn-sm px-3 rounded-3"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <button
                  className="btn btn-white border shadow-sm btn-sm px-3 rounded-3"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default LogsPage;
