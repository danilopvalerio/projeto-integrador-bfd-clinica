"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";

import type { ProfissionalFormData, CreateProfissionalPayload } from "../types";
import ProfissionalGeneralForm from "./ProfissionalGeneralForm";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProfissionalModal = ({ onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);

  // Feedback
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Estado inicial do formulário
  const [formData, setFormData] = useState<ProfissionalFormData>({
    nome: "",
    cpf: "",
    registro_conselho: "",
    email: "",
    senha: "",
  });

  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const scrollToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // 1. Extração e limpeza dos dados
      const nomeLimpo = (formData.nome || "").trim();
      const emailLimpo = (formData.email || "").trim();
      const senhaLimpa = formData.senha || "";
      const cpfLimpo = (formData.cpf || "").trim();
      const registroLimpo = (formData.registro_conselho || "").trim();

      // 2. Validações
      if (!nomeLimpo) throw new Error("Informe o nome do profissional.");
      if (!cpfLimpo) throw new Error("Informe o CPF.");
      if (!registroLimpo) throw new Error("Informe o registro do conselho.");
      if (!emailLimpo) throw new Error("Informe um e-mail para acesso.");
      if (!senhaLimpa) throw new Error("Defina uma senha inicial.");

      // 3. Montagem do Payload conforme DTO do Backend
      const payload: CreateProfissionalPayload = {
        cpf: cpfLimpo,
        registro_conselho: registroLimpo,
        usuario: {
          nome: nomeLimpo, // Enviando explicitamente
          email: emailLimpo,
          senha: senhaLimpa,
          tipo_usuario: "PROFISSIONAL",
        },
      };

      await api.post("/professionals", payload);

      setSuccessMsg("Profissional criado com sucesso!");
      scrollToTop();

      // Aguarda feedback visual antes de fechar
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
        <div
          className="modal-content border-0 rounded-4 shadow"
          style={{ overflow: "hidden" }}
        >
          {/* Header */}
          <div className="modal-header bg-gradient-vl text-white rounded-top-4 px-4 py-3">
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
          <div
            ref={modalBodyRef}
            className="modal-body p-4"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            {/* Feedback Sucesso */}
            {successMsg && (
              <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center mb-3 animate-fade-in">
                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                {successMsg}
              </div>
            )}

            {/* Feedback Erro */}
            {error && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-3">
                {error}
              </div>
            )}

            <div className="bg-white border rounded-4 p-4 shadow-sm">
              <h6 className="fw-bold mb-3 text-secondary">Dados Cadastrais</h6>
              <ProfissionalGeneralForm
                value={formData}
                onChange={setFormData}
                mode="create"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 p-4 pt-0 bg-light">
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
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <FontAwesomeIcon icon={faSave} className="me-2" />
              )}
              {loading ? "Salvando..." : "Criar Profissional"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProfissionalModal;
