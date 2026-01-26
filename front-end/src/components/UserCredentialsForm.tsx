"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faLock,
  faEnvelope,
  faEye,
  faEyeSlash,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import api from "../utils/api";
import { getErrorMessage } from "../utils/errorUtils";

// Importe suas interfaces do local correto (ex: src/modules/user/userDTOs.ts)
// Vou declará-las aqui para referência baseada no seu prompt, mas mova se necessário.
import { UserEntity } from "../app/profissionais/types"; // Ajuste o import conforme sua estrutura

// Interface específica para o Payload que vai para a API (O controller recebe 'senha', não 'senha_hash')
interface UserApiPayload {
  email?: string;
  senha?: string; // O front envia a senha crua
}

interface Props {
  userId: string;
  userTypeLabel?: string;
}

const UserCredentialsForm = ({
  userId,
  userTypeLabel = "do Usuário",
}: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // 1. Busca dados atuais do usuário (Tipado com UserEntity)
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setLoadingData(true);
      try {
        // Agora o response é tipado. O TS sabe que response.data tem 'email'
        const response = await api.get<UserEntity>(`/users/${userId}`);

        if (response.data) {
          setEmail(response.data.email);
        }
      } catch (err) {
        console.error("Erro ao buscar usuário vinculado", err);
        setMessage({ type: "error", text: "Erro ao carregar e-mail atual." });
      } finally {
        setLoadingData(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 2. Salva as alterações
  const handleUpdate = async () => {
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }

    setSaving(true);
    try {
      // Cria o payload estritamente tipado
      const payload: UserApiPayload = { email };

      // Só adiciona a senha se o usuário digitou algo
      if (password) {
        payload.senha = password;
      }

      await api.patch<UserEntity>(`/users/${userId}`, payload);

      setMessage({
        type: "success",
        text: `Acesso ${userTypeLabel} atualizado com sucesso!`,
      });
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="text-center py-3">
        <span className="spinner-border spinner-border-sm text-secondary me-2"></span>
        <small className="text-muted">Carregando dados de acesso...</small>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
      <div className="d-flex align-items-center gap-2 mb-3 text-secondary">
        <FontAwesomeIcon icon={faUserShield} />
        <h6 className="fw-bold m-0">Acesso & Segurança</h6>
      </div>

      {message && (
        <div
          className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"} py-2 small rounded-3`}
        >
          {message.text}
        </div>
      )}

      <div className="row g-3">
        {/* Email */}
        <div className="col-12">
          <label className="form-label small fw-bold text-muted">
            E-mail de Login
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <FontAwesomeIcon icon={faEnvelope} />
            </span>
            <input
              type="email"
              className="form-control border-start-0 ps-0 bg-light"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
            />
          </div>
        </div>

        {/* Senha */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">
            Nova Senha
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control border-start-0 ps-0 bg-light"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Alterar senha"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="input-group-text bg-light border-start-0 text-muted"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Confirmar Senha */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">
            Confirmar Senha
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-muted">
              <FontAwesomeIcon icon={faLock} />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control border-start-0 ps-0 bg-light"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              disabled={!password}
            />
          </div>
        </div>

        {/* Botão de Salvar Próprio */}
        <div className="col-12 d-flex justify-content-end mt-2">
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-none"
            onClick={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            Atualizar Acesso
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCredentialsForm;
