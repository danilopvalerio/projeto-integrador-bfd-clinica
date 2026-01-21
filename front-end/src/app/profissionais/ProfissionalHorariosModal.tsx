"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faPlus,
  faTrash,
  faSave,
  faPen,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";

type HorarioEntity = {
  id_horario: string;
  id_profissional: string;
  dia_semana: number; // 0..6
  hora_inicio: string; // ISO string
  hora_fim: string; // ISO string
};

interface Props {
  profissionalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const diasSemanaLabel: Record<number, string> = {
  0: "Domingo",
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
};

function timeFromISO(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function isoFromDayAndTime(dia_semana: number, timeHHMM: string) {
  const base = new Date("2026-01-04T00:00:00.000Z"); // Domingo
  const [hh, mm] = timeHHMM.split(":").map((x) => Number(x));

  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + dia_semana);
  d.setUTCHours(hh, mm, 0, 0);

  return d.toISOString();
}

const ProfissionalHorariosModal = ({ profissionalId, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [horarios, setHorarios] = useState<HorarioEntity[]>([]);

  // create form
  const [diaSemana, setDiaSemana] = useState<number>(1);
  const [horaInicio, setHoraInicio] = useState<string>("08:00");
  const [horaFim, setHoraFim] = useState<string>("12:00");

  // edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDiaSemana, setEditDiaSemana] = useState<number>(1);
  const [editHoraInicio, setEditHoraInicio] = useState<string>("08:00");
  const [editHoraFim, setEditHoraFim] = useState<string>("12:00");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const fetchHorarios = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/professionals/${profissionalId}/horarios`);
      setHorarios(response.data as HorarioEntity[]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
   
  }, [profissionalId]);

  const sortedHorarios = useMemo(() => {
    return [...horarios].sort((a, b) => {
      if (a.dia_semana !== b.dia_semana) return a.dia_semana - b.dia_semana;
      return timeFromISO(a.hora_inicio).localeCompare(timeFromISO(b.hora_inicio));
    });
  }, [horarios]);

  const handleCreate = async () => {
    setSaving(true);
    setError("");

    try {
      if (!horaInicio || !horaFim) throw new Error("Informe hora início e fim.");

      await api.post(`/professionals/${profissionalId}/horarios`, {
        dia_semana: diaSemana,
        hora_inicio: isoFromDayAndTime(diaSemana, horaInicio),
        hora_fim: isoFromDayAndTime(diaSemana, horaFim),
      });

      await fetchHorarios();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (h: HorarioEntity) => {
    setEditingId(h.id_horario);
    setEditDiaSemana(h.dia_semana);
    setEditHoraInicio(timeFromISO(h.hora_inicio));
    setEditHoraFim(timeFromISO(h.hora_fim));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    setSaving(true);
    setError("");

    try {
      await api.patch(`/professionals/horarios/${editingId}`, {
        dia_semana: editDiaSemana,
        hora_inicio: isoFromDayAndTime(editDiaSemana, editHoraInicio),
        hora_fim: isoFromDayAndTime(editDiaSemana, editHoraFim),
      });

      setEditingId(null);
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id_horario: string) => {
    const ok = confirm("Excluir este horário?");
    if (!ok) return;

    setSaving(true);
    setError("");

    try {
      await api.delete(`/professionals/horarios/${id_horario}`);
      await fetchHorarios();
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onMouseDown={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        role="document"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 rounded-4 shadow">
          {/* Header */}
          <div className="modal-header bg-gradient-vl text-white rounded-top-4 d-flex justify-content-between align-items-center px-4 py-3">
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faCalendarDays} />
              <div>
                <h5 className="modal-title fw-bold mb-0">Horários do Profissional</h5>
                <small className="opacity-75">Gerencie dias e horários de atendimento</small>
              </div>
            </div>

            <button className="btn btn-link text-white" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3">
                {error}
              </div>
            )}

            {/* Create */}
            <div className="bg-white border rounded-4 p-4 shadow-sm mb-4">
              <h6 className="fw-bold mb-3">Adicionar horário</h6>

              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Dia da semana</label>
                  <select
                    className="form-select rounded-pill"
                    value={diaSemana}
                    onChange={(e) => setDiaSemana(Number(e.target.value))}
                  >
                    {Object.entries(diasSemanaLabel).map(([k, v]) => (
                      <option key={k} value={Number(k)}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Hora início</label>
                  <input
                    className="form-control rounded-pill"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-bold">Hora fim</label>
                  <input
                    className="form-control rounded-pill"
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                  />
                </div>

                <div className="col-12 d-flex justify-content-end">
                  <button
                    className="button-dark-grey btn btn-sm rounded-pill px-4 fw-bold shadow-sm"
                    onClick={handleCreate}
                    disabled={saving}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    {saving ? "Salvando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            </div>

            {/* List */}
            <div className="bg-white border rounded-4 p-4 shadow-sm">
              <h6 className="fw-bold mb-3">Horários cadastrados</h6>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-secondary spinner-border-sm" />
                  <p className="text-muted small mt-2 mb-0">Carregando horários...</p>
                </div>
              ) : sortedHorarios.length ? (
                <div className="list-group">
                  {sortedHorarios.map((h) => {
                    const isEditing = editingId === h.id_horario;

                    return (
                      <div key={h.id_horario} className="list-group-item rounded-3 mb-2">
                        {!isEditing ? (
                          <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                              <div className="fw-bold">
                                {diasSemanaLabel[h.dia_semana]} • {timeFromISO(h.hora_inicio)} -{" "}
                                {timeFromISO(h.hora_fim)}
                              </div>
                            </div>

                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                                onClick={() => startEdit(h)}
                                disabled={saving}
                              >
                                <FontAwesomeIcon icon={faPen} className="me-2" />
                                Editar
                              </button>

                              <button
                                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                                onClick={() => handleDelete(h.id_horario)}
                                disabled={saving}
                              >
                                <FontAwesomeIcon icon={faTrash} className="me-2" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="row g-3 align-items-end">
                            <div className="col-md-4">
                              <label className="form-label fw-bold">Dia</label>
                              <select
                                className="form-select rounded-pill"
                                value={editDiaSemana}
                                onChange={(e) => setEditDiaSemana(Number(e.target.value))}
                              >
                                {Object.entries(diasSemanaLabel).map(([k, v]) => (
                                  <option key={k} value={Number(k)}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-md-3">
                              <label className="form-label fw-bold">Início</label>
                              <input
                                className="form-control rounded-pill"
                                type="time"
                                value={editHoraInicio}
                                onChange={(e) => setEditHoraInicio(e.target.value)}
                              />
                            </div>

                            <div className="col-md-3">
                              <label className="form-label fw-bold">Fim</label>
                              <input
                                className="form-control rounded-pill"
                                type="time"
                                value={editHoraFim}
                                onChange={(e) => setEditHoraFim(e.target.value)}
                              />
                            </div>

                            <div className="col-md-2 d-flex gap-2 justify-content-end">
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold"
                                onClick={cancelEdit}
                                disabled={saving}
                              >
                                Cancelar
                              </button>

                              <button
                                className="button-dark-grey btn btn-sm rounded-pill px-3 fw-bold shadow-sm"
                                onClick={handleUpdate}
                                disabled={saving}
                              >
                                <FontAwesomeIcon icon={faSave} className="me-2" />
                                Salvar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted small py-3 fst-italic">
                  Nenhum horário cadastrado.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 p-4 pt-0">
            <button
              className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfissionalHorariosModal;
