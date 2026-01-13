"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PatientDetail } from "./types";
import PatientGeneralForm from "./PatientGeneralForm";
import { MOCK_PATIENTS } from "./types/mockData"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileMedical } from "@fortawesome/free-solid-svg-icons";

interface Props {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PatientDetailModal = ({ patientId, onClose, onSuccess }: Props) => {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatientData = () => {
      setLoading(true);
      setError("");

      try {
        const found = MOCK_PATIENTS.find(p => p.id_paciente === patientId);

        if (found) {
          const detailedPatient: PatientDetail = {
            ...found,
            data_nascimento: found.data_nascimento || "1990-01-01", 
            id_endereco: found.id_endereco || "UUID-VAZIO",
            email: found.email || "",
            sexo: found.sexo || ""
          };
          setPatient(detailedPatient);
        } else {
          setError(`Paciente ${patientId} não encontrado no mock.`);
        }
      } catch (err) {
        setError("Erro ao processar dados do paciente.");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) loadPatientData();
  }, [patientId]);

  const handleGoToProntuario = () => {
    router.push(`/patients/${patientId}/record`);
    onClose();
  };

  if (loading) return (
    <div className="modal-backdrop d-flex justify-content-center align-items-center" 
         style={{ background: "rgba(0,0,0,0.7)", zIndex: 1100, position: 'fixed', inset: 0 }}>
        <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    // Ajustado background para 0.7 para melhor contraste e fixed para garantir cobertura
    <div className="modal-backdrop d-flex justify-content-center align-items-center" 
         style={{ background: "rgba(0,0,0,0.7)", zIndex: 1100, position: 'fixed', inset: 0 }} 
         onClick={onClose}>
      
      <div className="modal-dialog modal-lg w-100 shadow-lg" 
           style={{ maxWidth: "700px" }} 
           onClick={(e) => e.stopPropagation()}>
        
        {/* Adicionado bg-white e border para remover transparência */}
        <div className="modal-content border border-light shadow rounded-4 bg-white" style={{ opacity: 1 }}>
          
          <div className="modal-header border-bottom-0 p-4 d-flex justify-content-between align-items-center bg-white rounded-top-4">
            <h5 className="fw-bold text-secondary m-0">Detalhes do Paciente</h5>
            
            <button 
              className="btn btn-primary rounded-pill px-3 fw-bold shadow-sm d-flex align-items-center gap-2"
              onClick={handleGoToProntuario}
            >
              <FontAwesomeIcon icon={faFileMedical} />
              Acessar Prontuário
            </button>
          </div>

          <div className="modal-body p-4 pt-0 bg-white">
            {error && <div className="alert alert-danger small">{error}</div>}

            {patient && (
              <PatientGeneralForm 
                data={patient} 
                onChange={(field, value) => setPatient(prev => prev ? {...prev, [field]: value} : null)}
              />
            )}

            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top bg-white rounded-bottom-4">
              <button className="btn btn-link text-secondary fw-bold text-decoration-none" onClick={onClose}>Fechar</button>
              <button className="button-dark-grey px-4 py-2 rounded-pill fw-bold text-white shadow-sm" style={{ backgroundColor: '#343a40', border: 'none' }}>
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;