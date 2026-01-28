"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faMobile,
  faTablet,
  faCheckCircle,
  faExclamationCircle,
  faUser,
  faUserMd,
  faUserTie,
  faHospitalUser,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

import { Log, LogUsuario } from "./types";

interface LogRowProps {
  log: Log;
  onClick: () => void;
}

export function LogRow({ log, onClick }: LogRowProps) {
  // --- Helpers de Formatação ---
  const getDeviceIcon = (ua?: string) => {
    if (!ua) return faDesktop;
    const lower = ua.toLowerCase();
    if (
      lower.includes("mobile") ||
      lower.includes("android") ||
      lower.includes("iphone")
    )
      return faMobile;
    if (lower.includes("ipad") || lower.includes("tablet")) return faTablet;
    return faDesktop;
  };

  const formatUserAgent = (ua?: string) => {
    if (!ua) return "-";
    // ... (lógica de user agent mantida igual, omitida aqui para brevidade)
    if (ua.length > 30) return ua.substring(0, 27) + "...";
    return ua;
  };

  // --- Lógica Simplificada de User Info ---
  const resolveUserInfo = (usuario?: LogUsuario | null) => {
    if (!usuario) {
      return {
        nome: "Visitante / Sistema",
        icon: faGear,
        role: "System",
      };
    }

    // Define ícone baseado no tipo_usuario
    let icon = faUser;
    const tipo = usuario.tipo_usuario || "USER";

    switch (tipo) {
      case "PROFISSIONAL":
        icon = faUserMd;
        break;
      case "PACIENTE":
      case "CLIENTE":
        icon = faHospitalUser;
        break;
      case "GERENTE":
      case "RECEPCIONISTA":
        icon = faUserTie;
        break;
      default:
        icon = faUser;
    }

    return {
      nome: usuario.nome || usuario.email, // Nome direto do usuário
      icon: icon,
      role: tipo, // Exibe o tipo (cargo)
    };
  };

  const userInfo = resolveUserInfo(log.usuario);

  return (
    <tr
      onClick={onClick}
      style={{ cursor: "pointer" }}
      className="log-row-hover"
    >
      {/* STATUS / TIPO */}
      <td className="ps-4">
        <div className="d-flex flex-column gap-1">
          {log.sucesso ? (
            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 border border-success border-opacity-10 w-auto align-self-start">
              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
              {log.tipo}
            </span>
          ) : (
            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 border border-danger border-opacity-10 w-auto align-self-start">
              <FontAwesomeIcon icon={faExclamationCircle} className="me-1" />
              FALHA
            </span>
          )}
        </div>
      </td>

      {/* DATA */}
      <td className="fw-medium text-dark" style={{ fontSize: "0.8rem" }}>
        {new Date(log.data).toLocaleString("pt-BR")}
      </td>

      {/* AÇÃO / DESCRIÇÃO */}
      <td>
        <div className="d-flex flex-column" style={{ maxWidth: "250px" }}>
          <span className="fw-bold text-dark text-truncate" title={log.acao}>
            {log.acao}
          </span>
          {log.descricao && (
            <span
              className="text-muted x-small text-truncate"
              title={log.descricao}
              style={{ fontSize: "0.75rem" }}
            >
              {log.descricao}
            </span>
          )}
        </div>
      </td>

      {/* USUÁRIO (SIMPLIFICADO) */}
      <td>
        <div className="d-flex align-items-center gap-2">
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center border ${!log.usuario ? "bg-secondary text-white" : "bg-light text-secondary"}`}
            style={{ width: 32, height: 32 }}
          >
            <FontAwesomeIcon icon={userInfo.icon} size="sm" />
          </div>
          <div className="d-flex flex-column">
            <span
              className="fw-bold text-dark text-truncate"
              style={{ maxWidth: "150px" }}
              title={userInfo.nome}
            >
              {userInfo.nome}
            </span>
            {log.usuario && (
              <span className="text-muted x-small">
                {log.usuario.email} • {userInfo.role}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* IP */}
      <td className="text-secondary font-monospace small">{log.ip || "-"}</td>

      {/* DISPOSITIVO */}
      <td className="text-secondary small">
        <div
          className="d-flex align-items-center gap-2"
          title={log.user_agent || ""}
        >
          <FontAwesomeIcon
            icon={getDeviceIcon(log.user_agent)}
            className="opacity-50"
          />
          <span
            className="d-inline-block text-truncate"
            style={{ maxWidth: "120px" }}
          >
            {formatUserAgent(log.user_agent)}
          </span>
        </div>
      </td>
    </tr>
  );
}
