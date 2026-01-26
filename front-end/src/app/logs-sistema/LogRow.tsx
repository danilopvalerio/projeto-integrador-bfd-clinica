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
  onClick: () => void; // <--- NOVO
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
    let browser = "Desconhecido";
    let os = "Desconhecido";

    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone") || ua.includes("iOS")) os = "iOS";

    if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";

    if (browser !== "Desconhecido" && os !== "Desconhecido") {
      return `${browser} em ${os}`;
    }
    return ua.length > 30 ? ua.substring(0, 27) + "..." : ua;
  };

  // Fallback icon
  const faGearIconFallback = faGear;

  const resolveUserInfo = (usuario?: LogUsuario | null) => {
    if (!usuario)
      return {
        nome: "Visitante / Sistema",
        icon: faGearIconFallback,
        role: "System",
      };

    if (usuario.funcionario?.nome)
      return { nome: usuario.funcionario.nome, icon: faUserTie, role: "Staff" };
    if (usuario.profissional?.nome)
      return {
        nome: usuario.profissional.nome,
        icon: faUserMd,
        role: "Profissional",
      };
    if (usuario.paciente?.nome)
      return {
        nome: usuario.paciente.nome,
        icon: faHospitalUser,
        role: "Paciente",
      };

    return {
      nome: usuario.nome || usuario.email,
      icon: faUser,
      role: usuario.cargo || "User",
    };
  };

  const userInfo = resolveUserInfo(log.usuario);

  return (
    <tr
      onClick={onClick} // <--- Evento de Clique
      style={{ cursor: "pointer" }} // <--- Cursor Pointer
      className="log-row-hover" // Opcional: Adicione CSS se quiser highlight
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

      {/* USUÁRIO */}
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
                {log.usuario.email || userInfo.role}
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
