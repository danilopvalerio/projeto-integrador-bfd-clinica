"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faPhone } from "@fortawesome/free-solid-svg-icons";
import { PatientSummary } from "./types";

interface Props {
  patient: PatientSummary;
  onClick: () => void;
}

const PatientCard = ({ patient, onClick }: Props) => {
  return (
    <div 
      className="card-item-bottom-line-rounded h-100 hover-shadow cursor-pointer bg-white"
      onClick={onClick}
      style={{ transition: "transform 0.2s" }}
    >
      <div className="card-body p-4 d-flex flex-column h-100">
        <div className="d-flex align-items-center mb-3">
          <div 
            className="bg-gradient-vl text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3"
            style={{ width: "48px", height: "48px", minWidth: "48px" }}
          >
            {patient.nome_completo.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h6 className="card-title fw-bold mb-0 text-truncate" title={patient.nome_completo}>
              {patient.nome_completo}
            </h6>
            <small className="text-muted">Paciente</small>
          </div>
        </div>

        <div className="mt-auto pt-3 border-top">
          <div className="d-flex justify-content-between">
            <small className="text-secondary">
              <FontAwesomeIcon icon={faIdCard} className="me-1" />
              {patient.cpf}
            </small>
            <small className="text-secondary">
              <FontAwesomeIcon icon={faPhone} className="me-1" />
              {patient.telefone}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;