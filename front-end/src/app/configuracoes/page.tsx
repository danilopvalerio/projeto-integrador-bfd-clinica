"use client";

import { useEffect, useState } from "react";
import { getProfile } from "./service";

export default function ConfiguracoesPage() {
  const [email, setEmail] = useState<string>("Carregando...");

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const data = await getProfile();
        setEmail(data.email);
      } catch (error) {
        console.log(error);
        setEmail("Erro ao carregar e-mail");
      }
    }

    carregarPerfil();
  }, []);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showEstabelecimentoModal, setShowEstabelecimentoModal] =
    useState(false);

  const [nomeEstabelecimento, setNomeEstabelecimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  function validarSenha(valor: string) {
    if (valor.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres");
      return false;
    }

    setPasswordError("");
    return true;
  }

  function salvarEmail() {
    // limpa o modal
    setNewEmail("");
    setEmailError("");
  }

  function validarEmail(valor: string) {
    if (!valor) {
      setEmailError("E-mail é obrigatório");
      return false;
    }

    if (!valor.includes("@") || !valor.includes(".")) {
      setEmailError("Informe um e-mail válido");
      return false;
    }

    setEmailError("");
    return true;
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Configurações da Conta</h1>
      <p className="text-muted mb-4">
        Gerencie as informações da sua conta e do estabelecimento.
      </p>

      {/* E-mail */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">E-mail</h5>
          <p className="card-text">
            <strong>E-mail atual:</strong> {email}
          </p>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowEmailModal(true)}
          >
            Alterar e-mail
          </button>
        </div>
      </div>

      {/* Senha */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Senha</h5>
          <p className="card-text text-muted">
            Altere a senha de acesso ao sistema.
          </p>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowPasswordModal(true)}
          >
            Alterar senha
          </button>
        </div>
      </div>

      {/* Dados do Estabelecimento */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Dados do Estabelecimento</h5>
          <p className="card-text text-muted">
            Atualize os dados básicos do estabelecimento.
          </p>
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowEstabelecimentoModal(true)}
          >
            Editar dados
          </button>
        </div>
      </div>
      {showEmailModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Alterar e-mail</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEmailModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Novo e-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="novo@email.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      validarEmail(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEmailModal(false);
                    setNewEmail("");
                    setEmailError("");
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!newEmail || !!emailError}
                  onClick={salvarEmail}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPasswordModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Alterar senha</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Senha atual</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nova senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validarSenha(e.target.value);
                    }}
                  />

                  {passwordError && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {passwordError}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setPasswordError("");
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn btn-primary"
                  disabled={!currentPassword || !newPassword || !!passwordError}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEstabelecimentoModal && (
        <div className="modal fade show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Dados do Estabelecimento</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEstabelecimentoModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nome do estabelecimento</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nomeEstabelecimento}
                    onChange={(e) => setNomeEstabelecimento(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Telefone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Endereço</label>
                  <input
                    type="text"
                    className="form-control"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEstabelecimentoModal(false)}
                >
                  Cancelar
                </button>

                <button className="btn btn-primary" disabled>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
