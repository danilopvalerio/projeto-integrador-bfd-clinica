"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave } from "@fortawesome/free-solid-svg-icons";

import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";

import type { ProfissionalFormData } from "./types";
import ProfissionalGeneralForm from "./ProfissionalGeneralForm";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProfissionalModal = ({ onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ProfissionalFormData>({
    nome: "",
    cpf: "",
    registro_conselho: "",
    email: "",
    senha: "",
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const email = (formData.email ?? "").trim();
      const senha = formData.senha ?? "";

      if (!email) {
        throw new Error(
          "Informe um e-mail para criar o usuário automaticamente.",
        );
      }
      if (!senha) {
        throw new Error("Informe uma senha para o usuário.");
      }

      await api.post("/professionals", {
        nome: formData.nome ?? "",
        cpf: formData.cpf ?? "",
        registro_conselho: formData.registro_conselho ?? "",
        usuario: {
          email,
          senha,
          tipo_usuario: "PROFISSIONAL",
        },
      });

      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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
          <div className="modal-header bg-gradient-vl text-white rounded-top-4">
            <h5 className="modal-title fw-bold">Novo Profissional</h5>
            <button
              className="btn btn-link text-white shadow-none"
              onClick={onClose}
              style={{ boxShadow: "none" }}
            >
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

            <ProfissionalGeneralForm
              value={formData}
              onChange={setFormData}
              mode="create"
            />
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 p-4 pt-0">
            <button
              className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-none"
              style={{ boxShadow: "none" }}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              className="button-dark-grey rounded-pill px-4 fw-bold shadow-sm shadow-none"
              style={{ boxShadow: "none" }}
              onClick={handleSubmit}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faSave} className="me-2" />
              {loading ? "Salvando..." : "Criar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProfissionalModal;
