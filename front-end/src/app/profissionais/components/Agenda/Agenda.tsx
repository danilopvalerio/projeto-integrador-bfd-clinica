// src/app/profissionais/components/ProfissionalHorariosModal.tsx
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faCalendarDays,
  faPlus,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../../../utils/api";
import { getErrorMessage } from "../../../../utils/errorUtils";
import { HorarioEntity } from "../../types";
import ScheduleEventCard from "./ScheduleEventCard";
import ManualScheduleForm from "./ManualScheduleForm";
import ConfirmationModal from "../../../../components/ConfirmationModal";

interface Props {
  profissionalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
const PIXELS_POR_HORA = 120;
const SNAP_MINUTES = 5;
const TOTAL_HOURS = 24;
const COLUMN_MIN_WIDTH = "160px";
const TIME_COL_WIDTH = "60px";

// --- HELPERS ---
function timeFromISO(iso: string) {
  if (!iso) return "00:00";
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function isoFromDayAndTime(dia_semana: number, timeHHMM: string) {
  const base = new Date("2026-01-04T00:00:00.000Z");
  const [hh, mm] = timeHHMM.split(":").map((x) => Number(x));
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + dia_semana);
  d.setUTCHours(hh, mm, 0, 0);
  return d.toISOString();
}

function minutesToHHMM(totalMinutes: number) {
  const hh = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function getMinutesFromY(y: number) {
  const rawMinutes = (y / PIXELS_POR_HORA) * 60;
  const snapped = Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES;
  return Math.max(0, Math.min(snapped, 24 * 60));
}

// --- SUB-COMPONENT: DAY COLUMN ---
interface DayColumnProps {
  dayIndex: number;
  events: HorarioEntity[];
  // Drag Create Props
  dragStart: { dayIndex: number; minutes: number } | null;
  dragCurrentMinutes: number | null;

  // Resize Props
  resizingState: {
    eventId: string;
    newEndMinutes: number;
    originalEndMinutes: number;
  } | null;

  // Move Props
  movingState: {
    eventId: string;
    duration: number;
    newDayIndex: number;
    newStartMinutes: number;
    originalDayIndex: number;
    originalStartMinutes: number;
  } | null;

  onMouseDown: (dayIndex: number, e: React.MouseEvent) => void;
  onMouseMove: (dayIndex: number, e: React.MouseEvent) => void;
  onEdit: (h: HorarioEntity) => void;
  onDelete: (id: string) => void;
  onResizeStart: (ev: HorarioEntity, e: React.MouseEvent) => void;
  onMoveStart: (ev: HorarioEntity, e: React.MouseEvent) => void;
}

const DayColumn = React.memo(
  ({
    dayIndex,
    events,
    dragStart,
    dragCurrentMinutes,
    resizingState,
    movingState,
    onMouseDown,
    onMouseMove,
    onEdit,
    onDelete,
    onResizeStart,
    onMoveStart,
  }: DayColumnProps) => {
    const isCreatingHere = dragStart?.dayIndex === dayIndex;

    return (
      <div
        className="position-relative border-end border-bottom user-select-none grid-col-hover"
        style={{
          minWidth: COLUMN_MIN_WIDTH,
          flex: 1,
          height: `${TOTAL_HOURS * PIXELS_POR_HORA}px`,
          backgroundImage: `linear-gradient(to bottom, #e9ecef 1px, transparent 1px)`,
          backgroundSize: `100% ${PIXELS_POR_HORA}px`,
          cursor: "crosshair",
        }}
        onMouseDown={(e) => onMouseDown(dayIndex, e)}
        onMouseMove={(e) => onMouseMove(dayIndex, e)}
      >
        {events.map((ev) => {
          if (movingState?.eventId === ev.id_horario) return null;

          const isResizingThis = resizingState?.eventId === ev.id_horario;
          let tempEndTime = null;

          if (isResizingThis && resizingState) {
            tempEndTime = isoFromDayAndTime(
              dayIndex,
              minutesToHHMM(resizingState.newEndMinutes),
            );
          }

          return (
            <ScheduleEventCard
              key={ev.id_horario}
              event={ev}
              pixelsPorHora={PIXELS_POR_HORA}
              tempEndTime={tempEndTime}
              onEdit={onEdit}
              onDelete={onDelete}
              onResizeStart={onResizeStart}
              onMoveStart={onMoveStart}
            />
          );
        })}

        {/* Ghost Create */}
        {isCreatingHere && dragCurrentMinutes !== null && dragStart && (
          <div
            className="position-absolute rounded-1 bg-success bg-opacity-50 border border-success pe-none shadow-sm d-flex flex-column justify-content-center overflow-hidden px-2"
            style={{
              top: `${(Math.min(dragStart.minutes, dragCurrentMinutes) / 60) * PIXELS_POR_HORA}px`,
              height: `${(Math.abs(dragCurrentMinutes - dragStart.minutes) / 60) * PIXELS_POR_HORA}px`,
              left: "2px",
              right: "2px",
              zIndex: 20,
            }}
          >
            <div
              className="text-white fw-bold text-center w-100"
              style={{
                fontSize: "0.7rem",
                textShadow: "0 0 2px rgba(0,0,0,0.5)",
              }}
            >
              {minutesToHHMM(Math.min(dragStart.minutes, dragCurrentMinutes))} -{" "}
              {minutesToHHMM(Math.max(dragStart.minutes, dragCurrentMinutes))}
            </div>
          </div>
        )}

        {/* Ghost Moving */}
        {movingState && movingState.newDayIndex === dayIndex && (
          <div
            className="position-absolute rounded-1 bg-primary bg-opacity-50 border border-primary pe-none shadow-lg d-flex flex-column justify-content-center overflow-hidden px-2"
            style={{
              top: `${(movingState.newStartMinutes / 60) * PIXELS_POR_HORA}px`,
              height: `${(movingState.duration / 60) * PIXELS_POR_HORA}px`,
              left: "2px",
              right: "2px",
              zIndex: 30,
              cursor: "grabbing",
            }}
          >
            <div
              className="text-white fw-bold d-flex justify-content-between align-items-center w-100"
              style={{
                fontSize: "0.7rem",
                textShadow: "0 0 2px rgba(0,0,0,0.5)",
              }}
            >
              <span className="text-truncate">
                {minutesToHHMM(movingState.newStartMinutes)} -{" "}
                {minutesToHHMM(
                  movingState.newStartMinutes + movingState.duration,
                )}
              </span>
              <FontAwesomeIcon icon={faTimes} className="opacity-50 ms-1" />
            </div>
          </div>
        )}
      </div>
    );
  },
);
DayColumn.displayName = "DayColumn";

// --- COMPONENTE PRINCIPAL ---
const ProfissionalHorariosModal = ({
  profissionalId,
  onClose,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [horarios, setHorarios] = useState<HorarioEntity[]>([]);

  // STATES: Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    dayIndex: number;
    minutes: number;
  } | null>(null);
  const [dragCurrentMinutes, setDragCurrentMinutes] = useState<number | null>(
    null,
  );

  const [resizingState, setResizingState] = useState<{
    eventId: string;
    dayIndex: number;
    startMinutes: number;
    originalEndMinutes: number;
    newEndMinutes: number;
  } | null>(null);

  const [movingState, setMovingState] = useState<{
    eventId: string;
    duration: number;
    originalDayIndex: number;
    originalStartMinutes: number;
    newDayIndex: number;
    newStartMinutes: number;
  } | null>(null);

  // STATE: Confirmation Modal
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // STATE: Manual Form
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [manualFormValues, setManualFormValues] = useState({
    dia: 1,
    inicio: "08:00",
    fim: "12:00",
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !error && !showManualForm && !confirmationModal)
        onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, error, showManualForm, confirmationModal]);

  const fetchHorarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/professionals/${profissionalId}/horarios`,
      );
      setHorarios(response.data as HorarioEntity[]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [profissionalId]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  // --- ACTIONS ---

  // CORREÇÃO: Envolvido em useCallback para ser dependência estável
  const executeDelete = useCallback(
    async (id_horario: string) => {
      setSaving(true);
      try {
        await api.delete(`/professionals/horarios/${id_horario}`);
        await fetchHorarios();
        onSuccess();
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setSaving(false);
        setConfirmationModal(null);
      }
    },
    [fetchHorarios, onSuccess],
  );

  const handleDelete = useCallback(
    (id_horario: string) => {
      setConfirmationModal({
        isOpen: true,
        title: "Excluir Horário?",
        message: "Tem certeza que deseja remover este horário da agenda?",
        onConfirm: () => executeDelete(id_horario),
      });
    },
    [executeDelete], // Dependência adicionada corretamente
  );

  const handleSaveManual = async (data: {
    dia: number;
    inicio: string;
    fim: string;
  }) => {
    // CORREÇÃO: Substituído alert por setError
    if (!data.inicio || !data.fim) {
      setError("Por favor, preencha os horários de início e fim.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        dia_semana: data.dia,
        hora_inicio: isoFromDayAndTime(data.dia, data.inicio),
        hora_fim: isoFromDayAndTime(data.dia, data.fim),
      };
      if (editingId) {
        await api.patch(`/professionals/horarios/${editingId}`, payload);
      } else {
        await api.post(`/professionals/${profissionalId}/horarios`, payload);
      }
      await fetchHorarios();
      setShowManualForm(false);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // --- DRAG HANDLERS (Create, Resize, Move) ---

  const handleMouseDown = useCallback(
    (dayIndex: number, e: React.MouseEvent) => {
      if (
        saving ||
        loading ||
        showManualForm ||
        error ||
        resizingState ||
        movingState ||
        confirmationModal
      )
        return;
      const target = e.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const minutes = getMinutesFromY(offsetY);
      setIsDragging(true);
      setDragStart({ dayIndex, minutes });
      setDragCurrentMinutes(minutes + SNAP_MINUTES);
    },
    [
      saving,
      loading,
      showManualForm,
      error,
      resizingState,
      movingState,
      confirmationModal,
    ],
  );

  const handleSaveCreateDrag = useCallback(async () => {
    if (!dragStart || dragCurrentMinutes === null) return;
    const min = Math.min(dragStart.minutes, dragCurrentMinutes);
    const max = Math.max(dragStart.minutes, dragCurrentMinutes);
    if (min === max) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    setSaving(true);
    try {
      await api.post(`/professionals/${profissionalId}/horarios`, {
        dia_semana: dragStart.dayIndex,
        hora_inicio: isoFromDayAndTime(dragStart.dayIndex, minutesToHHMM(min)),
        hora_fim: isoFromDayAndTime(dragStart.dayIndex, minutesToHHMM(max)),
      });
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
      setIsDragging(false);
      setDragStart(null);
      setDragCurrentMinutes(null);
    }
  }, [dragStart, dragCurrentMinutes, profissionalId, fetchHorarios, onSuccess]);

  const handleResizeStart = useCallback(
    (ev: HorarioEntity) => {
      if (saving || loading) return;
      const startD = new Date(ev.hora_inicio);
      const startMinutes = startD.getUTCHours() * 60 + startD.getUTCMinutes();
      const endD = new Date(ev.hora_fim);
      const endMinutes = endD.getUTCHours() * 60 + endD.getUTCMinutes();

      setResizingState({
        eventId: ev.id_horario,
        dayIndex: ev.dia_semana,
        startMinutes,
        originalEndMinutes: endMinutes,
        newEndMinutes: endMinutes,
      });
    },
    [saving, loading],
  );

  const handleSaveResize = useCallback(async () => {
    if (!resizingState) return;
    if (resizingState.newEndMinutes === resizingState.originalEndMinutes) {
      setResizingState(null);
      return;
    }
    if (resizingState.newEndMinutes <= resizingState.startMinutes) {
      setResizingState(null);
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/professionals/horarios/${resizingState.eventId}`, {
        dia_semana: resizingState.dayIndex,
        hora_inicio: isoFromDayAndTime(
          resizingState.dayIndex,
          minutesToHHMM(resizingState.startMinutes),
        ),
        hora_fim: isoFromDayAndTime(
          resizingState.dayIndex,
          minutesToHHMM(resizingState.newEndMinutes),
        ),
      });
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
      setResizingState(null);
    }
  }, [resizingState, fetchHorarios, onSuccess]);

  const handleMoveStart = useCallback(
    (ev: HorarioEntity) => {
      if (saving || loading) return;
      const startD = new Date(ev.hora_inicio);
      const startMinutes = startD.getUTCHours() * 60 + startD.getUTCMinutes();
      const endD = new Date(ev.hora_fim);
      const endMinutes = endD.getUTCHours() * 60 + endD.getUTCMinutes();
      const duration = endMinutes - startMinutes;

      setMovingState({
        eventId: ev.id_horario,
        duration,
        originalDayIndex: ev.dia_semana,
        originalStartMinutes: startMinutes,
        newDayIndex: ev.dia_semana,
        newStartMinutes: startMinutes,
      });
    },
    [saving, loading],
  );

  const handleSaveMove = useCallback(async () => {
    if (!movingState) return;
    if (
      movingState.newDayIndex === movingState.originalDayIndex &&
      movingState.newStartMinutes === movingState.originalStartMinutes
    ) {
      setMovingState(null);
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/professionals/horarios/${movingState.eventId}`, {
        dia_semana: movingState.newDayIndex,
        hora_inicio: isoFromDayAndTime(
          movingState.newDayIndex,
          minutesToHHMM(movingState.newStartMinutes),
        ),
        hora_fim: isoFromDayAndTime(
          movingState.newDayIndex,
          minutesToHHMM(movingState.newStartMinutes + movingState.duration),
        ),
      });
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
      setMovingState(null);
    }
  }, [movingState, fetchHorarios, onSuccess]);

  const handleMouseMove = useCallback(
    (dayIndex: number, e: React.MouseEvent) => {
      if (!isDragging && !resizingState && !movingState) return;
      const target = e.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const minutes = getMinutesFromY(offsetY);

      if (isDragging) {
        if (minutes !== dragCurrentMinutes) setDragCurrentMinutes(minutes);
      } else if (resizingState) {
        const newEnd = Math.max(
          minutes,
          resizingState.startMinutes + SNAP_MINUTES,
        );
        if (newEnd !== resizingState.newEndMinutes) {
          setResizingState((prev) =>
            prev ? { ...prev, newEndMinutes: newEnd } : null,
          );
        }
      } else if (movingState) {
        if (
          movingState.newDayIndex !== dayIndex ||
          movingState.newStartMinutes !== minutes
        ) {
          setMovingState((prev) =>
            prev
              ? {
                  ...prev,
                  newDayIndex: dayIndex,
                  newStartMinutes: minutes,
                }
              : null,
          );
        }
      }
    },
    [isDragging, dragCurrentMinutes, resizingState, movingState],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) handleSaveCreateDrag();
    if (resizingState) handleSaveResize();
    if (movingState) handleSaveMove();
  }, [
    isDragging,
    resizingState,
    movingState,
    handleSaveCreateDrag,
    handleSaveResize,
    handleSaveMove,
  ]);

  const openEditForm = useCallback((h?: HorarioEntity) => {
    if (h) {
      setEditingId(h.id_horario);
      setManualFormValues({
        dia: h.dia_semana,
        inicio: timeFromISO(h.hora_inicio),
        fim: timeFromISO(h.hora_fim),
      });
    } else {
      setEditingId(null);
      setManualFormValues({ dia: 1, inicio: "08:00", fim: "12:00" });
    }
    setShowManualForm(true);
  }, []);

  const timeLabels = useMemo(() => {
    const labels = [];
    for (let i = 0; i <= 23; i++) {
      labels.push(
        <div
          key={i}
          className="text-muted small text-end pe-2 position-relative"
          style={{
            height: `${PIXELS_POR_HORA}px`,
            fontSize: "0.75rem",
            top: "-6px",
          }}
        >
          {String(i).padStart(2, "0")}:00
        </div>,
      );
    }
    return labels;
  }, []);

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onMouseDown={onClose}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
          onMouseDown={(e) => e.stopPropagation()}
          style={{ height: "90vh" }}
        >
          <div className="modal-content border-0 rounded-4 shadow h-100 d-flex flex-column overflow-hidden">
            {/* HEADER */}
            <div className="modal-header bg-gradient-vl text-white px-4 py-3 flex-shrink-0 justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <FontAwesomeIcon icon={faCalendarDays} size="lg" />
                <div className="ms-2">
                  <h5 className="modal-title fw-bold mb-0">Agenda Semanal</h5>
                  <small className="opacity-75">
                    Arraste, redimensione ou use o Manual
                  </small>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-light text-primary fw-bold rounded-pill shadow-none"
                  onClick={() => openEditForm()}
                  disabled={!!error}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Manual
                </button>
                <button
                  className="btn btn-link text-white shadow-none"
                  onClick={onClose}
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>
            </div>

            {/* BODY */}
            <div
              className="modal-body p-0 overflow-auto bg-white custom-scrollbar position-relative"
              ref={containerRef}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                if (isDragging) {
                  setIsDragging(false);
                  setDragStart(null);
                }
              }}
            >
              {loading && (
                <div
                  className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
                  style={{ zIndex: 100 }}
                >
                  <div className="spinner-border text-primary" />
                </div>
              )}

              {/* HEADER DIAS */}
              <div
                className="d-flex border-bottom bg-light"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 50,
                  minWidth: "fit-content",
                }}
              >
                <div
                  className="flex-shrink-0 border-end bg-light"
                  style={{
                    width: TIME_COL_WIDTH,
                    position: "sticky",
                    left: 0,
                    zIndex: 51,
                  }}
                />
                {DIAS_SEMANA.map((dia, index) => (
                  <div
                    key={index}
                    className="text-center py-2 fw-bold text-secondary small border-end bg-light"
                    style={{ minWidth: COLUMN_MIN_WIDTH, flex: 1 }}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* GRID */}
              <div className="d-flex" style={{ minWidth: "fit-content" }}>
                <div
                  className="flex-shrink-0 border-end bg-white pt-3"
                  style={{
                    width: TIME_COL_WIDTH,
                    position: "sticky",
                    left: 0,
                    zIndex: 40,
                  }}
                >
                  {timeLabels}
                </div>

                {DIAS_SEMANA.map((_, dayIndex) => (
                  <DayColumn
                    key={dayIndex}
                    dayIndex={dayIndex}
                    events={horarios.filter((h) => h.dia_semana === dayIndex)}
                    dragStart={dragStart}
                    dragCurrentMinutes={dragCurrentMinutes}
                    resizingState={resizingState}
                    movingState={movingState}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                    onResizeStart={handleResizeStart}
                    onMoveStart={handleMoveStart}
                  />
                ))}
              </div>
            </div>

            <ManualScheduleForm
              isOpen={showManualForm}
              isEditing={!!editingId}
              initialValues={manualFormValues}
              diasSemana={DIAS_SEMANA}
              isSaving={saving}
              onClose={() => setShowManualForm(false)}
              onSave={handleSaveManual}
            />
            <style jsx>{`
              .grid-col-hover {
                transition: background-color 0.1s;
              }
              .grid-col-hover:hover {
                background-color: rgba(0, 0, 0, 0.02);
                box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
              }
            `}</style>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmationModal && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onCancel={() => setConfirmationModal(null)}
          variant="danger"
          confirmText="Sim, excluir"
          cancelText="Cancelar"
          isProcessing={saving}
        />
      )}

      {/* --- ERROR MODAL (Simples) --- */}
      {error && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-body text-center p-4">
                <div className="mb-3 text-danger">
                  <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
                </div>
                <h5 className="fw-bold mb-2">Ops!</h5>
                <p className="text-muted small mb-4">{error}</p>
                <button
                  className="btn btn-danger rounded-pill px-4 fw-bold w-100 shadow-none"
                  onClick={() => setError("")}
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfissionalHorariosModal;
