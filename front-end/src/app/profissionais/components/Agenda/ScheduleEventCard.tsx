// src/app/profissionais/components/ScheduleEventCard.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { HorarioEntity } from "../../types";

function timeFromISO(iso: string) {
  if (!iso) return "00:00";
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

interface Props {
  event: HorarioEntity;
  pixelsPorHora: number;
  tempEndTime?: string | null;
  onEdit: (ev: HorarioEntity) => void;
  onDelete: (id: string) => void;
  onResizeStart: (ev: HorarioEntity, e: React.MouseEvent) => void;
  onMoveStart: (ev: HorarioEntity, e: React.MouseEvent) => void;
}

const ScheduleEventCard = ({
  event,
  pixelsPorHora,
  tempEndTime,
  onEdit,
  onDelete,
  onResizeStart,
  onMoveStart,
}: Props) => {
  const finalEndTime = tempEndTime || event.hora_fim;

  const startMin =
    new Date(event.hora_inicio).getUTCHours() * 60 +
    new Date(event.hora_inicio).getUTCMinutes();
  const endMin =
    new Date(finalEndTime).getUTCHours() * 60 +
    new Date(finalEndTime).getUTCMinutes();
  const duration = endMin - startMin;

  const top = (startMin / 60) * pixelsPorHora;
  // Subtraímos 2px para criar um "gap" visual entre eventos consecutivos
  const height = Math.max((duration / 60) * pixelsPorHora - 2, 24);

  return (
    <div
      className="schedule-card position-absolute rounded-1 shadow-sm d-flex flex-column justify-content-center overflow-hidden animate-fade-in user-select-none"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        // Mais espaço nas laterais para não colar na grade
        left: "4px",
        right: "4px",
        zIndex: 10,
        pointerEvents: "auto",
        cursor: "grab",
        // Estilo visual moderno: Fundo claro e borda esquerda colorida
        backgroundColor: "#e7f1ff", // Azul bem claro
        borderLeft: "4px solid #0d6efd", // Azul Bootstrap Primary
        boxSizing: "border-box", // Garante que padding/borda não estoure o tamanho
        padding: "0 8px", // Padding interno horizontal
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMoveStart(event, e);
      }}
      onClick={(e) => e.stopPropagation()}
      title={`${timeFromISO(event.hora_inicio)} - ${timeFromISO(finalEndTime)}`}
    >
      <div className="d-flex justify-content-between align-items-center h-100 w-100 position-relative">
        {/* TEXTO DO HORÁRIO */}
        <span
          className="fw-bold text-primary text-truncate flex-grow-1"
          style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
        >
          {timeFromISO(event.hora_inicio)} - {timeFromISO(finalEndTime)}
        </span>

        {/* BOTÕES DE AÇÃO (Só aparecem no Hover) */}
        <div
          className="action-buttons d-flex gap-1 align-items-center ps-2"
          style={{ zIndex: 2 }}
        >
          {/* Botão Editar: Fundo Azul */}
          <button
            className="btn p-0 bg-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center border-0 text-white hover-scale"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "22px",
              height: "22px",
              minWidth: "22px",
              cursor: "pointer",
            }}
            title="Editar"
          >
            <FontAwesomeIcon icon={faPen} style={{ fontSize: "0.65rem" }} />
          </button>

          {/* Botão Excluir: Fundo Vermelho */}
          <button
            className="btn p-0 bg-danger rounded-circle shadow-sm d-flex align-items-center justify-content-center border-0 text-white hover-scale"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id_horario);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: "22px",
              height: "22px",
              minWidth: "22px",
              cursor: "pointer",
            }}
            title="Excluir"
          >
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: "0.65rem" }} />
          </button>
        </div>
      </div>

      {/* HANDLE DE RESIZE (BORDA INFERIOR INVISÍVEL MAS CLICÁVEL) */}
      <div
        className="position-absolute bottom-0 start-0 w-100"
        style={{
          height: "8px", // Área de pega confortável
          cursor: "ns-resize",
          zIndex: 5,
          marginBottom: "-2px", // Ajuste fino para pegar bem a borda
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(event, e);
        }}
      />

      <style jsx>{`
        .schedule-card {
          transition:
            box-shadow 0.1s,
            transform 0.1s;
        }

        .schedule-card:active {
          cursor: grabbing !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
          z-index: 20 !important; /* Traz pra frente ao arrastar */
        }

        /* Botões invisíveis até passar o mouse */
        .action-buttons {
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
        }

        .schedule-card:hover .action-buttons {
          opacity: 1;
        }

        /* Efeito de hover nos botões redondos */
        .hover-scale {
          transition: transform 0.1s;
        }
        .hover-scale:hover {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
};

export default React.memo(ScheduleEventCard);
