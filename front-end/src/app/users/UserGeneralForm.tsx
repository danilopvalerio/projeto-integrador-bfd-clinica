"use client";

import { UserType } from "./types";

export interface UserFormData {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: UserType;
  ativo: boolean;
}

interface Props {
  data: UserFormData;
  onChange: <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K],
  ) => void;
  disabled?: boolean; // Desabilita TUDO
  roleDisabled?: boolean; // Desabilita SÓ o select de perfil
  mode: "create" | "edit";
}

const UserGeneralForm = ({
  data,
  onChange,
  disabled,
  roleDisabled,
  mode,
}: Props) => {
  return (
    <div className="row g-3">
      {/* Nome */}
      <div className="col-12">
        <label className="form-label fw-bold small text-secondary">
          Nome Completo
        </label>
        <input
          type="text"
          className="form-control rounded-pill shadow-sm border-light bg-light"
          placeholder="Ex: João da Silva"
          value={data.nome ?? ""}
          onChange={(e) => onChange("nome", e.target.value)}
          disabled={disabled}
          required
        />
      </div>

      {/* Email */}
      <div className="col-md-6">
        <label className="form-label fw-bold small text-secondary">
          E-mail
        </label>
        <input
          type="email"
          className="form-control rounded-pill shadow-sm border-light bg-light"
          placeholder="usuario@clinica.com"
          value={data.email ?? ""}
          onChange={(e) => onChange("email", e.target.value)}
          disabled={disabled}
          required
        />
      </div>

      {/* Perfil */}
      <div className="col-md-6">
        <label className="form-label fw-bold small text-secondary">
          Perfil de Acesso
        </label>
        <select
          className="form-select rounded-pill shadow-sm border-light bg-light cursor-pointer"
          value={data.tipo_usuario ?? UserType.RECEPCIONISTA}
          onChange={(e) => onChange("tipo_usuario", e.target.value as UserType)}
          // Desabilitado se o form todo estiver disabled OU se a regra de negócio exigir (roleDisabled)
          disabled={disabled || roleDisabled}
        >
          <option value={UserType.RECEPCIONISTA}>Recepcionista</option>
          <option value={UserType.GERENTE}>Gerente</option>
          <option value={UserType.PROFISSIONAL}>Profissional</option>
          <option value={UserType.CLIENTE}>Cliente</option>
        </select>
      </div>

      {/* Senha */}
      <div className="col-12">
        <label className="form-label fw-bold small text-secondary">
          {mode === "create" ? "Senha" : "Nova Senha (Opcional)"}
        </label>
        <input
          type="password"
          className="form-control rounded-pill shadow-sm border-light bg-light"
          placeholder={
            mode === "create"
              ? "Digite a senha..."
              : "Deixe em branco para manter a atual"
          }
          value={data.senha ?? ""}
          onChange={(e) => onChange("senha", e.target.value)}
          disabled={disabled}
          required={mode === "create"}
        />
      </div>

      {/* Status (Apenas na edição) */}
      {mode === "edit" && (
        <div className="col-12 mt-3">
          <div className="form-check form-switch">
            <input
              className="form-check-input cursor-pointer"
              type="checkbox"
              id="userActiveSwitch"
              checked={data.ativo ?? false}
              onChange={(e) => onChange("ativo", e.target.checked)}
              disabled={disabled} // Status geralmente segue a regra global de edição
            />
            <label
              className="form-check-label fw-bold small text-secondary ms-2"
              htmlFor="userActiveSwitch"
            >
              Usuário Ativo?
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGeneralForm;
