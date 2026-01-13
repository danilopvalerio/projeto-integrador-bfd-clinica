"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faIdCard, faPhone, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

interface PatientFormData {
  nome_completo: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
}

interface Props {
  data: PatientFormData;
  onChange: (field: keyof PatientFormData, value: string) => void;
  disabled?: boolean;
}

const PatientGeneralForm = ({ data, onChange, disabled = false }: Props) => {
  return (
    <div className="row g-3">
      {/* Nome Completo */}
      <div className="col-12">
        <label className="form-label small text-muted fw-bold">Nome Completo</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faUser} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="Ex: João da Silva"
            value={data.nome_completo}
            onChange={(e) => onChange("nome_completo", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* CPF */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">CPF (Único)</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faIdCard} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={(e) => onChange("cpf", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* Telefone */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Telefone</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faPhone} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="(00) 00000-0000"
            value={data.telefone}
            onChange={(e) => onChange("telefone", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Data de Nascimento */}
      <div className="col-12">
        <label className="form-label small text-muted fw-bold">Data de Nascimento</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faCalendarAlt} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            type="date"
            className="p-2 ps-5 w-100 form-control-underline"
            value={data.data_nascimento}
            onChange={(e) => onChange("data_nascimento", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientGeneralForm;