"use client";

import { useEffect, useState } from "react";
import api from "../../utils/api";
import { PatientDetail } from "./types";

interface Props {
  patientId: string;
  onClose: () => void;
}

const ViewPatientModal = ({ patientId, onClose }: Props) => {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<PatientDetail>(`/patients/${patientId}`);
        setPatient(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  if (loading) return <div className="spinner-border text-secondary"></div>;

  if (!patient) return <div>Paciente não encontrado.</div>;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content p-4">
          <h5>Detalhes do Paciente</h5>
          <p><strong>Nome:</strong> {patient.nome_completo}</p>
          <p><strong>CPF:</strong> {patient.cpf}</p>
          <p><strong>Telefone:</strong> {patient.telefone}</p>
          <p><strong>Data de Nascimento:</strong> {patient.data_nascimento}</p>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientModal;
