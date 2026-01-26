"use client";

import React from "react";
import { AgendamentoCalendarDTO, StatusAgendamento } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faUser,
  faClock,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  data: AgendamentoCalendarDTO;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}

const AppointmentCard = ({ data, onDragStart, onClick }: Props) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  const startTime = start.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const diffMs = end.getTime() - start.getTime();
  const durationMinutes = Math.floor(diffMs / (1000 * 60));
  const isLongDuration = durationMinutes > 60;
  const durationText = `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 > 0 ? ` ${durationMinutes % 60}m` : ""}`;

  const getStatusColor = (s: StatusAgendamento) => {
    if (s === "CONFIRMADO")
      return { bg: "#d1e7dd", text: "#0f5132", border: "#badbcc" };
    if (s === "CANCELADO")
      return { bg: "#f8d7da", text: "#842029", border: "#f5c2c7" };
    if (s === "CONCLUIDO")
      return { bg: "#e2e3e5", text: "#41464b", border: "#d3d6d8" };
    return { bg: "#fff3cd", text: "#664d03", border: "#ffecb5" };
  };

  const colors = getStatusColor(data.status);

  return (
    <div
      draggable
      onDragStart={(e) => {
        // Truque para o elemento ficar 'na frente' enquanto arrasta
        e.currentTarget.style.zIndex = "9999";
        onDragStart(e);
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.zIndex = "1";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="rounded-3 p-2 shadow-sm cursor-pointer position-relative appointment-card-hover"
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${data.ui.color}`,
        fontSize: "0.75rem",
        height: "100px",
        minWidth: "140px", // Largura mínima para garantir legibilidade no scroll horizontal
        overflow: "visible",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* CSS Hover Effect injetado aqui para simplicidade */}
      <style jsx>{`
        .appointment-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
          z-index: 100; /* Sobrepõe os irmãos ao passar o mouse */
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-start mb-1">
        <div
          className="d-flex align-items-center gap-1 text-dark opacity-75 fw-bold"
          style={{ fontSize: "0.7rem" }}
        >
          <FontAwesomeIcon icon={faClock} size="xs" />
          <span>{startTime}</span>
        </div>
        {!isLongDuration && (
          <span className="text-muted x-small opacity-75">-{endTime}</span>
        )}
      </div>

      <div className="d-flex flex-column gap-1">
        <div
          className="d-flex align-items-center text-truncate"
          title={data.paciente.nome}
        >
          <FontAwesomeIcon
            icon={faUser}
            className="me-2 opacity-50"
            style={{ width: 12 }}
          />
          <span className="fw-bold text-dark text-truncate">
            {data.paciente.nome}
          </span>
        </div>
        <div
          className="d-flex align-items-center text-truncate"
          title={data.profissional.nome}
        >
          <FontAwesomeIcon
            icon={faUserMd}
            className="me-2 opacity-50"
            style={{ width: 12 }}
          />
          <span
            className="text-secondary text-truncate"
            style={{ fontSize: "0.7rem" }}
          >
            {data.profissional.nome}
          </span>
        </div>
      </div>

      {isLongDuration && (
        <div
          className="position-absolute shadow-sm d-flex align-items-center justify-content-center gap-2"
          style={{
            bottom: "-10px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "white",
            border: `2px solid ${data.ui.color}`,
            color: data.ui.color,
            borderRadius: "50px",
            padding: "2px 10px",
            fontSize: "0.65rem",
            fontWeight: "800",
            zIndex: 20,
            whiteSpace: "nowrap",
          }}
        >
          <span>{durationText}</span>
          <FontAwesomeIcon icon={faHourglassHalf} />
        </div>
      )}
    </div>
  );
};

export default React.memo(AppointmentCard);
