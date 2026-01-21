"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { EspecialidadeResponse } from "./types";

interface Props {
  especialidade: EspecialidadeResponse;
  onClick?: () => void;
}

const EspecialidadeCard = ({ especialidade, onClick }: Props) => {
  return (
    <div
      className="card-item-bottom-line-rounded h-100 hover-shadow cursor-pointer bg-white"
      onClick={onClick}
      style={{
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
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
      <div className="card-body p-4 d-flex flex-column h-100">
        <div className="d-flex align-items-center mb-3">
          {/* Ícone / Letra inicial */}
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3 bg-gradient-vl text-white"
            style={{ width: "48px", height: "48px", minWidth: "48px" }}
          >
            {especialidade.nome.charAt(0).toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <h6
              className="card-title fw-bold mb-0 text-truncate"
              title={especialidade.nome}
            >
              {especialidade.nome}
            </h6>
          </div>
        </div>

        <p
          className="small text-muted mb-3 flex-grow-1"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {especialidade.descricao || "Sem descrição definida."}
        </p>

        <div className="mt-auto pt-3 border-top">
          <small className="text-secondary fw-bold">
            <FontAwesomeIcon icon={faTag} className="me-1" />
            Especialidade
          </small>
        </div>
      </div>
    </div>
  );
};

export default EspecialidadeCard;
