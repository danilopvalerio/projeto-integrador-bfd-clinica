// src/app/profissionais/components/ScheduleEventCard.tsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { HorarioEntity } from "../../types";

function timeFromISO(iso: string) {
  if (!iso) return "00:00";
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// CORREÇÃO AQUI: Adicionada a propriedade isProcessing (opcional)
interface Props {
  event: HorarioEntity;
  pixelsPorHora: number;
  tempEndTime?: string | null;
  isProcessing?: boolean; // <--- Esta linha corrige o erro "Property does not exist"
  onEdit: (ev: HorarioEntity) => void;
  onDelete: (id: string) => void;
  onResizeStart: (ev: HorarioEntity, e: React.MouseEvent) => void;
  onMoveStart: (ev: HorarioEntity, e: React.MouseEvent) => void;
}

const ScheduleEventCard = ({
  event,
  pixelsPorHora,
  tempEndTime,
  isProcessing = false,
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
  const height = Math.max((duration / 60) * pixelsPorHora - 2, 24);

  return (
    <div
      className="schedule-card position-absolute rounded-1 shadow-sm d-flex flex-column justify-content-center overflow-hidden animate-fade-in user-select-none"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: "4px",
        right: "4px",
        zIndex: isProcessing ? 5 : 10,
        pointerEvents: isProcessing ? "none" : "auto",
        cursor: isProcessing ? "wait" : "grab",
        backgroundColor: isProcessing ? "#f8f9fa" : "#e7f1ff",
        borderLeft: isProcessing ? "4px solid #ced4da" : "4px solid #0d6efd",
        opacity: isProcessing ? 0.7 : 1,
        boxSizing: "border-box",
        padding: "0 8px",
        transition: "all 0.2s ease",
      }}
      onMouseDown={(e) => {
        if (isProcessing) return;
        e.stopPropagation();
        onMoveStart(event, e);
      }}
      onClick={(e) => e.stopPropagation()}
      title={`${timeFromISO(event.hora_inicio)} - ${timeFromISO(finalEndTime)}`}
    >
      <div className="d-flex justify-content-between align-items-center h-100 w-100 position-relative">
        <span
          className={`fw-bold text-truncate flex-grow-1 ${
            isProcessing ? "text-muted" : "text-primary"
          }`}
          style={{ fontSize: "0.75rem", lineHeight: 1.2 }}
        >
          {timeFromISO(event.hora_inicio)} - {timeFromISO(finalEndTime)}
        </span>

        {isProcessing && (
          <div className="ms-2">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-secondary small"
            />
          </div>
        )}

        {!isProcessing && (
          <div
            className="action-buttons d-flex gap-1 align-items-center ps-2"
            style={{ zIndex: 2 }}
          >
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
        )}
      </div>

      {!isProcessing && (
        <div
          className="position-absolute bottom-0 start-0 w-100"
          style={{
            height: "8px",
            cursor: "ns-resize",
            zIndex: 5,
            marginBottom: "-2px",
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(event, e);
          }}
        />
      )}

      <style jsx>{`
        .schedule-card {
          transition:
            box-shadow 0.1s,
            transform 0.1s,
            top 0.2s ease,
            height 0.2s ease;
        }

        .schedule-card:active {
          cursor: grabbing !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
          z-index: 20 !important;
        }

        .action-buttons {
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
        }

        .schedule-card:hover .action-buttons {
          opacity: 1;
        }

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
