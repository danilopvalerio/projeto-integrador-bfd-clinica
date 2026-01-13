"use client";

import { useEffect, useState } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { PatientDetail } from "./types";
import PatientGeneralForm from "./PatientGeneralForm";

interface Props {
  patientId: string;
  onClose: () => void;
}

const ViewPatientModal = ({ patientId, onClose }: Props) => {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<PatientDetail>(`/patients/${patientId}`);
        setPatient(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);

  // Fechar com a tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (loading) {
    return (
      <div className="modal-backdrop d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1100 }}>
        <div className="spinner-border text-white"></div>
      </div>
    );
  }

  return (
    <div 
      className="modal-backdrop d-flex justify-content-center align-items-center" 
      style={{ backgroundColor: "rgba(0, 0, 0, 0.48)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog detail-box" 
        style={{ maxWidth: "650px", width: "100%" }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-secondary">Consulta de Dados</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 pt-2">
            {error ? (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small">
                {error}
              </div>
            ) : patient && (
              <>
                {/* Reutilizamos o formulário em modo disabled para visualização limpa */}
                <PatientGeneralForm 
                  data={patient} 
                  onChange={() => {}} // Função vazia pois é apenas leitura
                  disabled={true} 
                />
                
                <div className="mt-3 p-3 bg-light rounded-3">
                  <p className="small text-muted mb-1"><strong>ID do Paciente:</strong> {patient.id_paciente}</p>
                  <p className="small text-muted mb-0"><strong>Vínculo de Usuário:</strong> {patient.id_usuario}</p>
                </div>
              </>
            )}

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button 
                className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold" 
                onClick={onClose}
              >
                Fechar Consulta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientModal;