// src/app/profissionais/components/ManualScheduleForm.tsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  initialValues: { dia: number; inicio: string; fim: string };
  diasSemana: string[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: { dia: number; inicio: string; fim: string }) => void;
}

const ManualScheduleForm = ({
  isOpen,
  isEditing,
  initialValues,
  diasSemana,
  isSaving,
  onClose,
  onSave,
}: Props) => {
  const [formDia, setFormDia] = useState(initialValues.dia);
  const [formInicio, setFormInicio] = useState(initialValues.inicio);
  const [formFim, setFormFim] = useState(initialValues.fim);

  // Reinicia o form quando abre ou troca o item editado
  useEffect(() => {
    if (isOpen) {
      setFormDia(initialValues.dia);
      setFormInicio(initialValues.inicio);
      setFormFim(initialValues.fim);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ dia: formDia, inicio: formInicio, fim: formFim });
  };

  return (
    <div
      className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-95 d-flex justify-content-center align-items-center animate-fade-in"
      style={{ zIndex: 1050 }}
    >
      <div
        className="bg-white p-4 rounded-4 shadow border"
        style={{ width: "90%", maxWidth: "400px" }}
      >
        <h5 className="fw-bold mb-3 text-secondary">
          {isEditing ? "Editar Horário" : "Novo Horário"}
        </h5>

        <div className="mb-3">
          <label className="form-label small fw-bold text-muted">Dia</label>
          <select
            className="form-select shadow-none"
            value={formDia}
            onChange={(e) => setFormDia(Number(e.target.value))}
          >
            {diasSemana.map((dia, idx) => (
              <option key={idx} value={idx}>
                {dia}
              </option>
            ))}
          </select>
        </div>

        <div className="row mb-4">
          <div className="col-6">
            <label className="form-label small fw-bold text-muted">
              Início
            </label>
            <input
              type="time"
              className="form-control shadow-none"
              value={formInicio}
              onChange={(e) => setFormInicio(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold text-muted">Fim</label>
            <input
              type="time"
              className="form-control shadow-none"
              value={formFim}
              onChange={(e) => setFormFim(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-light text-secondary fw-bold rounded-pill px-3"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            className="btn button-dark-grey rounded-pill px-4 fw-bold text-white d-flex align-items-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <div className="spinner-border spinner-border-sm" />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualScheduleForm;
