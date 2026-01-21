"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faTimes,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";

import { LogRow } from "../../features/logs/LogRow";
import { Log } from "../../features/logs/types";

//const LIMIT = 5;

// MOCK TEMPORÁRIO
const MOCK_LOGS: Log[] = [
  {
    id: "1",
    tipo: "ACESSO",
    data: new Date().toISOString(),
    acao: "LOGIN",
    sucesso: true,
    ip: "127.0.0.1",
    user_agent: "Chrome/120",
    usuario: {
      id_usuario: "user-1",
      nome: "Maria Silva",
      email: "maria@clinica.com",
    },
  },
  {
    id: "2",
    tipo: "ACESSO",
    data: new Date().toISOString(),
    acao: "LOGOUT",
    sucesso: true,
    ip: "127.0.0.2",
    user_agent: "Firefox/112",
    usuario: {
      id_usuario: "user-2",
      nome: "João",
      email: "joao@clinica.com",
    },
  },
];


const LogsPage = () => {
  const router = useRouter();

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar logs (mock)
  const fetchLogs = useCallback((term = "") => {
    setLoading(true);

    let filteredLogs = MOCK_LOGS;

    if (term) {
        const lower = term.toLowerCase();

        filteredLogs = MOCK_LOGS.filter((log) =>
        log.acao.toLowerCase().includes(lower) ||
        log.usuario?.nome?.toLowerCase().includes(lower) ||
        log.usuario?.email?.toLowerCase().includes(lower) ||
        log.ip?.includes(term)
    );
    }


    setLogs(filteredLogs);
    setCurrentPage(1);
    setTotalPages(1);
    setLoading(false);
  }, []);

  // --------------------
  // Autorização (mock)
  // --------------------
  useEffect(() => {
    setCheckingAuth(false);
    fetchLogs("");
  }, [fetchLogs]);

  // --------------------
  // Handlers
  // --------------------
  const handleSearch = () => fetchLogs(searchTerm);

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchLogs("");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(searchTerm);
    }
  };

  if (checkingAuth) {
    return (
      <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#e9e9e9ff" }}>
      {/* Header */}
      <header className="header-panel bg-gradient-vl d-flex align-items-center bg-dark px-2">
        <button
          className="btn btn-link text-white"
          onClick={() => router.push("/dashboard")}
          title="Voltar ao Menu"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="fs-4" />
        </button>
      </header>

      {/* Conteúdo */}
      <div className="container my-5 flex-grow-1">
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          {/* Título */}
          <div className="bg-gradient-vl p-4 text-center text-white">
            <h3 className="fw-bold m-0">
              <FontAwesomeIcon icon={faClipboardList} className="me-2 fs-3 opacity-75" />
              Logs de Acesso
            </h3>
            <p className="m-0 opacity-75 small">Histórico geral de ações e acessos do sistema.</p>
          </div>

          <div className="p-4">
            {/* Busca */}
            <div className="row g-3 mb-4 justify-content-center">
              <div className="col-12 col-md-8 col-lg-6">
                <div className="position-relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
                  />
                  <input
                    type="text"
                    className="p-2 ps-5 w-100 form-control-underline2"
                    placeholder="Buscar por ação, usuário ou IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  {searchTerm && (
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ cursor: "pointer" }}
                      onClick={handleClearSearch}
                    >
                      <FontAwesomeIcon className="text-secondary" icon={faTimes} />
                    </span>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-2">
                <button className="w-100 button-bottom-line-rounded px-4 py-2" onClick={handleSearch}>
                  Buscar
                </button>
              </div>
            </div>

            {/* Tabela */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status" />
                <p className="mt-2 text-muted">Carregando logs...</p>
              </div>
            ) : logs.length > 0 ? (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="text-muted small fw-bold">TIPO</th>
                        <th className="text-muted small fw-bold">DATA / HORA</th>
                        <th className="text-muted small fw-bold">AÇÃO</th>
                        <th className="text-muted small fw-bold">USUÁRIO</th>
                        <th className="text-muted small fw-bold">IP</th>
                        <th className="text-muted small fw-bold">DISPOSITIVO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <LogRow key={log.id} log={log} />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                <div className="d-flex justify-content-center align-items-center gap-3 mt-4 border-top pt-4">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>

                  <span className="text-muted small fw-bold">
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted">
                <p className="fs-5 mb-1">Nenhum registro encontrado.</p>
                <small>Não há logs para o filtro aplicado.</small>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center py-3 text-muted small">
        © 2025 Sistema da Clínica · Logs de Auditoria
      </footer>
    </div>
  );
};

export default LogsPage;
