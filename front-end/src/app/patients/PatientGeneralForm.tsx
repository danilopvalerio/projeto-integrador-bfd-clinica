"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faIdCard, 
  faPhone, 
  faCalendarAlt, 
  faEnvelope, 
  faVenusMars, 
  faLink 
} from "@fortawesome/free-solid-svg-icons";
import { PatientDetail, CreatePatientPayload } from "./types";

// Usamos um tipo união ou Partial para permitir que o form aceite ambos os tipos de dados
interface Props {
  data: PatientDetail | CreatePatientPayload;
  onChange: (field: any, value: string) => void;
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

      {/* Email */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Email</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faEnvelope} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            type="email"
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="exemplo@email.com"
            value={data.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Sexo */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Sexo</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faVenusMars} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <select
            className="p-2 ps-5 w-100 form-control-underline"
            value={data.sexo || ""}
            onChange={(e) => onChange("sexo", e.target.value)}
            disabled={disabled}
          >
            <option value="">Selecione</option>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
      </div>

      {/* Data de Nascimento */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Data de Nascimento</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faCalendarAlt} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            type="date"
            className="p-2 ps-5 w-100 form-control-underline"
            value={data.data_nascimento || ""}
            onChange={(e) => onChange("data_nascimento", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* ID Usuário (FK) */}
      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Vínculo de Usuário (UUID)</label>
        <div className="position-relative">
          <FontAwesomeIcon icon={faLink} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="ID do Usuário no sistema"
            value={data.id_usuario || ""}
            onChange={(e) => onChange("id_usuario", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PatientGeneralForm;