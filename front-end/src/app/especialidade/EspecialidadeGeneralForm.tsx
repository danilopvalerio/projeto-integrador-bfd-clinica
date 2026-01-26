"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeading, faAlignLeft } from "@fortawesome/free-solid-svg-icons";

interface EspecialidadeFormData {
  nome: string;
  descricao: string;
}

interface Props {
  data: EspecialidadeFormData;
  onChange: (field: keyof EspecialidadeFormData, value: string) => void;
  disabled?: boolean;
}

const EspecialidadeGeneralForm = ({
  data,
  onChange,
  disabled = false,
}: Props) => {
  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
          Informações Básicas
        </h6>
      </div>

      <div className="col-12">
        <label className="form-label small text-muted fw-bold">
          Nome da Especialidade
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faHeading}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline shadow-none"
            style={{ boxShadow: "none" }}
            placeholder="Ex: Ortodontia"
            value={data.nome}
            onChange={(e) => onChange("nome", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="col-12">
        <label className="form-label small text-muted fw-bold">Descrição</label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faAlignLeft}
            className="position-absolute top-20 start-0 mt-3 ms-3 text-secondary"
          />
          <textarea
            className="p-2 ps-5 w-100 form-control-underline shadow-none"
            style={{ boxShadow: "none" }}
            rows={3}
            placeholder="Detalhes sobre a especialidade..."
            value={data.descricao}
            onChange={(e) => onChange("descricao", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default EspecialidadeGeneralForm;
