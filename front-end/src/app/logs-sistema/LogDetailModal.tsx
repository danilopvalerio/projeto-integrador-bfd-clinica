"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faInfoCircle,
  faCalendarAlt,
  faUser,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import { Log } from "./types";

interface Props {
  log: Log | null;
  onClose: () => void;
}

export function LogDetailsModal({ log, onClose }: Props) {
  if (!log) return null;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "full",
      timeStyle: "medium",
    });
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)" }}
      ></div>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        onClick={onClose}
        style={{ zIndex: 1055 }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Header */}
            <div
              className={`modal-header border-0 text-white ${
                log.sucesso ? "bg-secondary bg-gradient" : "bg-danger"
              }`}
            >
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} />
                Detalhes da Operação
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body p-0">
              <div className="p-4 bg-light border-bottom">
                <h4 className="fw-bold text-dark mb-3">{log.acao}</h4>

                <div className="row g-3 text-secondary small">
                  <div className="col-md-6 d-flex align-items-center gap-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="opacity-50"
                    />
                    <span>{formatDate(log.data)}</span>
                  </div>
                  <div className="col-md-6 d-flex align-items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="opacity-50" />
                    <span>
                      {/* AJUSTE AQUI: Nome direto */}
                      {log.usuario
                        ? `${log.usuario.nome} (${log.usuario.email})`
                        : "Usuário do Sistema / Visitante"}
                    </span>
                  </div>
                  <div className="col-md-6 d-flex align-items-center gap-2">
                    <FontAwesomeIcon
                      icon={faNetworkWired}
                      className="opacity-50"
                    />
                    <span className="font-monospace">{log.ip}</span>
                  </div>
                  <div className="col-md-6">
                    <span
                      className={`badge ${
                        log.sucesso
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-danger bg-opacity-10 text-danger"
                      }`}
                    >
                      {log.sucesso ? "SUCESSO" : "FALHA"}
                    </span>
                    <span className="ms-2 badge bg-secondary bg-opacity-10 text-secondary">
                      {log.tipo}
                    </span>
                  </div>
                </div>

                {log.descricao && (
                  <div className="mt-3 p-2 bg-white rounded border text-muted small font-monospace">
                    {log.descricao}
                  </div>
                )}
              </div>

              {/* JSON Viewer */}
              <div className="p-4" style={{ backgroundColor: "#f8f9fa" }}>
                <h6 className="fw-bold text-secondary mb-3 small text-uppercase d-flex align-items-center gap-2">
                  <FontAwesomeIcon icon={faCode} />
                  Dados Enviados / Alterados
                </h6>

                {log.dados ? (
                  <div
                    className="bg-dark text-light p-3 rounded-3 shadow-inner custom-scroll"
                    style={{
                      maxHeight: "400px",
                      overflow: "auto",
                      fontFamily:
                        "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
                      fontSize: "0.85rem",
                      lineHeight: "1.5",
                    }}
                  >
                    <pre className="m-0" style={{ whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(log.dados, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-5 border border-dashed rounded-3 text-muted">
                    <p className="mb-0 small">
                      Nenhum dado de corpo (body) foi registrado para esta ação.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 bg-white">
              <button
                className="btn btn-light text-secondary fw-bold rounded-pill px-4"
                onClick={onClose}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
