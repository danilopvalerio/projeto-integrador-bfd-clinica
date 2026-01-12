//src/app/services/ServicoCard.tsx
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faTag } from "@fortawesome/free-solid-svg-icons";
import { ServicoSummary } from "./types";

interface Props {
  servico: ServicoSummary;
  onClick: () => void;
}

const ServicoCard = ({ servico, onClick }: Props) => {
  // Formata moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

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
          {/* Ícone/Letra Inicial */}
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3 ${
              servico.ativo
                ? "bg-gradient-vl text-white"
                : "bg-secondary text-white opacity-50"
            }`}
            style={{ width: "48px", height: "48px", minWidth: "48px" }}
          >
            {servico.nome.charAt(0).toUpperCase()}
          </div>

          <div className="overflow-hidden">
            <h6
              className="card-title fw-bold mb-0 text-truncate"
              title={servico.nome}
            >
              {servico.nome}
            </h6>
            <span
              className={`badge rounded-pill mt-1 ${
                servico.ativo
                  ? "bg-success bg-opacity-10 text-success"
                  : "bg-danger bg-opacity-10 text-danger"
              }`}
            >
              {servico.ativo ? "Ativo" : "Inativo"}
            </span>
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
          {servico.descricao || "Sem descrição definida."}
        </p>

        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
          <small className="text-secondary fw-bold">
            <FontAwesomeIcon icon={faTag} className="me-1" />
            {formatCurrency(servico.preco)}
          </small>
          <small className="text-secondary">
            <FontAwesomeIcon icon={faClock} className="me-1" />
            {servico.duracao_estimada} min
          </small>
        </div>
      </div>
    </div>
  );
};

export default ServicoCard;
