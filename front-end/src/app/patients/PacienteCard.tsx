"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faMapMarkerAlt,
  faPhone,
  faFileMedical,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { PacienteSummary, Sexo } from "./types";
import { useRouter } from "next/navigation";

interface Props {
  paciente: PacienteSummary;
  onClick: () => void;
}

const PacienteCard = ({ paciente, onClick }: Props) => {
  const router = useRouter();

  // Pega o nome do Usuário vinculado
  const nomeDisplay = paciente.usuario?.nome || "Nome Indisponível";

  const telefone =
    paciente.telefones && paciente.telefones.length > 0
      ? paciente.telefones[0].telefone
      : "Sem telefone";

  const handleOpenProntuario = () => {
    router.push(`/patients/${paciente.id_paciente}`);
  };

  return (
    <div
      className="card-item-bottom-line-rounded h-100 bg-white"
      style={{
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div className="card-body p-4 d-flex flex-column h-100">
        <div className="d-flex align-items-center mb-3">
          {/* Avatar com Iniciais */}
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 me-3 text-white ${
              paciente.sexo === Sexo.MASCULINO
                ? "bg-primary bg-opacity-75"
                : "bg-danger bg-opacity-75"
            }`}
            style={{ width: "48px", height: "48px", minWidth: "48px" }}
          >
            {nomeDisplay.charAt(0).toUpperCase()}
          </div>

          <div className="overflow-hidden w-100">
            <h6
              className="card-title fw-bold mb-0 text-truncate"
              title={nomeDisplay}
            >
              {nomeDisplay}
            </h6>
            <div className="small text-muted d-flex align-items-center gap-1 mt-1">
              <FontAwesomeIcon icon={faIdCard} className="small" />
              <span>{paciente.cpf}</span>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="mt-auto pt-3 border-top d-flex flex-column gap-2">
          <div className="d-flex align-items-center text-secondary small">
            <FontAwesomeIcon icon={faPhone} className="me-2" width={14} />
            <span className="text-truncate">{telefone}</span>
          </div>

          <div className="d-flex align-items-center text-secondary small">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="me-2"
              width={14}
            />
            <span className="text-truncate">
              {paciente.endereco
                ? `${paciente.endereco.cidade} - ${paciente.endereco.estado}`
                : "Endereço não informado"}
            </span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="row g-2 mt-3 pt-2">
          <div className="col-12 col-md-5">
            <button
              type="button"
              className="button-dark-grey w-100 rounded-pill px-2 py-2 shadow-sm fw-bold"
              onClick={onClick}
            >
              <FontAwesomeIcon icon={faEye} className="me-2" />
              Exibir
            </button>
          </div>

          <div className="col-12 col-md-7">
            <button
              type="button"
              className="button-dark-grey w-100 rounded-pill px-2 py-2 shadow-sm fw-bold"
              onClick={handleOpenProntuario}
            >
              <FontAwesomeIcon icon={faFileMedical} className="me-2" />
              Prontuário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacienteCard;
