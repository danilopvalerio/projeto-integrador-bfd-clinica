"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { EspecialidadeResponse, CreateEspecialidadePayload } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import EspecialidadeGeneralForm from "./EspecialidadeGeneralForm";
import EspecialidadeProfissionaisList from "./EspecialidadeProfissionaisList";

interface Props {
  especialidadeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface LocalFormData {
  nome: string;
  descricao: string;
}

const EspecialidadeDetailModal = ({
  especialidadeId,
  onClose,
  onSuccess,
}: Props) => {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState<LocalFormData>({
    nome: "",
    descricao: "",
  });

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
        const res = await api.get<EspecialidadeResponse>(
          `/specialities/${especialidadeId}`
        );

        setFormData({
          nome: res.data.nome,
          descricao: res.data.descricao || "",
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };

    if (especialidadeId) fetchData();
  }, [especialidadeId]);

  const handleChange = (field: keyof LocalFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: CreateEspecialidadePayload = {
        nome: formData.nome,
        descricao: formData.descricao,
      };

      await api.patch(
        `/specialities/${especialidadeId}`,
        payload
      );

      setSuccessMsg("Especialidade atualizada com sucesso!");
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
        "Tem certeza que deseja excluir esta especialidade? Esta ação não pode ser desfeita."
      )
    )
      return;

    try {
      setSaving(true);

      await api.delete(
        `/specialities/${especialidadeId}`
      );

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
        style={{ backgroundColor: "rgba(0,0,0,0.48)" }}
      >
        <div className="spinner-border text-white"></div>
      </div>
    );
  }

  return (
    <div
      className="modal-backdrop d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.48)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog detail-box"
        style={{ maxWidth: "600px", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow rounded-4 d-flex flex-column"
          style={{ maxHeight: "90vh" }}
        >
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between">
            <h5 className="modal-title fw-bold text-secondary">
              Detalhes da Especialidade
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4 pt-2 flex-grow-1 overflow-auto">
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

            <form onSubmit={handleUpdate} className="d-flex flex-column gap-3">
              <EspecialidadeGeneralForm
                data={formData}
                onChange={handleChange}
                disabled={saving}
              />

              <EspecialidadeProfissionaisList
                especialidadeId={especialidadeId}
              />

              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-danger border-0 d-flex gap-2 align-items-center"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="small fw-bold">
                    Excluir Especialidade
                  </span>
                </button>

                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={onClose}
                  >
                    Fechar
                  </button>

                  <button
                    type="submit"
                    className="button-dark-grey px-4 py-2 rounded-pill"
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

export default EspecialidadeDetailModal;

