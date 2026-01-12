//src/app/services/ServicoDetailModal.tsx
"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { ServicoDetail, UpdateServicoPayload } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

// Sub-componentes
import ServicoGeneralForm from "./ServicoGeneralForm";
import ServicoProfissionaisList from "./ServicoProfissionaisList";

interface Props {
  servicoId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Interface local para o estado do formulário
// (Sem id_especialidade)
interface LocalFormData {
  nome: string;
  descricao: string;
  preco: number | string;
  duracao_estimada: number | string;
  ativo: boolean;
  preco_visivel_paciente: boolean;
}

const ServicoDetailModal = ({ servicoId, onClose, onSuccess }: Props) => {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Estado inicial limpo (sem especialidade)
  const [formData, setFormData] = useState<LocalFormData>({
    nome: "",
    descricao: "",
    preco: 0,
    duracao_estimada: 0,
    ativo: true,
    preco_visivel_paciente: true,
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Carregar Dados
  useEffect(() => {
    const fetchData = async () => {
      try {
        // CORREÇÃO: Rota atualizada para /services
        const res = await api.get<ServicoDetail>(`/services/${servicoId}`);
        const data = res.data;

        setFormData({
          nome: data.nome,
          descricao: data.descricao || "",
          preco: data.preco,
          duracao_estimada: data.duracao_estimada,
          // REMOVIDO: id_especialidade
          ativo: data.ativo,
          preco_visivel_paciente: data.preco_visivel_paciente,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };
    if (servicoId) fetchData();
  }, [servicoId]);

  const handleChange = (
    field: keyof LocalFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: UpdateServicoPayload = {
        ...formData,
        preco: Number(formData.preco),
        duracao_estimada: Number(formData.duracao_estimada),
        // id_especialidade não é enviado aqui
      };

      // CORREÇÃO: Rota atualizada para /services
      await api.patch(`/services/${servicoId}`, payload);

      setSuccessMsg("Serviço atualizado com sucesso!");
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
        "Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
      )
    )
      return;
    try {
      setSaving(true);
      // CORREÇÃO: Rota atualizada para /services
      await api.delete(`/services/${servicoId}`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

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
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between">
            <h5 className="modal-title fw-bold text-secondary">
              Detalhes do Serviço
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
              <ServicoGeneralForm
                data={formData}
                onChange={handleChange}
                disabled={saving}
              />

              {/* Lista de Profissionais (Assumindo que este componente lida com sua própria lógica de fetch/update interna ou via props, a rota dele também deve ser verificada internamente se ele fizer chamadas de API) */}
              <ServicoProfissionaisList servicoId={servicoId} />

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-danger border-0 d-flex align-items-center gap-2 px-2"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="small fw-bold">Excluir Serviço</span>
                </button>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className="btn btn-link text-secondary text-decoration-none"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicoDetailModal;
