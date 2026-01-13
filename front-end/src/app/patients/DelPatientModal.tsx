"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

interface Props {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DelPatientModal = ({ patientId, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fechar ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleDelete = async () => {
    // Removi o confirm() nativo porque este modal já é a confirmação visual
    setLoading(true);
    setError("");
    try {
      await api.delete(`/patients/${patientId}`);
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
      style={{ backgroundColor: "rgba(0,0,0,0.48)", zIndex: 1100 }} // zIndex maior para sobrepor outros modais
      onClick={onClose}
    >
      <div 
        className="modal-dialog detail-box" 
        style={{ maxWidth: "400px", width: "100%" }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-secondary">Confirmar Exclusão</h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
          </div>

          <div className="modal-body p-4 pt-2 text-center">
            <div className="text-danger mb-3">
              <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            </div>

            {error && (
              <div className="alert alert-danger small py-2 rounded-3 mb-3 border-0 bg-danger bg-opacity-10 text-danger">
                {error}
              </div>
            )}

            <p className="text-muted">
              Tem certeza que deseja excluir este paciente? <br />
              <span className="small text-danger fw-bold">Esta ação é irreversível.</span>
            </p>

            <div className="d-flex flex-column gap-2 mt-4">
              <button 
                className="btn btn-danger rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2" 
                onClick={handleDelete} 
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faTrashAlt} />
                    Excluir Permanentemente
                  </>
                )}
              </button>
              
              <button 
                className="btn btn-link text-secondary text-decoration-none fw-bold" 
                onClick={onClose} 
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelPatientModal;