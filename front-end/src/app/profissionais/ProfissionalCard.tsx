"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import type { ProfissionalSummary } from "./types";

interface Props {
  profissional: ProfissionalSummary;
  onOpenDetails: () => void;
  onOpenHorarios: () => void;
}

const ProfissionalCard = ({
  profissional,
  onOpenDetails,
  onOpenHorarios,
}: Props) => {
  const initial = profissional.nome?.trim()?.charAt(0)?.toUpperCase() ?? "P";

  return (
    <div
      className="card-item-bottom-line-rounded h-100 bg-white p-3"
      style={{
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default", // Cursor default pois os botões internos que são clicáveis
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.classList.add("shadow");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.classList.remove("shadow");
      }}
    >
      <div className="card-body d-flex flex-column h-100">
        {/* Cabeçalho */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0"
            style={{ width: 48, height: 48, fontSize: 20, fontWeight: 700 }}
          >
            {initial}
          </div>

          <div className="flex-grow-1 overflow-hidden">
            <h6
              className="fw-bold mb-0 text-truncate"
              title={profissional.nome}
            >
              {profissional.nome}
            </h6>
            <small className="text-muted d-block text-truncate">
              Conselho: {profissional.registro_conselho}
            </small>
          </div>
        </div>

        {/* Corpo */}
        <div className="mt-auto">
          <p className="mb-3 small text-secondary">
            <strong>CPF:</strong> {profissional.cpf}
          </p>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="button-dark-grey btn btn-sm rounded-pill px-3 fw-bold w-50 shadow-none"
              style={{ boxShadow: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails();
              }}
            >
              <FontAwesomeIcon icon={faCircleInfo} className="me-2" />
              Detalhes
            </button>

            <button
              type="button"
              className="button-dark-grey btn btn-sm rounded-pill px-3 fw-bold w-50 shadow-none"
              style={{ boxShadow: "none" }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenHorarios();
              }}
            >
              <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
              Horários
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfissionalCard;
