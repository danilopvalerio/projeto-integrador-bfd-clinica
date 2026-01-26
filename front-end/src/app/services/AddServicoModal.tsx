// src/app/services/AddServicoModal.tsx
"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import ServicoGeneralForm from "./ServicoGeneralForm";
import { CreateServicoPayload } from "./types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface LocalFormData extends Omit<
  CreateServicoPayload,
  "preco" | "duracao_estimada"
> {
  preco: string | number;
  duracao_estimada: string | number;
}

const AddServicoModal = ({ onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<LocalFormData>({
    nome: "",
    descricao: "",
    preco: "",
    duracao_estimada: "",
    ativo: true,
    preco_visivel_paciente: true,
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (
    field: keyof LocalFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: CreateServicoPayload = {
        ...formData,
        preco: Number(formData.preco),
        duracao_estimada: Number(formData.duracao_estimada),
      };

      await api.post("/services", payload);
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
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold text-secondary">Novo Serviço</h5>
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
              <ServicoGeneralForm
                data={formData}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top gap-3">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Criar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddServicoModal;
