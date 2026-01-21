// src/components/AlertModal.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faCheckCircle,
  faInfoCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  variant?: "error" | "success" | "info" | "warning";
}

export default function AlertModal({
  isOpen,
  title,
  message,
  onClose,
  variant = "error",
}: AlertModalProps) {
  if (!isOpen) return null;

  const variantConfig = {
    error: {
      icon: faTimesCircle,
      color: "text-danger",
      bgColor: "bg-danger",
      defaultTitle: "Erro",
    },
    success: {
      icon: faCheckCircle,
      color: "text-success",
      bgColor: "bg-success",
      defaultTitle: "Sucesso",
    },
    info: {
      icon: faInfoCircle,
      color: "text-info",
      bgColor: "bg-info",
      defaultTitle: "Informação",
    },
    warning: {
      icon: faExclamationCircle,
      color: "text-warning",
      bgColor: "bg-warning",
      defaultTitle: "Atenção",
    },
  };

  const config = variantConfig[variant];
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={onClose}
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
            <h5 className="fw-bold mb-3">{displayTitle}</h5>

            {/* Mensagem */}
            <p className="text-muted mb-4">{message}</p>

            {/* Botão */}
            <button
              type="button"
              className={`btn ${config.bgColor} text-white px-4 fw-bold`}
              onClick={onClose}
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
