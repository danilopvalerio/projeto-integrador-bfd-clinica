"use client";

import { useState, useEffect } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  agendamentoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAgendamentoModal = ({ agendamentoId, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [originalData, setOriginalData] = useState<AgendamentoDetailDTO | null>(
    null,
  );

  // Lista para o Select
  const [profissionaisList, setProfissionaisList] = useState<
    ProfissionalSummary[]
  >([]);

  // Estados de edição
  const [status, setStatus] = useState<StatusAgendamento>(
    StatusAgendamento.PENDENTE,
  );
  const [obs, setObs] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServicoSummary[]>(
    [],
  );

  // Estado do Profissional (Editável via Select)
  const [idProfissional, setIdProfissional] = useState("");

  // Modal de confirmação
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toInputFormat = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carrega detalhes do agendamento E lista de profissionais para o select
        const [resAgendamento, resProfissionais] = await Promise.all([
          api.get(`/agendamentos/${agendamentoId}`),
          api.get("/professionals/paginated?limit=100"), // Traz os 100 primeiros para o select
        ]);

        const ag: AgendamentoDetailDTO = resAgendamento.data;

        setOriginalData(ag);
        setStatus(ag.status);
        setObs(ag.observacoes || "");
        setStart(toInputFormat(ag.start));
        setEnd(toInputFormat(ag.end));
        setSelectedServices(ag.servicos || []);

        // Inicializa o select com o profissional atual
        setIdProfissional(ag.profissional.id_profissional);

        // Popula lista
        setProfissionaisList(resProfissionais.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (agendamentoId) fetchData();
  }, [agendamentoId]);

  const handleToggleService = (id: string, serviceObj: ServicoSummary) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id_servico === id);
      if (exists) return prev.filter((s) => s.id_servico !== id);
      return [...prev, serviceObj];
    });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const payload: UpdateAgendamentoPayload = {
        status,
        observacoes: obs,
        ids_servicos: selectedServices.map((s) => s.id_servico),
        data_hora_inicio: new Date(start).toISOString(),
        data_hora_fim: end ? new Date(end).toISOString() : undefined,
        id_profissional: idProfissional, // Envia o novo ID se mudou
      };

      await api.patch(`/agendamentos/${agendamentoId}`, payload);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/agendamentos/${agendamentoId}`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  // --- SKELETON LOADING ---
  if (loading) {
    return (
      <div
        className="modal-backdrop d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: "500px", width: "100%", margin: "0.5rem" }}
        >
          <div className="modal-content border-0 shadow rounded-4 overflow-hidden p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="spinner-border spinner-border-sm text-secondary me-2"></div>
              <span className="text-muted small">Carregando detalhes...</span>
            </div>
            <div
              className="bg-light rounded-3"
              style={{ height: 100, width: "100%" }}
            ></div>
          </div>
        </div>
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
            {/* Header */}
            <div
              className="modal-header border-bottom-0 p-3 px-4 text-white d-flex justify-content-between align-items-center"
              style={{ background: originalData.ui.color }}
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
                style={{ boxShadow: "none" }}
                onClick={onClose}
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
            </div>

            <div
              className="modal-body p-4 custom-scroll"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              {error && (
                <div className="alert alert-danger rounded-3 py-2 px-3 small mb-3">
                  {error}
                </div>
              )}

              {/* Linha 1: Paciente e Profissional */}
              <div className="row g-3 mb-3">
                {/* Paciente (ReadOnly) */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Paciente
                  </label>
                  <div
                    className="bg-light p-2 rounded border d-flex align-items-center gap-2 overflow-hidden"
                    style={{ height: "38px" }}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-secondary ms-1 flex-shrink-0"
                    />
                    <span className="fw-bold text-dark small text-truncate">
                      {originalData.paciente.nome}
                    </span>
                  </div>
                </div>

                {/* Profissional (Editável via Select) */}
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
                      style={{ boxShadow: "none", cursor: "pointer" }}
                      value={idProfissional}
                      onChange={(e) => setIdProfissional(e.target.value)}
                    >
                      {profissionaisList.map((p) => (
                        <option
                          key={p.id_profissional}
                          value={p.id_profissional}
                        >
                          {p.nome}
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
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm shadow-none rounded-3"
                    style={{ boxShadow: "none" }}
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">
                    Fim (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm shadow-none rounded-3"
                    style={{ boxShadow: "none" }}
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* Serviços Selecionados */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">
                  Serviços
                </label>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {selectedServices.map((s) => (
                    <span
                      key={s.id_servico}
                      className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 rounded-pill pe-2 d-flex align-items-center"
                    >
                      {s.nome}
                      <button
                        type="button"
                        onClick={() => handleToggleService(s.id_servico, s)}
                        className="btn btn-link p-0 ms-2 text-primary shadow-none"
                        style={{ boxShadow: "none" }}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </span>
                  ))}
                  {selectedServices.length === 0 && (
                    <span className="text-muted small fst-italic">
                      Nenhum serviço.
                    </span>
                  )}
                </div>

                {/* Selector */}
                <ServiceSelector
                  selectedIds={selectedServices.map((s) => s.id_servico)}
                  onToggle={handleToggleService}
                />
              </div>

              {/* Status e Obs */}
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold small text-secondary">
                    Status
                  </label>
                  <select
                    className="form-select form-select-sm rounded-pill shadow-none fw-bold"
                    style={{ boxShadow: "none", fontSize: "0.8rem" }}
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
                    style={{
                      boxShadow: "none",
                      resize: "none",
                      fontSize: "0.8rem",
                    }}
                    rows={1}
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-3">
                <button
                  className="btn btn-link text-danger text-decoration-none p-0 d-flex align-items-center gap-1 shadow-none"
                  style={{ boxShadow: "none", fontSize: "0.85rem" }}
                  onClick={() => setShowConfirmDelete(true)}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="fw-bold">Excluir</span>
                </button>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light rounded-pill px-3 fw-bold text-secondary shadow-none border"
                    style={{ boxShadow: "none", fontSize: "0.85rem" }}
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button-dark-grey px-4 rounded-pill fw-bold shadow-none border-0 text-white d-flex align-items-center gap-2"
                    style={{
                      boxShadow: "none",
                      fontSize: "0.85rem",
                      padding: "6px 16px",
                    }}
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

      {/* Modal Confirmação */}
      {showConfirmDelete && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center animate-fade-in"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1070 }}
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-4 shadow p-4 text-center"
            style={{ maxWidth: "350px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-3">
              <div className="mb-2 text-warning">
                <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
              </div>
              <h6 className="fw-bold text-secondary mb-1">
                Cancelar Agendamento?
              </h6>
              <p className="text-muted small mb-0 lh-sm">
                Essa ação é irreversível.
              </p>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-light btn-sm text-secondary fw-bold px-3 rounded-pill shadow-none"
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
              >
                Voltar
              </button>
              <button
                className="btn btn-danger btn-sm fw-bold px-3 rounded-pill d-flex align-items-center gap-2 shadow-none"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <span>Confirmar</span>
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
