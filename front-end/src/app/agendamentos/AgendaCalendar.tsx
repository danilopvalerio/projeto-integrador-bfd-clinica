"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import api from "../../utils/api";
import { AgendamentoCalendarDTO } from "./types";
import AppointmentCard from "./AppointmentCard";
import ConfirmMoveModal from "./ConfirmMoveModal";
import DayAppointmentsModal from "./DayAppointmentsModal";
import { getErrorMessage } from "../../utils/errorUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faEye,
  faExclamationCircle,
  faCheckCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  agendamentos: AgendamentoCalendarDTO[];
  startDate: string;
  onMoveSuccess: () => void;
  onSelectAgendamento: (id: string) => void;
  loading: boolean;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORARIOS = Array.from({ length: 19 }, (_, i) => i + 5); // 05:00 a 23:00
const HOUR_HEIGHT = 120; // Altura base (Acomoda aprox. 3 cards)

// --- TOAST ---
const ToastNotification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}) => (
  <div
    className={`position-fixed top-0 start-50 translate-middle-x mt-4 p-3 rounded-4 shadow d-flex align-items-center gap-3 animate-fade-in`}
    style={{
      zIndex: 1100,
      backgroundColor: type === "error" ? "#fdf2f2" : "#f0fdf4",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      minWidth: "300px",
    }}
  >
    <FontAwesomeIcon
      icon={type === "error" ? faExclamationCircle : faCheckCircle}
      className={type === "error" ? "text-danger" : "text-success"}
      size="lg"
    />
    <div className="flex-grow-1">
      <p
        className={`mb-0 fw-bold small ${type === "error" ? "text-danger" : "text-success"}`}
      >
        {message}
      </p>
    </div>
    <button
      type="button"
      className="btn-close small shadow-none"
      onClick={onClose}
    ></button>
  </div>
);

