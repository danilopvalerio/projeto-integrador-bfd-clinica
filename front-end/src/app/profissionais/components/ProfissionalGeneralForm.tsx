"use client";

import type { ProfissionalFormData } from "../types";

interface Props {
  value: ProfissionalFormData;
  onChange: (next: ProfissionalFormData) => void;
  mode: "create" | "edit";
}

const ProfissionalGeneralForm = ({ value, onChange, mode }: Props) => {
  return (
    <div className="row g-3">
      {/* Nome */}
      <div className="col-md-6">
        <label className="form-label fw-bold">Nome</label>
        <input
          className="form-control rounded-pill shadow-none"
          style={{ boxShadow: "none" }}
          placeholder="Nome completo"
          value={value.nome ?? ""}
          onChange={(e) => onChange({ ...value, nome: e.target.value })}
          required
        />
      </div>

      {/* CPF */}
      <div className="col-md-6">
        <label className="form-label fw-bold">CPF</label>
        <input
          className="form-control rounded-pill shadow-none"
          style={{ boxShadow: "none" }}
          placeholder="CPF"
          value={value.cpf ?? ""}
          onChange={(e) => onChange({ ...value, cpf: e.target.value })}
          disabled={mode === "edit"}
          required
        />
      </div>

      {/* Registro Conselho */}
      <div className="col-md-6">
        <label className="form-label fw-bold">Registro do Conselho</label>
        <input
          className="form-control rounded-pill shadow-none"
          style={{ boxShadow: "none" }}
          placeholder="CRM, CRO, etc."
          value={value.registro_conselho ?? ""}
          onChange={(e) =>
            onChange({ ...value, registro_conselho: e.target.value })
          }
          required
        />
      </div>

      {/* Campos de usuário SOMENTE no create */}
      {mode === "create" && (
        <>
          <div className="col-md-6">
            <label className="form-label fw-bold">E-mail do Usuário</label>
            <input
              className="form-control rounded-pill shadow-none"
              style={{ boxShadow: "none" }}
              placeholder="email@dominio.com"
              value={value.email ?? ""}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Senha do Usuário</label>
            <input
              className="form-control rounded-pill shadow-none"
              style={{ boxShadow: "none" }}
              placeholder="Senha"
              type="password"
              value={value.senha ?? ""}
              onChange={(e) => onChange({ ...value, senha: e.target.value })}
              required
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ProfissionalGeneralForm;
