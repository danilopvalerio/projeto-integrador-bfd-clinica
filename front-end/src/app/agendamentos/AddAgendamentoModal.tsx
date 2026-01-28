"use client";

import { useState, useRef } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import {
  CreateAgendamentoPayload,
  ServicoSummary,
  PacienteSummary,
  ProfissionalSummary,
} from "./types";
import ServiceSelector from "./ServiceSelector";
import SelectionModal from "./SelectionModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faUserMd,
  faTimes,
  faCalendarAlt,
  faClock,
  faTag,
  faCheckCircle,
  faSearch,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
  preSelectedProfissional?: string;
}

const AddAgendamentoModal = ({
  onClose,
  onSuccess,
  initialDate,
  preSelectedProfissional,
}: Props) => {
  const [loading, setLoading] = useState(false);

  // Feedback
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Controle dos Modais de Seleção
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);

  // Form States - Objetos para guardar ID e Nome para exibição
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Se houver pré-seleção via prop, inicializamos (o nome ficará genérico até selecionar outro ou podemos buscar)
  const [selectedProfessional, setSelectedProfessional] = useState<{
    id: string;
    name: string;
  } | null>(
    preSelectedProfissional
      ? { id: preSelectedProfissional, name: "Profissional Pré-selecionado" }
      : null,
  );

  const [start, setStart] = useState(initialDate ? `${initialDate}T08:00` : "");
  const [end, setEnd] = useState("");
  const [obs, setObs] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServicoSummary[]>(
    [],
  );

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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (!selectedPatient?.id) throw new Error("Selecione um paciente.");
      if (!selectedProfessional?.id)
        throw new Error("Selecione um profissional.");
      if (selectedServices.length === 0)
        throw new Error("Selecione ao menos um serviço.");
      if (!start) throw new Error("Data de início é obrigatória.");

      const payload: CreateAgendamentoPayload = {
        id_paciente: selectedPatient.id,
        id_profissional: selectedProfessional.id,
        ids_servicos: selectedServices.map((s) => s.id_servico),
        data_hora_inicio: new Date(start).toISOString(),
        data_hora_fim: end ? new Date(end).toISOString() : undefined,
        observacoes: obs,
      };

      await api.post("/agendamentos", payload);

      setSuccessMsg("Agendamento criado com sucesso!");
      scrollToTop();

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(getErrorMessage(err));
      scrollToTop();
      setLoading(false);
    }
  };

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
            {/* Header Verde */}
            <div
              className="modal-header border-bottom-0 p-3 px-4 text-white d-flex justify-content-between align-items-center"
              style={{ background: "#4CAF50" }}
            >
              <h5
                className="modal-title fw-bold mb-0"
                style={{ fontSize: "1.1rem" }}
              >
                Novo Agendamento
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

              {/* Linha 1: Paciente e Profissional */}
              <div className="row g-3 mb-3">
                {/* Paciente (Modal Selector) */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Paciente
                  </label>
                  <div
                    className="input-group cursor-pointer"
                    onClick={() => setShowPatientModal(true)}
                  >
                    <span className="input-group-text bg-light text-secondary border-end-0">
                      <FontAwesomeIcon icon={faUser} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light shadow-none border-start-0 fw-bold text-dark"
                      placeholder="Clique para selecionar..."
                      value={selectedPatient?.name || ""}
                      readOnly
                      style={{ cursor: "pointer" }}
                    />
                    <button className="btn btn-light border border-start-0 text-primary">
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                  </div>
                </div>

                {/* Profissional (Modal Selector - RESTAURADO) */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">
                    Profissional
                  </label>
                  <div
                    className="input-group cursor-pointer"
                    onClick={() => setShowProfessionalModal(true)}
                  >
                    <span className="input-group-text bg-light text-success border-end-0">
                      <FontAwesomeIcon icon={faUserMd} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-light shadow-none border-start-0 fw-bold text-dark"
                      placeholder="Clique para selecionar..."
                      value={selectedProfessional?.name || ""}
                      readOnly
                      style={{ cursor: "pointer" }}
                    />
                    <button className="btn btn-light border border-start-0 text-primary">
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Linha 2: Datas */}
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
                    (Auto)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-sm shadow-none rounded-3"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </div>
              </div>

              {/* SEÇÃO DE SERVIÇOS */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-end mb-2">
                  <label className="form-label fw-bold small text-secondary mb-0">
                    Serviços
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
                      Nenhum serviço selecionado.
                    </div>
                  )}
                </div>

                <ServiceSelector
                  selectedIds={selectedServices.map((s) => s.id_servico)}
                  onToggle={handleToggleService}
                />
              </div>

              {/* Obs */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">
                  Observações
                </label>
                <textarea
                  className="form-control form-control-sm shadow-none rounded-3"
                  style={{ resize: "none" }}
                  rows={2}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Detalhes adicionais..."
                />
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-end align-items-center gap-2 pt-3 border-top mt-3">
                <button
                  className="btn btn-light rounded-pill px-3 fw-bold text-secondary shadow-none border"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  className="button-dark-grey px-4 rounded-pill fw-bold shadow-none text-white d-flex align-items-center gap-2"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <FontAwesomeIcon icon={faSave} />
                  )}
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Paciente */}
      {showPatientModal && (
        <SelectionModal<PacienteSummary>
          title="Selecionar Paciente"
          endpoint="/patients"
          onClose={() => setShowPatientModal(false)}
          onSelect={(item) => {
            setSelectedPatient({ id: item.id, name: item.name });
            setShowPatientModal(false);
          }}
          mapper={(p) => ({
            id: p.id_paciente,
            name: p.usuario?.nome || "Sem Nome",
            subInfo: p.cpf ? `CPF: ${p.cpf}` : undefined,
          })}
        />
      )}

      {/* Modal de Seleção de Profissional */}
      {showProfessionalModal && (
        <SelectionModal<ProfissionalSummary>
          title="Selecionar Profissional"
          endpoint="/professionals"
          onClose={() => setShowProfessionalModal(false)}
          onSelect={(item) => {
            setSelectedProfessional({ id: item.id, name: item.name });
            setShowProfessionalModal(false);
          }}
          mapper={(p) => ({
            id: p.id_profissional,
            name: p.usuario?.nome || "Sem Nome",
            subInfo: `${p.registro_conselho} | CPF: ${p.cpf}`,
          })}
        />
      )}
    </>
  );
};

export default AddAgendamentoModal;
