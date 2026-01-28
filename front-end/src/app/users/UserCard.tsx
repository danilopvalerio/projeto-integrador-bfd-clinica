"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { UserSummary, UserType } from "./types";

interface Props {
  user: UserSummary;
  onClick: () => void;
}

const UserCard = ({ user, onClick }: Props) => {
  // Helper para cor do badge baseada no tipo
  const getRoleBadgeColor = (type: UserType) => {
    switch (type) {
      case UserType.GERENTE:
        return "bg-primary bg-opacity-10 text-primary";
      case UserType.PROFISSIONAL:
        return "bg-info bg-opacity-10 text-info";
      case UserType.RECEPCIONISTA:
        return "bg-warning bg-opacity-10 text-dark";
      default:
        return "bg-secondary bg-opacity-10 text-secondary";
    }
  };

  // CORREÇÃO: Garante que nome nunca seja null/undefined antes de usar charAt
  const safeName = user.nome || "Sem Nome";
  const initialLetter = safeName.charAt(0).toUpperCase();

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
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3 ${
              user.ativo
                ? "bg-gradient-vl text-white"
                : "bg-secondary text-white opacity-50"
            }`}
            style={{ width: "48px", height: "48px", minWidth: "48px" }}
          >
            {/* Usa a inicial segura */}
            {initialLetter}
          </div>

          <div className="overflow-hidden">
            <h6
              className="card-title fw-bold mb-0 text-truncate"
              title={safeName}
            >
              {safeName}
            </h6>
            <span
              className={`badge rounded-pill mt-1 ${
                user.ativo
                  ? "bg-success bg-opacity-10 text-success"
                  : "bg-danger bg-opacity-10 text-danger"
              }`}
            >
              {user.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <div className="flex-grow-1 d-flex align-items-center mb-3">
          <span
            className={`badge rounded-pill ${getRoleBadgeColor(user.tipo_usuario)}`}
          >
            <FontAwesomeIcon icon={faUserShield} className="me-1" />
            {user.tipo_usuario}
          </span>
        </div>

        <div className="mt-auto pt-3 border-top d-flex align-items-center text-muted">
          <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
          <small className="text-truncate" title={user.email}>
            {user.email}
          </small>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
