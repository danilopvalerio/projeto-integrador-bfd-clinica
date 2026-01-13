"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import PatientGeneralForm from "./PatientGeneralForm";
import { CreatePatientPayload } from "./types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddPatientModal = ({ onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado inicial atualizado para refletir o CreatePatientPayload do seu index.ts
  const [formData, setFormData] = useState<CreatePatientPayload>({
    nome_completo: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    sexo: "",
    email: "",
    id_usuario: "",
    id_endereco: ""
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Tipagem ajustada para aceitar as chaves do CreatePatientPayload
  const handleChange = (field: keyof CreatePatientPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Envia o payload completo para a rota de criação
      await api.post("/patients", formData);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.48)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog detail-box"
        style={{ maxWidth: "600px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold text-secondary">Novo Paciente</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 pt-2">
            {error && (
              <div className="alert alert-danger small py-2 rounded-3 border-0 bg-danger bg-opacity-10 text-danger mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <PatientGeneralForm
                data={formData}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top gap-3">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Salvando...
                    </>
                  ) : (
                    "Criar Paciente"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;