const AgendaCalendar: React.FC<Props> = ({
  agendamentos,
  startDate,
  onMoveSuccess,
  onSelectAgendamento,
  loading,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    id: string;
    newDate: string;
    newTime: string;
    agendamento: AgendamentoCalendarDTO;
  } | null>(null);

  // Refs para Sincronizar Scroll
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // UI States
  const [isSavingMove, setIsSavingMove] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);
  const [selectedDayForModal, setSelectedDayForModal] = useState<Date | null>(
    null,
  );

  // State para o dia expandido no Mobile
  const [mobileExpandedDay, setMobileExpandedDay] = useState<string | null>(
    null,
  );

  const [dropPreview, setDropPreview] = useState<{
    key: string;
    minutes: number;
    timeStr: string;
  } | null>(null);

  const [dragTooltip, setDragTooltip] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  // --- HELPER FUNCTIONS ---
  const getWeekDates = (startStr: string) => {
    const dates = [];
    const start = new Date(startStr);
    start.setHours(12, 0, 0, 0); // Evita problemas de fuso/horário de verão
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateISO = (date: Date) => date.toISOString().split("T")[0];
  const formatDisplayDate = (date: Date) =>
    `${date.getDate()}/${date.getMonth() + 1}`;

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // --- MEMOS & EFFECTS ---

  const weekDates = useMemo(() => getWeekDates(startDate), [startDate]);

  // CORREÇÃO: useEffect para atualizar a visualização mobile quando a semana muda
  useEffect(() => {
    const today = weekDates.find((d) => isToday(d));
    // Se hoje estiver na semana, expande hoje. Senão, expande o primeiro dia.
    setMobileExpandedDay(
      today ? formatDateISO(today) : formatDateISO(weekDates[0]),
    );
  }, [weekDates]);

  const appointmentsMap = useMemo(() => {
    const map = new Map<string, AgendamentoCalendarDTO[]>();
    agendamentos.forEach((ag) => {
      const datePart = ag.start.split("T")[0];
      const startHour = new Date(ag.start).getHours();
      const key = `${datePart}|${startHour}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(ag);
    });
    // Ordena por horário
    map.forEach((lista) => {
      lista.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
    });
    return map;
  }, [agendamentos]);

  // --- SCROLL SYNC ---
  const handleSyncScroll = (source: "top" | "table") => {
    if (!topScrollRef.current || !tableScrollRef.current) return;

    if (source === "top") {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const showToast = (msg: string, type: "error" | "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- DRAG & DROP LOGIC ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    const emptyImg = new Image();
    emptyImg.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    e.dataTransfer.setDragImage(emptyImg, 0, 0);
  };

  const calculateDropPosition = (e: React.DragEvent, baseHour: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, offsetY / rect.height));
    const minutesRaw = percentage * 60;
    const minutesRounded = Math.round(minutesRaw / 10) * 10;
    const finalMinutes = Math.min(50, minutesRounded);

    return {
      minutes: finalMinutes,
      timeStr: `${baseHour.toString().padStart(2, "0")}:${finalMinutes.toString().padStart(2, "0")}`,
    };
  };

  const handleDragOver = (
    e: React.DragEvent,
    dateStr: string,
    baseHour: number,
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const { minutes, timeStr } = calculateDropPosition(e, baseHour);
    setDragTooltip({ x: e.clientX, y: e.clientY, visible: true });
    setDropPreview({
      key: `${dateStr}|${baseHour}`,
      minutes: minutes,
      timeStr: timeStr,
    });
  };

  const handleDragLeave = () => {};

  const handleDrop = async (
    e: React.DragEvent,
    targetDate: string,
    baseHour: number,
  ) => {
    e.preventDefault();
    setDragTooltip((prev) => ({ ...prev, visible: false }));
    setDropPreview(null);

    if (!draggedId) return;

    const { timeStr } = calculateDropPosition(e, baseHour);
    const targetTime = timeStr;

    const agendamento = agendamentos.find(
      (a) => a.id_agendamento === draggedId,
    );
    if (!agendamento) return;

    const originalDate = agendamento.start.split("T")[0];
    const originalTime = new Date(agendamento.start).toLocaleTimeString(
      "pt-BR",
      { hour: "2-digit", minute: "2-digit" },
    );

    if (originalDate === targetDate && targetTime === originalTime) {
      setDraggedId(null);
      return;
    }

    setPendingMove({
      id: draggedId,
      newDate: targetDate,
      newTime: targetTime,
      agendamento,
    });
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDragTooltip((prev) => ({ ...prev, visible: false }));
    setDropPreview(null);
    setDraggedId(null);
  };

  // --- ACTIONS ---
  const confirmMove = async () => {
    if (!pendingMove) return;
    setIsSavingMove(true);
    try {
      const { agendamento, newDate, newTime } = pendingMove;
      const oldStart = new Date(agendamento.start).getTime();
      const oldEnd = new Date(agendamento.end).getTime();
      const duration = oldEnd - oldStart;

      const newStartISO = `${newDate}T${newTime}:00`;
      const newStartDate = new Date(newStartISO);
      const newEndDate = new Date(newStartDate.getTime() + duration);

      await api.patch(`/agendamentos/${agendamento.id_agendamento}`, {
        data_hora_inicio: newStartDate.toISOString(),
        data_hora_fim: newEndDate.toISOString(),
      });

      onMoveSuccess();
      showToast("Agendamento reagendado!", "success");
    } catch (err) {
      showToast("Erro: " + getErrorMessage(err), "error");
    } finally {
      setIsSavingMove(false);
      setPendingMove(null);
    }
  };

  const handleSelectFromDayModal = (id: string) => {
    setSelectedDayForModal(null);
    setTimeout(() => onSelectAgendamento(id), 50);
  };

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = formatDateISO(date);
    return agendamentos.filter((ag) => ag.start.startsWith(dateStr));
  };

  return (
    <>
      {toast && (
        <ToastNotification
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ESTILOS GLOBAIS DE SCROLLBAR */}
      <style jsx global>{`
        /* Scrollbar Personalizada e VISÍVEL */
        .visible-scrollbar::-webkit-scrollbar {
          height: 14px; /* Mais grossa horizontalmente */
          width: 8px; /* Vertical (nos cards) */
        }
        .visible-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }
        .visible-scrollbar::-webkit-scrollbar-thumb {
          background-color: #94a3b8; /* Cinza médio para visibilidade */
          border-radius: 6px;
          border: 3px solid #f1f5f9; /* Borda para efeito flutuante */
        }
        .visible-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #64748b; /* Mais escuro no hover */
        }

        /* Classes auxiliares */
        .header-day-hover:hover {
          filter: brightness(0.95);
          cursor: pointer;
        }
        .hour-grid-bg {
          background-image: linear-gradient(
            to bottom,
            #f8f9fa 1px,
            transparent 1px
          );
          background-size: 100% 33.33%;
        }
      `}</style>

      {/* --- DRAG TOOLTIP --- */}
      {dragTooltip.visible && dropPreview && (
        <div
          style={{
            position: "fixed",
            left: dragTooltip.x + 20,
            top: dragTooltip.y + 20,
            zIndex: 9999,
            pointerEvents: "none",
            backgroundColor: "rgba(33, 37, 41, 0.9)",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.8rem",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FontAwesomeIcon icon={faClock} className="text-warning" />
          <span>{dropPreview.timeStr}</span>
        </div>
      )}

      {/* DESKTOP */}
      <div className="d-none d-lg-block">
        {/* BARRA DE SCROLL SUPERIOR (Fake - Sincronizada) */}
        <div
          ref={topScrollRef}
          className="visible-scrollbar mb-2 overflow-auto"
          style={{ width: "100%" }}
          onScroll={() => handleSyncScroll("top")}
        >
          {/* Div interna para forçar a largura e gerar scroll (1600px para colunas largas) */}
          <div style={{ width: "1600px", height: "1px" }}></div>
        </div>

        {/* CONTAINER DA TABELA */}
        <div
          className="bg-white rounded-4 shadow-sm overflow-hidden"
          style={{ width: "100%" }}
        >
          {/* Scroll real da tabela (escondido ou sincronizado, mas funcional) */}
          <div
            ref={tableScrollRef}
            className="overflow-auto visible-scrollbar"
            onScroll={() => handleSyncScroll("table")}
          >
            <div style={{ minWidth: "1600px" }}>
              {/* Header */}
              <div
                className="d-grid sticky-top bg-white"
                style={{
                  gridTemplateColumns: "80px repeat(7, 1fr)",
                  zIndex: 20,
                }}
              >
                <div className="bg-gradient-vl text-white p-3 border-end border-white border-opacity-25 fw-bold text-center rounded-tl-4">
                  Horário
                </div>
                {weekDates.map((date) => (
                  <div
                    key={date.toString()}
                    className={`text-white p-3 border-end border-white border-opacity-25 text-center header-day-hover position-relative group ${
                      isToday(date)
                        ? "bg-warning bg-gradient text-dark"
                        : "bg-gradient-vl"
                    }`}
                    onClick={() => setSelectedDayForModal(date)}
                  >
                    <div
                      className="fw-bold text-uppercase"
                      style={{ fontSize: "0.8rem" }}
                    >
                      {DIAS_SEMANA[date.getDay()]}
                    </div>
                    <div className="fs-5 fw-bold">
                      {formatDisplayDate(date).split("/")[0]}
                    </div>
                    <div className="position-absolute top-0 end-0 p-1 opacity-50 small">
                      <FontAwesomeIcon icon={faEye} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Corpo da Tabela */}
              <div className="position-relative">
                {loading && (
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-50 d-flex justify-content-center align-items-center"
                    style={{ zIndex: 10 }}
                  >
                    <div className="spinner-border text-secondary"></div>
                  </div>
                )}

                {HORARIOS.map((hour) => {
                  const hourStr = `${hour.toString().padStart(2, "0")}:00`;
                  return (
                    <div
                      key={hour}
                      className="d-grid border-bottom"
                      style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
                    >
                      <div
                        className="bg-light border-end text-center fw-bold text-secondary small pt-2"
                        style={{ minHeight: `${HOUR_HEIGHT}px` }}
                      >
                        {hourStr}
                      </div>

                      {weekDates.map((date) => {
                        const dateStr = formatDateISO(date);
                        const key = `${dateStr}|${hour}`;
                        const cellApps = appointmentsMap.get(key) || [];
                        const isHovering =
                          dropPreview && dropPreview.key === key;

                        return (
                          <div
                            key={key}
                            className={`border-end p-1 position-relative hour-grid-bg ${isToday(date) ? "bg-light bg-opacity-25" : ""}`}
                            style={{
                              minHeight: `${HOUR_HEIGHT}px`,
                              zIndex: 1,
                            }}
                            onDragOver={(e) => handleDragOver(e, dateStr, hour)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, dateStr, hour)}
                            onDragEnd={handleDragEnd}
                          >
                            {isHovering && (
                              <div
                                className="position-absolute rounded-3 fade-in"
                                style={{
                                  top: `${(dropPreview.minutes / 60) * 100}%`,
                                  left: "4px",
                                  right: "4px",
                                  height: "94px",
                                  backgroundColor: "rgba(13, 110, 253, 0.1)",
                                  border: "2px dashed rgba(13, 110, 253, 0.4)",
                                  zIndex: 5,
                                  pointerEvents: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <span className="badge bg-primary bg-opacity-75 text-white">
                                  {dropPreview.timeStr}
                                </span>
                              </div>
                            )}

                            {/* LISTA DE CARDS (Vertical com Scroll Interno) */}
                            <div
                              className="visible-scrollbar w-100 d-flex flex-column gap-1 position-relative p-1"
                              style={{
                                maxHeight: `${HOUR_HEIGHT}px`, // Limita altura
                                overflowY: "auto", // Scroll vertical se passar de 3 cards
                                overflowX: "hidden", // Sem scroll horizontal
                                zIndex: 10,
                              }}
                            >
                              {cellApps.map((ag) => (
                                <AppointmentCard
                                  key={ag.id_agendamento}
                                  data={ag}
                                  onDragStart={(e) =>
                                    handleDragStart(e, ag.id_agendamento)
                                  }
                                  onClick={() =>
                                    onSelectAgendamento(ag.id_agendamento)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <div className="d-lg-none d-flex flex-column gap-3">
        {!loading &&
          weekDates.map((date) => {
            const dateStr = formatDateISO(date);
            const isExpanded = mobileExpandedDay === dateStr;
            const isDateToday = isToday(date);
            const dayAppointments = agendamentos
              .filter((ag) => ag.start.startsWith(dateStr))
              .sort(
                (a, b) =>
                  new Date(a.start).getTime() - new Date(b.start).getTime(),
              );

            return (
              <div
                key={dateStr}
                className={`bg-white rounded-4 shadow-sm overflow-hidden border ${isDateToday ? "border-warning" : "border-light"}`}
              >
                <div
                  className={`p-3 d-flex justify-content-between align-items-center cursor-pointer ${isDateToday ? "bg-warning bg-opacity-10" : "bg-light"}`}
                  onClick={() =>
                    setMobileExpandedDay(isExpanded ? null : dateStr)
                  }
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-white ${isDateToday ? "bg-warning text-dark" : "bg-secondary"}`}
                      style={{ width: 40, height: 40 }}
                    >
                      {date.getDate()}
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">
                        {DIAS_SEMANA[date.getDay()]}{" "}
                        {isDateToday && (
                          <span className="ms-2 badge bg-warning text-dark small">
                            Hoje
                          </span>
                        )}
                      </h6>
                      <small className="text-muted">
                        {dayAppointments.length} agendamentos
                      </small>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={isExpanded ? faChevronUp : faChevronDown}
                    className="text-secondary"
                  />
                </div>
                {isExpanded && (
                  <div className="p-3 bg-white border-top animate-fade-in">
                    {dayAppointments.length > 0 ? (
                      <div className="d-flex flex-column gap-2">
                        {dayAppointments.map((ag) => (
                          <AppointmentCard
                            key={ag.id_agendamento}
                            data={ag}
                            onDragStart={() => {}}
                            onClick={() =>
                              onSelectAgendamento(ag.id_agendamento)
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted small">
                        Agenda livre
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {pendingMove && (
        <ConfirmMoveModal
          isOpen={!!pendingMove}
          onClose={() => setPendingMove(null)}
          onConfirm={confirmMove}
          oldDate={new Date(pendingMove.agendamento.start)}
          newDate={new Date(`${pendingMove.newDate}T${pendingMove.newTime}:00`)}
          loading={isSavingMove}
        />
      )}

      {selectedDayForModal && (
        <DayAppointmentsModal
          date={selectedDayForModal}
          appointments={getAppointmentsForDay(selectedDayForModal)}
          onClose={() => setSelectedDayForModal(null)}
          onSelectAgendamento={handleSelectFromDayModal}
        />
      )}
    </>
  );
};

export default AgendaCalendar;
