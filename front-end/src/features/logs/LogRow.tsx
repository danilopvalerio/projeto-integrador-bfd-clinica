"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faMobile,
  faTablet,
  faRightToBracket,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

import { Log } from "./types";

// =====================
// Tipagem
// =====================
interface LogRowProps {
  log: Log;
}

// =====================
// Componente
// =====================
export function LogRow({ log }: LogRowProps) {
  // ---------------------
  // Helpers
  // ---------------------

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return faDesktop;

    const lowerUA = ua.toLowerCase();

    if (
      lowerUA.includes("mobile") ||
      lowerUA.includes("android") ||
      lowerUA.includes("iphone")
    )
      return faMobile;

    if (lowerUA.includes("ipad") || lowerUA.includes("tablet"))
      return faTablet;

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
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

    if (browser !== "Desconhecido" && os !== "Desconhecido") {
      return `${browser} no ${os}`;
    }

    return ua.length > 50 ? ua.substring(0, 47) + "..." : ua;
  };

  const getTipoIcon = () => {
    if (log.tipo === "ACESSO") return faRightToBracket;
    return faGear; // SISTEMA
  };

  // =====================
  // Render
  // =====================
  return (
    <tr>
      {/* TIPO */}
      <td style={{ width: "120px" }}>
        <span className="badge rounded-pill bg-secondary-subtle text-secondary border">
          <FontAwesomeIcon icon={getTipoIcon()} className="me-1" />
          {log.tipo}
        </span>
      </td>

      {/* DATA */}
      <td className="fw-medium text-secondary">
        {new Date(log.data).toLocaleString("pt-BR")}
      </td>

      {/* AÇÃO / DESCRIÇÃO */}
      <td>
        <div className="d-flex flex-column">
          <span className="fw-bold text-dark">{log.acao}</span>
          {log.descricao && (
            <span className="small text-muted">{log.descricao}</span>
          )}
        </div>
      </td>

      {/* USUÁRIO */}
      <td>
        {log.usuario ? (
          <div className="d-flex flex-column">
            <span className="fw-bold text-dark">
              {log.usuario.nome || log.usuario.email}
            </span>
            <span
              className="small text-muted"
              style={{ fontSize: "0.75rem" }}
            >
              {log.usuario.email}
            </span>
          </div>
        ) : (
          <span className="text-muted fst-italic">Sistema</span>
        )}
      </td>

      {/* IP */}
      <td className="text-secondary font-monospace small">
        {log.ip || "N/A"}
      </td>

      {/* DISPOSITIVO */}
      <td className="text-secondary small">
        <div
          className="d-flex align-items-center"
          title={log.user_agent || ""}
        >
          <FontAwesomeIcon
            icon={getDeviceIcon(log.user_agent)}
            className="me-2 opacity-50"
          />
          <span
            className="d-inline-block text-truncate"
            style={{ maxWidth: "200px" }}
          >
            {formatUserAgent(log.user_agent)}
          </span>
        </div>
      </td>
    </tr>
  );
}
