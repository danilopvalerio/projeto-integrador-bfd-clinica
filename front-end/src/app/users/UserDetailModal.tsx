"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { UserDetail, UpdateUserPayload, UserType } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faLock } from "@fortawesome/free-solid-svg-icons";
import UserGeneralForm, { UserFormData } from "./UserGeneralForm";

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UserDetailModal = ({ userId, onClose, onSuccess }: Props) => {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Estado do usuário LOGADO (quem está mexendo no sistema)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    role: string;
  } | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    nome: "",
    email: "",
    senha: "",
    tipo_usuario: UserType.RECEPCIONISTA,
    ativo: true,
  });

  // Carrega usuário logado do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao ler usuário logado", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<UserDetail>(`/users/${userId}`);
        const data = res.data;

        setFormData({
          nome: data.nome,
          email: data.email,
          senha: "",
          tipo_usuario: data.tipo_usuario,
          ativo: data.ativo,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };
    if (userId) fetchData();
  }, [userId]);

  const handleChange = <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: UpdateUserPayload = {
        nome: formData.nome,
        email: formData.email,
        tipo_usuario: formData.tipo_usuario,
        ativo: formData.ativo,
      };

      if (formData.senha.trim()) {
        payload.senha_hash = formData.senha;
      }

      await api.patch(`/users/${userId}`, payload);

      setSuccessMsg("Usuário atualizado com sucesso!");
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.",
      )
    )
      return;
    try {
      setSaving(true);
      await api.delete(`/users/${userId}`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  // --- LÓGICA DE PERMISSÕES ---

  // 1. Sou eu mesmo?
  const isSelf = currentUser?.id === userId;

  // 2. Sou Gerente?
  const amIManager = currentUser?.role === UserType.GERENTE;

  // 3. Sou Recepcionista?
  const amIReceptionist = currentUser?.role === UserType.RECEPCIONISTA;

  // 4. O alvo é Gerente? (Baseado no dado carregado da API)
  const targetIsManager = formData.tipo_usuario === UserType.GERENTE;

  // REGRA 1: Recepcionista não pode editar NADA de um Gerente
  const isReadOnly = amIReceptionist && targetIsManager;

  // REGRA 2: Gerente não pode mudar o próprio cargo (para não se trancar fora)
  const isRoleDisabled = isSelf && amIManager;

  // REGRA 3: Gerente não pode se deletar. Recepcionista não pode deletar Gerente.
  const canDelete = !isSelf && !(amIReceptionist && targetIsManager);

  if (loadingData) {
    return (
      <div
        className="modal-backdrop d-flex justify-content-center align-items-center"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="spinner-border text-white"></div>
      </div>
    );
  }

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.48)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog detail-box"
        style={{ maxWidth: "700px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold text-secondary">
              Detalhes do Usuário
              {isReadOnly && (
                <span
                  className="badge bg-warning text-dark ms-2 small"
                  style={{ fontSize: "0.7rem" }}
                >
                  <FontAwesomeIcon icon={faLock} className="me-1" />
                  Somente Leitura
                </span>
              )}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4 pt-2">
            {error && (
              <div className="alert alert-danger small py-2 rounded-3 border-0 bg-danger bg-opacity-10 text-danger mb-3">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success small py-2 rounded-3 border-0 bg-success bg-opacity-10 text-success mb-3">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleUpdate}>
              <UserGeneralForm
                data={formData}
                onChange={handleChange}
                mode="edit"
                // Se for ReadOnly (Recepcionista vendo Gerente), desabilita tudo
                disabled={saving || isReadOnly}
                // Se for eu mesmo e sou gerente, desabilita só o select de cargo
                roleDisabled={isRoleDisabled}
              />

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                {/* Botão de Excluir (Escondido se não puder deletar) */}
                {canDelete ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger border-0 d-flex align-items-center gap-2 px-2"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    <span className="small fw-bold">Excluir Usuário</span>
                  </button>
                ) : (
                  <div></div> // Spacer para manter o layout
                )}

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className="btn btn-link text-secondary text-decoration-none"
                    onClick={onClose}
                  >
                    Fechar
                  </button>

                  {/* Botão de Salvar (Escondido se for ReadOnly) */}
                  {!isReadOnly && (
                    <button
                      type="submit"
                      className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold"
                      disabled={saving}
                    >
                      {saving ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
