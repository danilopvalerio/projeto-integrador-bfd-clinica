"use client";

import { useState } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";

interface Props {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DelPatientModal = ({ patientId, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este paciente? Esta ação é irreversível.")) return;
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
      style={{ backgroundColor: "rgba(0,0,0,0.48)" }}
      onClick={onClose}
    >
      <div className="modal-dialog detail-box" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold text-secondary">Excluir Paciente</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4 pt-2">
            {error && (
              <div className="alert alert-danger small py-2 rounded-3 mb-3">{error}</div>
            )}
            <p>Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.</p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                {loading ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelPatientModal;
