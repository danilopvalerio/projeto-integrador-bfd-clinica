"use client";

import type { ProfissionalSummary } from "./types";

interface Props {
  profissional: ProfissionalSummary;
  onClick: () => void;
}

const ProfissionalCard = ({ profissional, onClick }: Props) => {
  const initial =
    profissional.nome?.trim()?.charAt(0)?.toUpperCase() ?? "P";

  return (
    <div
      className="card h-100 shadow-sm border-0 cursor-pointer"
      onClick={onClick}
      role="button"
    >
      <div className="card-body d-flex flex-column">
        {/* Cabeçalho */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
            style={{ width: 48, height: 48, fontSize: 20, fontWeight: 700 }}
          >
            {initial}
          </div>

          <div>
            <h6 className="fw-bold mb-0">{profissional.nome}</h6>
            <small className="text-muted">
              Conselho: {profissional.registro_conselho}
            </small>
          </div>
        </div>

        {/* Corpo */}
        <div className="mt-auto">
          <p className="mb-0 small text-secondary">
            <strong>CPF:</strong> {profissional.cpf}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfissionalCard;
