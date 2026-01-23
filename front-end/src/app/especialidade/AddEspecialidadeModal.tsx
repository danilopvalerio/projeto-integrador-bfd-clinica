"use client";

import { useState } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";

import EspecialidadeGeneralForm from "./EspecialidadeGeneralForm";
import { CreateEspecialidadePayload } from "./types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface LocalFormData {
  nome: string;
  descricao: string;
}

const AddEspecialidadeModal = ({ onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<LocalFormData>({
    nome: "",
    descricao: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof LocalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: CreateEspecialidadePayload = {
        nome: formData.nome,
        descricao: formData.descricao || "",
      };

      await api.post("/specialities", payload);
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
      style={{ backgroundColor: "rgba(0, 0, 0, 0.48)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog detail-box"
        style={{ maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between">
            <h5 className="modal-title fw-bold text-secondary">
              Nova Especialidade
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4 pt-2">
            {error && (
              <div className="alert alert-danger small py-2 rounded-3 border-0 bg-danger bg-opacity-10 text-danger mb-3">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <EspecialidadeGeneralForm
                data={formData}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="d-flex justify-content-end mt-4 pt-3 border-top gap-2">
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={onClose}
                  disabled={loading}
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="button-dark-grey px-4 py-2 rounded-pill"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Criar Especialidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEspecialidadeModal;
