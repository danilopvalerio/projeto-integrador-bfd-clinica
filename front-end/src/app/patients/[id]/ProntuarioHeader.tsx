// src/app/patient/[id]/ProntuarioHeader.tsx
"use client";

import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
// 1. Importe o IconProp do svg-core
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { PacienteSummary } from "./../types";

interface Props {
  paciente: PacienteSummary;
}

export default function ProntuarioHeader({ paciente }: Props) {
  const router = useRouter();

  const telefonePrincipal =
    paciente.telefones?.find((t) => t.principal) ?? paciente.telefones?.[0];

  const numeroWhatsapp = telefonePrincipal?.telefone.replace(/\D/g, "");

  const handleWhatsappClick = () => {
    if (!numeroWhatsapp) return;
    const message = encodeURIComponent(
      `Olá ${paciente.nome}, tudo bem? Entramos em contato referente ao seu atendimento.`
    );
    window.open(`https://wa.me/55${numeroWhatsapp}?text=${message}`, "_blank");
  };

  return (
    <div className="bg-white border-bottom px-3 px-md-4 py-3 sticky-top shadow-sm z-3">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => router.back()}
            className="btn btn-light border-0 rounded-circle text-secondary d-flex align-items-center justify-content-center p-0"
            style={{ width: 40, height: 40, transition: "background 0.2s" }}
            title="Voltar"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
              style={{ width: 48, height: 48 }}
            >
              <FontAwesomeIcon icon={faUserCircle} className="fs-3" />
            </div>

            <div style={{ lineHeight: "1.2" }}>
              <h6
                className="fw-bold text-dark m-0 text-truncate"
                style={{ maxWidth: "250px" }}
              >
                {paciente.nome}
              </h6>
              <small className="text-muted" style={{ fontSize: "0.85rem" }}>
                CPF: {paciente.cpf || "N/A"}
              </small>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          {numeroWhatsapp ? (
            <button
              className="btn btn-primary text-white rounded-pill fw-bold d-flex align-items-center gap-2 px-2 shadow-sm"
              onClick={handleWhatsappClick}
              title="Abrir WhatsApp"
            >
              {/* 2. AQUI ESTÁ A CORREÇÃO: use 'as IconProp' */}
              <FontAwesomeIcon icon={faWhatsapp as IconProp} className="fs-5" />

              <span className="d-none d-md-block">WhatsApp</span>
            </button>
          ) : (
            <span className="badge bg-secondary bg-opacity-10 text-secondary border px-3 py-2 rounded-pill">
              Sem telefone
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
