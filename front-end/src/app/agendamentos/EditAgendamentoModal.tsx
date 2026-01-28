"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  StatusAgendamento,
  AgendamentoDetailDTO,
  UpdateAgendamentoPayload,
  ServicoSummary,
  ProfissionalSummary,
} from "./types";
import ServiceSelector from "./ServiceSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faTimes,
  faSave,
  faUser,
  faUserMd,
  faExclamationTriangle,
  faCheckCircle,
  faCalendarAlt,
  faClock,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  agendamentoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAgendamentoModal = ({ agendamentoId, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(true);

  // Estados de Loading das ações
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false); // <--- ESTADO USADO AQUI

  // Feedback
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const modalBodyRef = useRef<HTMLDivElement>(null);

  const [originalData, setOriginalData] = useState<AgendamentoDetailDTO | null>(
    null,
  );
  const [profissionaisList, setProfissionaisList] = useState<
    ProfissionalSummary[]
  >([]);

  // Form States
  const [status, setStatus] = useState<StatusAgendamento>(
    StatusAgendamento.PENDENTE,
  );
  const [obs, setObs] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServicoSummary[]>(
    [],
  );
  const [idProfissional, setIdProfissional] = useState("");

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const toInputFormat = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAgendamento, resProfissionais] = await Promise.all([
          api.get(`/agendamentos/${agendamentoId}`),
          api.get("/professionals/paginated?limit=100"),
        ]);

        const ag = resAgendamento.data;
        setOriginalData(ag);
        setStatus(ag.status);
        setObs(ag.observacoes || "");
        setStart(toInputFormat(ag.start));
        setEnd(toInputFormat(ag.end));
        setIdProfissional(ag.profissional.id_profissional);

        if (ag.servico && Array.isArray(ag.servico.itens)) {
          setSelectedServices(ag.servico.itens);
        } else {
          setSelectedServices([]);
        }

        setProfissionaisList(resProfissionais.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (agendamentoId) fetchData();
  }, [agendamentoId]);

  const scrollToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleToggleService = (id: string, serviceObj: ServicoSummary) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id_servico === id);
      if (exists) return prev.filter((s) => s.id_servico !== id);
      return [...prev, serviceObj];
    });
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: UpdateAgendamentoPayload = {
        status,
        observacoes: obs,
        ids_servicos: selectedServices.map((s) => s.id_servico),
        data_hora_inicio: new Date(start).toISOString(),
        data_hora_fim: end ? new Date(end).toISOString() : undefined,
        id_profissional: idProfissional,
      };

      await api.patch(`/agendamentos/${agendamentoId}`, payload);
      setSuccessMsg("Agendamento atualizado com sucesso!");
      scrollToTop();
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
      scrollToTop();
      setSaving(false);
    }
  };

  // --- USO DO DELETING AQUI ---
  const handleDelete = async () => {
    setDeleting(true); // 1. Ativa o loading
    setError("");

    try {
      await api.delete(`/agendamentos/${agendamentoId}`);
      onSuccess(); // Sucesso fecha o modal
    } catch (err) {
      // Se der erro:
      setError(getErrorMessage(err));
      setDeleting(false); // 2. Desativa o loading
      setShowConfirmDelete(false); // Fecha o modal de confirmação para mostrar o erro no modal principal
      scrollToTop();
    }
  };

  if (loading) {
    return (
      <div
        className="modal-backdrop d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.05)", zIndex: 1060 }}
        onMouseDown={onClose}
      >
        <div className="bg-white rounded-4 shadow p-3">Carregando...</div>
      </div>
    );
  }

  if (!originalData) return null;

  return (
    <>
      <div
        className="modal-backdrop d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onMouseDown={onClose}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: "600px", width: "95%" }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow rounded-4 bg-white overflow-hidden">
            <div
              className="modal-header border-bottom-0 p-3 px-4 text-white d-flex justify-content-between align-items-center"
              style={{ background: originalData.ui?.color || "#333" }}
            >
              <h5
                className="modal-title fw-bold mb-0"
                style={{ fontSize: "1.1rem" }}
              >
                Editar Agendamento
              </h5>
              <button
                type="button"
                className="btn btn-link text-white p-0 shadow-none"
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div
              ref={modalBodyRef}
              className="modal-body p-4 custom-scroll"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              {successMsg && (
                <div className="alert alert-success rounded-3 py-2 px-3 small mb-3">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="alert alert-danger rounded-3 py-2 px-3 small mb-3">
                  {error}
                </div>
              )}

              {/* Paciente / Profissional */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Paciente
                  </label>
                  <div className="bg-light p-2 rounded border d-flex align-items-center gap-2">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-secondary ms-1"
                    />
                    <span className="fw-bold text-dark small text-truncate">
                      {originalData.paciente.nome}
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Profissional
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-success">
                      <FontAwesomeIcon icon={faUserMd} />
                    </span>
                    <select
                      className="form-select border-start-0 shadow-none"
                      value={idProfissional}
                      onChange={(e) => setIdProfissional(e.target.value)}
                    >
                      {profissionaisList.map((p) => (
                        <option
                          key={p.id_profissional}
                          value={p.id_profissional}
                        >
                          {p.usuario?.nome || "Sem Nome"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />{" "}
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm shadow-none rounded-3"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">
                    <FontAwesomeIcon icon={faClock} className="me-1" /> Fim
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm shadow-none rounded-3"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Serviços */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <label className="form-label fw-bold small text-secondary mb-0">
                    Serviços Selecionados
                  </label>
                  <span className="badge bg-light text-dark border">
                    Total: R${" "}
                    {selectedServices
                      .reduce((acc, s) => acc + (s.preco || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="border rounded p-2 bg-light mb-2">
                  {selectedServices.length > 0 ? (
                    <ul className="list-group list-group-flush bg-transparent">
                      {selectedServices.map((s) => (
                        <li
                          key={s.id_servico}
                          className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-2 py-1 border-bottom-0"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon
                              icon={faTag}
                              className="text-secondary small"
                            />
                            <span className="small fw-bold">{s.nome}</span>
                            <span
                              className="badge bg-secondary bg-opacity-10 text-secondary"
                              style={{ fontSize: "0.7rem" }}
                            >
                              R$ {s.preco}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleService(s.id_servico, s)}
                            className="btn btn-sm text-danger shadow-none p-1"
                            title="Remover"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-muted small py-3">
                      Nenhum serviço adicionado.
                    </div>
                  )}
                </div>
                <ServiceSelector
                  selectedIds={selectedServices.map((s) => s.id_servico)}
                  onToggle={handleToggleService}
                />
              </div>

              {/* Status / Obs */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-secondary">
                    Status
                  </label>
                  <select
                    className="form-select form-select-sm rounded-pill shadow-none fw-bold"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as StatusAgendamento)
                    }
                  >
                    {Object.values(StatusAgendamento).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-bold small text-secondary">
                    Observações
                  </label>
                  <textarea
                    className="form-control form-control-sm shadow-none rounded-3"
                    style={{ resize: "none" }}
                    rows={1}
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                <button
                  className="btn btn-link text-danger text-decoration-none p-0 d-flex align-items-center gap-1 shadow-none small"
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="fw-bold">Excluir</span>
                </button>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light rounded-pill px-3 fw-bold text-secondary shadow-none border"
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button-dark-grey px-4 rounded-pill fw-bold shadow-none text-white d-flex align-items-center gap-2"
                    onClick={handleUpdate}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <FontAwesomeIcon icon={faSave} />
                    )}
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL DE CONFIRMAÇÃO COM DELETING --- */}
      {showConfirmDelete && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1070 }}
        >
          <div
            className="bg-white rounded-4 shadow p-4 text-center"
            style={{ maxWidth: "350px" }}
          >
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              size="2x"
              className="text-warning mb-2"
            />
            <h6 className="fw-bold mb-3">Excluir Agendamento?</h6>
            <div className="d-flex gap-2 justify-content-center">
              {/* 3. Bloqueia o botão voltar */}
              <button
                className="btn btn-light btn-sm rounded-pill px-3"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
              >
                Voltar
              </button>

              {/* 4. Bloqueia o botão confirmar e mostra Spinner */}
              <button
                className="btn btn-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    ></span>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditAgendamentoModal;
