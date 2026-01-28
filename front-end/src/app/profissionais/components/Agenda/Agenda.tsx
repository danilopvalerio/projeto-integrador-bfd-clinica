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
  // Data base arbitrária para calcular apenas a hora/minuto
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

  processingIds: string[]; // IDs que estão carregando (optimistic UI)

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
    processingIds,
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
          // Se estiver movendo este evento, não renderiza o original (mostra o Ghost)
          if (movingState?.eventId === ev.id_horario) return null;

          const isResizingThis = resizingState?.eventId === ev.id_horario;
          let tempEndTime = null;

          // Se estiver redimensionando, calcula o tempo final visual
          if (isResizingThis && resizingState) {
            tempEndTime = isoFromDayAndTime(
              dayIndex,
              minutesToHHMM(resizingState.newEndMinutes),
            );
          }

          const isProcessing = processingIds.includes(ev.id_horario);

          return (
            <ScheduleEventCard
              key={ev.id_horario}
              event={ev}
              pixelsPorHora={PIXELS_POR_HORA}
              tempEndTime={tempEndTime}
              isProcessing={isProcessing} // Passamos o estado de loading
              onEdit={onEdit}
              onDelete={onDelete}
              onResizeStart={onResizeStart}
              onMoveStart={onMoveStart}
            />
          );
        })}

        {/* Ghost Create (Visual enquanto arrasta para criar) */}
        {isCreatingHere && dragCurrentMinutes !== null && dragStart && (
          <div
            className="position-absolute rounded-1 bg-success bg-opacity-50 border border-success pe-none shadow-sm d-flex flex-column justify-content-center overflow-hidden px-2"
            style={{
              top: `${
                (Math.min(dragStart.minutes, dragCurrentMinutes) / 60) *
                PIXELS_POR_HORA
              }px`,
              height: `${
                (Math.abs(dragCurrentMinutes - dragStart.minutes) / 60) *
                PIXELS_POR_HORA
              }px`,
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

        {/* Ghost Moving (Visual enquanto arrasta para mover) */}
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
  const [saving, setSaving] = useState(false); // Global saving (para manual/delete)
  const [error, setError] = useState("");
  const [horarios, setHorarios] = useState<HorarioEntity[]>([]);

  // Estado para controlar quais eventos estão salvando individualmente (spinner no card)
  const [processingIds, setProcessingIds] = useState<string[]>([]);

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

  // Demais states (Confirmation, ManualForm)...
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

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
    // Evita loading full screen se for apenas um refresh
    if (horarios.length === 0) setLoading(true);
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
  }, [profissionalId, horarios.length]);

  useEffect(() => {
    fetchHorarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Mantemos vazio para executar apenas no mount

  // --- ACTIONS ---

  const executeDelete = useCallback(
    async (id_horario: string) => {
      setSaving(true);
      try {
        await api.delete(`/professionals/horarios/${id_horario}`);
        setHorarios((prev) => prev.filter((h) => h.id_horario !== id_horario));
        onSuccess();
      } catch (err) {
        setError(getErrorMessage(err));
        // Se falhar, recarrega
        fetchHorarios();
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
    [executeDelete],
  );

  const handleSaveManual = async (data: {
    dia: number;
    inicio: string;
    fim: string;
  }) => {
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

  // --- DRAG HANDLERS OPTIMISTIC ---

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
    // 1. Snapshot dos dados
    const currentDragStart = dragStart;
    const currentDragMinutes = dragCurrentMinutes;

    // 2. LIMPEZA IMEDIATA DO ESTADO (Destrava o mouse)
    setIsDragging(false);
    setDragStart(null);
    setDragCurrentMinutes(null);

    if (!currentDragStart || currentDragMinutes === null) return;

    const min = Math.min(currentDragStart.minutes, currentDragMinutes);
    const max = Math.max(currentDragStart.minutes, currentDragMinutes);
    if (min === max) return;

    // 3. UI Otimista: Cria evento temporário
    const tempId = `temp-${Date.now()}`;
    const newEvent: HorarioEntity = {
      id_horario: tempId,
      id_profissional: profissionalId,
      dia_semana: currentDragStart.dayIndex,
      hora_inicio: isoFromDayAndTime(
        currentDragStart.dayIndex,
        minutesToHHMM(min),
      ),
      hora_fim: isoFromDayAndTime(
        currentDragStart.dayIndex,
        minutesToHHMM(max),
      ),
      // Removidos campos criado_em/atualizado_em
    };

    setHorarios((prev) => [...prev, newEvent]);
    setProcessingIds((prev) => [...prev, tempId]); // Ativa spinner neste card

    // 4. Chamada API
    try {
      await api.post(`/professionals/${profissionalId}/horarios`, {
        dia_semana: newEvent.dia_semana,
        hora_inicio: newEvent.hora_inicio,
        hora_fim: newEvent.hora_fim,
      });
      // Sucesso: Sincroniza ID real
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      // Erro: Rollback (remove o temporário)
      setHorarios((prev) => prev.filter((h) => h.id_horario !== tempId));
      setError(getErrorMessage(err));
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== tempId));
    }
  }, [dragStart, dragCurrentMinutes, profissionalId, fetchHorarios, onSuccess]);

  const handleResizeStart = useCallback(
    (ev: HorarioEntity) => {
      if (saving || loading || processingIds.includes(ev.id_horario)) return;
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
    [saving, loading, processingIds],
  );

  const handleSaveResize = useCallback(async () => {
    // 1. Snapshot
    const state = resizingState;

    // 2. LIMPEZA IMEDIATA
    setResizingState(null);

    if (!state) return;
    if (state.newEndMinutes === state.originalEndMinutes) return;
    if (state.newEndMinutes <= state.startMinutes) return;

    const previousHorarios = [...horarios]; // Backup

    // 3. UI Otimista
    setHorarios((prev) =>
      prev.map((h) =>
        h.id_horario === state.eventId
          ? {
              ...h,
              hora_fim: isoFromDayAndTime(
                state.dayIndex,
                minutesToHHMM(state.newEndMinutes),
              ),
            }
          : h,
      ),
    );
    setProcessingIds((prev) => [...prev, state.eventId]);

    // 4. API Call
    try {
      await api.patch(`/professionals/horarios/${state.eventId}`, {
        dia_semana: state.dayIndex,
        hora_inicio: isoFromDayAndTime(
          state.dayIndex,
          minutesToHHMM(state.startMinutes),
        ),
        hora_fim: isoFromDayAndTime(
          state.dayIndex,
          minutesToHHMM(state.newEndMinutes),
        ),
      });
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      // Rollback
      setHorarios(previousHorarios);
      setError(getErrorMessage(err));
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== state.eventId));
    }
  }, [resizingState, horarios, fetchHorarios, onSuccess]);

  const handleMoveStart = useCallback(
    (ev: HorarioEntity) => {
      if (saving || loading || processingIds.includes(ev.id_horario)) return;
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
    [saving, loading, processingIds],
  );

  const handleSaveMove = useCallback(async () => {
    // 1. Snapshot
    const state = movingState;

    // 2. LIMPEZA IMEDIATA
    setMovingState(null);

    if (!state) return;
    if (
      state.newDayIndex === state.originalDayIndex &&
      state.newStartMinutes === state.originalStartMinutes
    )
      return;

    const previousHorarios = [...horarios]; // Backup

    // 3. UI Otimista
    setHorarios((prev) =>
      prev.map((h) =>
        h.id_horario === state.eventId
          ? {
              ...h,
              dia_semana: state.newDayIndex,
              hora_inicio: isoFromDayAndTime(
                state.newDayIndex,
                minutesToHHMM(state.newStartMinutes),
              ),
              hora_fim: isoFromDayAndTime(
                state.newDayIndex,
                minutesToHHMM(state.newStartMinutes + state.duration),
              ),
            }
          : h,
      ),
    );
    setProcessingIds((prev) => [...prev, state.eventId]);

    // 4. API Call
    try {
      await api.patch(`/professionals/horarios/${state.eventId}`, {
        dia_semana: state.newDayIndex,
        hora_inicio: isoFromDayAndTime(
          state.newDayIndex,
          minutesToHHMM(state.newStartMinutes),
        ),
        hora_fim: isoFromDayAndTime(
          state.newDayIndex,
          minutesToHHMM(state.newStartMinutes + state.duration),
        ),
      });
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      // Rollback
      setHorarios(previousHorarios);
      setError(getErrorMessage(err));
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== state.eventId));
    }
  }, [movingState, horarios, fetchHorarios, onSuccess]);

  const handleMouseMove = useCallback(
    (dayIndex: number, e: React.MouseEvent) => {
      // Não faz nada se não estiver em modo de interação
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
    // Dispara a função de salvar correspondente ao estado atual
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
                  disabled={!!error || saving}
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
              // Segurança: Se o mouse sair do container enquanto arrasta, cancela ou finaliza
              onMouseLeave={() => {
                if (isDragging) handleSaveCreateDrag();
                if (movingState) handleSaveMove();
                if (resizingState) handleSaveResize();
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
                    processingIds={processingIds} // PASSADO PROPS NOVO
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

      {/* --- ERROR MODAL --- */}
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
