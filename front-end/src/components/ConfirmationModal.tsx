// src/components/ConfirmationModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success" | "info";
  isProcessing?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning",
  isProcessing = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const variantConfig = {
    danger: {
      icon: faExclamationTriangle,
      color: "text-danger",
      bgColor: "bg-danger",
      btnClass: "btn-danger",
    },
    warning: {
      icon: faExclamationTriangle,
      color: "text-warning",
      bgColor: "bg-warning",
      btnClass: "btn-warning",
    },
    success: {
      icon: faCheckCircle,
      color: "text-success",
      bgColor: "bg-success",
      btnClass: "btn-success",
    },
    info: {
      icon: faInfoCircle,
      color: "text-info",
      bgColor: "bg-info",
      btnClass: "btn-info",
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-body p-4 text-center">
            {/* Ícone */}
            <div className={`mb-3 ${config.color}`}>
              <FontAwesomeIcon icon={config.icon} size="3x" />
            </div>

            {/* Título */}
            <h5 className="fw-bold mb-3">{title}</h5>

            {/* Mensagem */}
            <p className="text-muted mb-4">{message}</p>

            {/* Botões */}
            <div className="d-flex gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onCancel}
                disabled={isProcessing}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn ${config.btnClass} text-white px-4 fw-bold`}
                onClick={onConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Processando...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
