// src/app/patient/[id]/PacienteGeneralForm.tsx

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faIdCard,
  faCalendar,
  faVenusMars,
  faMapMarkerAlt,
  faPhone,
  faCity,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Sexo } from "./types";

export interface PacienteFormData {
  nome: string;
  cpf: string;
  sexo: Sexo; // ou string, dependendo de como está lá
  data_nascimento: string;
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  telefonePrincipal: string;
  telefoneSecundario: string;

  // MARQUE COMO OPCIONAL
  email?: string;
  senha?: string;
}

interface Props {
  data: PacienteFormData;
  onChange: (field: keyof PacienteFormData, value: string) => void;
  disabled?: boolean;
  isEditing?: boolean;
}

const PacienteGeneralForm = ({ data, onChange, disabled = false }: Props) => {
  return (
    <div className="row g-3">
      {/* --- DADOS PESSOAIS (Mantenha igual) --- */}
      <div className="col-12">
        <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
          Dados Pessoais
        </h6>
      </div>

      <div className="col-12">
        <label className="form-label small text-muted fw-bold">
          Nome Completo
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faUser}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="Ex: João da Silva"
            value={data.nome}
            onChange={(e) => onChange("nome", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">CPF</label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faIdCard}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
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

      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Sexo</label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faVenusMars}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <select
            className="p-2 ps-5 w-100 form-control-underline bg-transparent"
            value={data.sexo}
            onChange={(e) => onChange("sexo", e.target.value as Sexo)}
            disabled={disabled}
            required
          >
            <option value="" disabled>
              Selecione...
            </option>
            <option value={Sexo.MASCULINO}>Masculino</option>
            <option value={Sexo.FEMININO}>Feminino</option>
          </select>
        </div>
      </div>

      <div className="col-md-12">
        <label className="form-label small text-muted fw-bold">
          Data de Nascimento
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faCalendar}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            type="date"
            className="p-2 ps-5 w-100 form-control-underline"
            value={data.data_nascimento}
            onChange={(e) => onChange("data_nascimento", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      {/* --- DADOS DE ACESSO (Login) --- 
          ALTERAÇÃO: Removemos a condição !isEditing para permitir edição.
      */}
      <div className="col-12 mt-4">
        <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
          Dados de Acesso (Login)
        </h6>
      </div>

      {/* --- CONTATOS (Mantenha igual) --- */}
      <div className="col-12 mt-4">
        <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
          Contatos
        </h6>
      </div>

      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">
          Telefone Principal <span className="text-danger">*</span>
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faPhone}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="(00) 00000-0000"
            value={data.telefonePrincipal}
            onChange={(e) => onChange("telefonePrincipal", e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">
          Telefone Secundário{" "}
          <span className="small fw-normal text-muted">(Opcional)</span>
        </label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faMobileAlt}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            placeholder="(00) 00000-0000"
            value={data.telefoneSecundario}
            onChange={(e) => onChange("telefoneSecundario", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* --- ENDEREÇO (Mantenha igual) --- */}
      <div className="col-12 mt-4">
        <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">
          Endereço{" "}
          <span className="small fw-normal text-muted">(Opcional)</span>
        </h6>
      </div>

      <div className="col-md-8">
        <label className="form-label small text-muted fw-bold">Rua</label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            value={data.rua}
            onChange={(e) => onChange("rua", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="col-md-4">
        <label className="form-label small text-muted fw-bold">Número</label>
        <input
          className="p-2 w-100 form-control-underline"
          value={data.numero}
          onChange={(e) => onChange("numero", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Cidade</label>
        <div className="position-relative">
          <FontAwesomeIcon
            icon={faCity}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          />
          <input
            className="p-2 ps-5 w-100 form-control-underline"
            value={data.cidade}
            onChange={(e) => onChange("cidade", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="col-md-6">
        <label className="form-label small text-muted fw-bold">Estado</label>
        <input
          className="p-2 w-100 form-control-underline"
          maxLength={2}
          value={data.estado}
          onChange={(e) => onChange("estado", e.target.value.toUpperCase())}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default PacienteGeneralForm;
