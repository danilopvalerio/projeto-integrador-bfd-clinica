"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { PatientSummary } from "./types";

interface Props {
  patient: PatientSummary;
  onClick: () => void; // abre o modal de detalhes
  onEdit: () => void;  // abre o modal de edição (pode ser o mesmo modal)
  onDelete: () => void; // deleta o paciente
}

const PatientCard = ({ patient, onClick, onEdit, onDelete }: Props) => {
  return (
    <div className="card shadow-sm rounded-4 cursor-pointer position-relative" style={{ minHeight: "150px" }}>
      {/* Card principal */}
      <div className="card-body" onClick={onClick}>
        <h6 className="card-title fw-bold">{patient.nome_completo}</h6>
        <p className="card-text small mb-1">CPF: {patient.cpf}</p>
        <p className="card-text small mb-0">Telefone: {patient.telefone}</p>
      </div>

      {/* Botões de ação */}
      <div className="position-absolute top-0 end-0 m-2 d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary rounded-pill px-2"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >
          <FontAwesomeIcon icon={faPencil} className="me-1" />
          Editar
        </button>
        <button
          className="btn btn-sm btn-outline-danger rounded-pill px-2"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <FontAwesomeIcon icon={faTrash} className="me-1" />
          Excluir
        </button>
      </div>
    </div>
  );
};

export default PatientCard;
