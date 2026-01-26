"use client";

import { useState } from "react";
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
  faTimes,
  faUser,
  faUserMd,
  faEdit,
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
  const [error, setError] = useState("");

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);

  const [selectedPatientName, setSelectedPatientName] = useState("");
  const [selectedProfessionalName, setSelectedProfessionalName] = useState("");

  const [selectedServices, setSelectedServices] = useState<ServicoSummary[]>(
    [],
  );

  const [formData, setFormData] = useState<CreateAgendamentoPayload>({
    id_paciente: "",
    id_profissional: preSelectedProfissional || "",
    ids_servicos: [],
    data_hora_inicio: initialDate ? `${initialDate}T08:00` : "",
    data_hora_fim: "",
    observacoes: "",
  });

  const handleServiceToggle = (id: string, serviceObj: ServicoSummary) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id_servico === id);
      let newList;
      if (exists) newList = prev.filter((s) => s.id_servico !== id);
      else newList = [...prev, serviceObj];

      setFormData((f) => ({
        ...f,
        ids_servicos: newList.map((s) => s.id_servico),
      }));
      return newList;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.id_paciente) throw new Error("Selecione um paciente.");
      if (!formData.id_profissional)
        throw new Error("Selecione um profissional.");

      const payload = {
        ...formData,
        data_hora_inicio: new Date(formData.data_hora_inicio).toISOString(),
        data_hora_fim: formData.data_hora_fim
          ? new Date(formData.data_hora_fim).toISOString()
          : undefined,
      };

      await api.post("/agendamentos", payload);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="modal-backdrop d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      >
        <div
          className="modal-dialog detail-box"
          style={{ maxWidth: "600px", width: "95%" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow rounded-4">
            <div className="modal-header border-bottom-0 p-4">
              <h5 className="modal-title fw-bold text-secondary">
                Novo Agendamento
              </h5>
              <button
                type="button"
                className="btn-close shadow-none"
                onClick={onClose}
              ></button>
            </div>

            <div
              className="modal-body p-4 pt-0 custom-scroll"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              {error && (
                <div className="alert alert-danger rounded-3 py-2 px-3 small mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">
                      Paciente
                    </label>
                    <div
                      className="input-group cursor-pointer"
                      onClick={() => setShowPatientModal(true)}
                    >
                      <span className="input-group-text bg-white text-primary border-end-0">
                        <FontAwesomeIcon icon={faUser} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 bg-white shadow-none"
                        style={{ boxShadow: "none", cursor: "pointer" }}
                        placeholder="Selecionar"
                        value={selectedPatientName}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-light border border-start-0 text-secondary"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">
                      Profissional
                    </label>
                    <div
                      className="input-group cursor-pointer"
                      onClick={() => setShowProfessionalModal(true)}
                    >
                      <span className="input-group-text bg-white text-success border-end-0">
                        <FontAwesomeIcon icon={faUserMd} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 bg-white shadow-none"
                        style={{ boxShadow: "none", cursor: "pointer" }}
                        placeholder="Selecionar"
                        value={selectedProfessionalName}
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn btn-light border border-start-0 text-secondary"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">
                      Início
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control shadow-none"
                      style={{ boxShadow: "none" }}
                      value={formData.data_hora_inicio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_hora_inicio: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">
                      Fim (Opcional)
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control shadow-none"
                      style={{ boxShadow: "none" }}
                      value={formData.data_hora_fim}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          data_hora_fim: e.target.value,
                        })
                      }
                    />
                    <div className="form-text x-small">
                      Se vazio, calculado automaticamente.
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label small fw-bold text-secondary">
                    Serviços Selecionados
                  </label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {selectedServices.map((s) => (
                      <span
                        key={s.id_servico}
                        className="badge bg-light text-dark border rounded-pill pe-2 d-flex align-items-center"
                      >
                        {s.nome}
                        <button
                          type="button"
                          onClick={() => handleServiceToggle(s.id_servico, s)}
                          className="btn btn-link p-0 ms-2 text-danger shadow-none"
                          style={{ boxShadow: "none" }}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </span>
                    ))}
                    {selectedServices.length === 0 && (
                      <span className="text-muted x-small">
                        Nenhum selecionado.
                      </span>
                    )}
                  </div>
                  <ServiceSelector
                    selectedIds={formData.ids_servicos}
                    onToggle={handleServiceToggle}
                  />
                </div>

                <div className="mt-3">
                  <label className="form-label small fw-bold text-secondary">
                    Observações
                  </label>
                  <textarea
                    className="form-control shadow-none"
                    style={{ boxShadow: "none" }}
                    rows={2}
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                  />
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-link text-secondary shadow-none"
                    style={{ boxShadow: "none" }}
                    onClick={onClose}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="button-dark-grey px-4 py-2 rounded-pill shadow-none fw-bold text-white border-0"
                    style={{ boxShadow: "none" }}
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Agendar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showPatientModal && (
        <SelectionModal<PacienteSummary>
          title="Selecionar Paciente"
          endpoint="/patients"
          onClose={() => setShowPatientModal(false)}
          onSelect={(item) => {
            setFormData((prev) => ({ ...prev, id_paciente: item.id }));
            setSelectedPatientName(item.name);
            setShowPatientModal(false);
          }}
          mapper={(p) => ({
            id: p.id_paciente,
            name: p.nome,
            subInfo: p.cpf ? `CPF: ${p.cpf}` : undefined, // Mostra CPF se existir
          })}
        />
      )}

      {showProfessionalModal && (
        <SelectionModal<ProfissionalSummary>
          title="Selecionar Profissional"
          endpoint="/professionals"
          onClose={() => setShowProfessionalModal(false)}
          onSelect={(item) => {
            setFormData((prev) => ({ ...prev, id_profissional: item.id }));
            setSelectedProfessionalName(item.name);
            setShowProfessionalModal(false);
          }}
          mapper={(p) => ({
            id: p.id_profissional,
            name: p.nome,
            subInfo: `${p.registro_conselho + " | CPF: " + p.cpf}`,
          })}
        />
      )}
    </>
  );
};

export default AddAgendamentoModal;
