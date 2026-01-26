"use client";

import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faClock,
  faUser,
  faUserMd,
} from "@fortawesome/free-solid-svg-icons";
import { AgendamentoCalendarDTO, StatusAgendamento } from "./types";

interface Props {
  date: Date;
  appointments: AgendamentoCalendarDTO[];
  onClose: () => void;
  onSelectAgendamento: (id: string) => void;
}

const DayAppointmentsModal = ({
  date,
  appointments,
  onClose,
  onSelectAgendamento,
}: Props) => {
  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Ordenar por horário
  const sorted = [...appointments].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status: StatusAgendamento) => {
    let colorClass = "bg-secondary";
    if (status === StatusAgendamento.CONFIRMADO) colorClass = "bg-success";
    if (status === StatusAgendamento.PENDENTE)
      colorClass = "bg-warning text-dark";
    if (status === StatusAgendamento.CANCELADO) colorClass = "bg-danger";
    if (status === StatusAgendamento.NAO_COMPARECEU) colorClass = "bg-danger";

    return (
      <span className={`badge rounded-pill ${colorClass} bg-opacity-75`}>
        {status}
      </span>
    );
  };

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }} // Z-Index padrão
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px", width: "95%" }}
      >
        <div className="modal-content border-0 rounded-4 shadow overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-gradient-vl text-white border-0 py-3 px-4 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold text-capitalize mb-0 d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faClock} />
              <span>{formatDate(date)}</span>
            </h5>

            <button
              className="btn btn-link text-white shadow-none p-0 d-flex align-items-center"
              onClick={onClose}
              style={{ boxShadow: "none" }}
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          <div className="modal-body p-0 bg-white">
            {sorted.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-0">
                  Nenhum agendamento para este dia.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4 py-3 text-secondary small text-uppercase border-0">
                        Horário
                      </th>
                      <th className="py-3 text-secondary small text-uppercase border-0">
                        Paciente
                      </th>
                      <th className="py-3 text-secondary small text-uppercase border-0">
                        Profissional
                      </th>
                      <th className="py-3 text-secondary small text-uppercase text-center border-0">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((ag) => (
                      <tr
                        key={ag.id_agendamento}
                        onClick={() => onSelectAgendamento(ag.id_agendamento)} // AgendaCalendar já trata o fechamento
                        style={{ cursor: "pointer" }}
                      >
                        <td
                          className="ps-4 fw-bold text-nowrap text-dark"
                          style={{ width: "130px" }}
                        >
                          {formatTime(ag.start)} - {formatTime(ag.end)}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary border"
                              style={{ width: 32, height: 32 }}
                            >
                              <FontAwesomeIcon icon={faUser} size="xs" />
                            </div>
                            <span className="fw-bold text-dark">
                              {ag.paciente.nome}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2 text-muted">
                            <FontAwesomeIcon
                              icon={faUserMd}
                              className="small opacity-50"
                            />
                            <span className="small">
                              {ag.profissional.nome}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          {getStatusBadge(ag.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="modal-footer bg-light border-0 py-2">
            <small className="text-muted mx-auto">
              {sorted.length} agendamentos listados
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayAppointmentsModal;
