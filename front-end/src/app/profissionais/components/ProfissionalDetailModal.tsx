"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faSave,
  faTrash,
  faExclamationTriangle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";

import type {
  ProfissionalDetail,
  ProfissionalFormData,
  UpdateProfissionalPayload,
} from "../types";

import ProfissionalGeneralForm from "./ProfissionalGeneralForm";
import ProfissionalEspecialidadesList from "./ProfissionalEspecialidadesList";
import ProfissionalServicosList from "./ProfissionalServicosList";
import UserCredentialsForm from "../../../components/UserCredentialsForm";

interface Props {
  profissionalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ProfissionalDetailModal = ({
  profissionalId,
  onClose,
  onSuccess,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados de Feedback
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const modalBodyRef = useRef<HTMLDivElement>(null);

  const [profissional, setProfissional] = useState<ProfissionalDetail | null>(
    null,
  );

  const [formData, setFormData] = useState<ProfissionalFormData>({
    nome: "",
    cpf: "",
    registro_conselho: "",
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    const fetchProfissional = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/professionals/${profissionalId}`);
        const data = response.data as ProfissionalDetail;

        setProfissional(data);

        setFormData({
          nome: data.usuario?.nome || "",
          cpf: data.cpf,
          registro_conselho: data.registro_conselho,
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchProfissional();
  }, [profissionalId]);

  const scrollToTop = () => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Update Dados Gerais
  const handleUpdateGeneral = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: UpdateProfissionalPayload = {
        registro_conselho: formData.registro_conselho ?? "",
        usuario: {
          nome: formData.nome ?? "",
        },
      };

      await api.patch(`/professionals/${profissionalId}`, payload);

      setSuccessMsg("Dados atualizados com sucesso!");
      scrollToTop();
      onSuccess(); // Apenas atualiza a lista no fundo

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(getErrorMessage(err));
      scrollToTop();
    } finally {
      setSaving(false);
    }
  };

  // --- CORREÇÃO AQUI NO DELETE ---
  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await api.delete(`/professionals/${profissionalId}`);

      // 1. Atualiza a lista no pai
      onSuccess();

      // 2. FORÇA O FECHAMENTO DO MODAL (Resolve o loading infinito)
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleting(false);
      setShowConfirmDelete(false);
      scrollToTop();
    }
  };

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onMouseDown={onClose}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered"
          role="document"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div
            className="modal-content border-0 rounded-4 shadow"
            style={{
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div className="modal-header bg-gradient-vl text-white rounded-top-4 d-flex justify-content-between align-items-center px-4 py-3 flex-shrink-0">
              <div>
                <h5 className="modal-title fw-bold mb-0">
                  Detalhes do Profissional
                </h5>
                {profissional && (
                  <small className="opacity-75">
                    {profissional.usuario?.nome} •{" "}
                    {profissional.registro_conselho}
                  </small>
                )}
              </div>

              <button
                className="btn btn-link text-white shadow-none"
                onClick={onClose}
                style={{ boxShadow: "none" }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Body Scrollable */}
            <div
              ref={modalBodyRef}
              className="modal-body p-4 overflow-auto flex-grow-1"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              {successMsg && (
                <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success rounded-3 d-flex align-items-center mb-3 animate-fade-in">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  <div>{successMsg}</div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 mb-3">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-secondary" />
                  <p className="text-muted small mt-2">
                    Carregando profissional...
                  </p>
                </div>
              ) : !profissional ? (
                <div className="text-center py-5 bg-white rounded-3 border border-dashed">
                  <p className="text-muted fw-bold mb-0">
                    Profissional não encontrado.
                  </p>
                </div>
              ) : (
                <>
                  {/* --- BLOCO 1: DADOS GERAIS --- */}
                  <div className="bg-white border rounded-4 p-4 shadow-sm mb-4">
                    <h6 className="fw-bold mb-3">Dados Gerais</h6>

                    <ProfissionalGeneralForm
                      value={formData}
                      onChange={setFormData}
                      mode="edit"
                    />

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                      <button
                        className="button-dark-grey rounded-pill px-4 fw-bold shadow-sm shadow-none"
                        style={{ boxShadow: "none" }}
                        onClick={handleUpdateGeneral}
                        disabled={saving || deleting}
                      >
                        <FontAwesomeIcon icon={faSave} className="me-2" />
                        {saving ? "Salvando..." : "Salvar"}
                      </button>

                      <button
                        className="button-delete rounded-pill px-4 fw-bold shadow-sm shadow-none"
                        style={{ boxShadow: "none" }}
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={deleting || saving}
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-2" />
                        {deleting ? "Excluindo..." : "Excluir"}
                      </button>
                    </div>
                  </div>

                  {/* --- BLOCO 2: DADOS DE ACESSO --- */}
                  <div className="mb-4">
                    <UserCredentialsForm
                      userId={profissional.id_usuario}
                      userTypeLabel="do Profissional"
                    />
                  </div>

                  {/* --- BLOCO 3: VÍNCULOS --- */}
                  <div className="row g-3">
                    <div className="col-lg-6">
                      <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
                        <h6 className="fw-bold mb-3">Especialidades</h6>
                        <ProfissionalEspecialidadesList
                          profissionalId={profissionalId}
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="bg-white border rounded-4 p-4 shadow-sm h-100">
                        <h6 className="fw-bold mb-3">Serviços</h6>
                        <ProfissionalServicosList
                          profissionalId={profissionalId}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 p-4 pt-0 flex-shrink-0 bg-light">
              <button
                className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-none"
                style={{ boxShadow: "none" }}
                onClick={onClose}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Confirmação Exclusão */}
      {showConfirmDelete && (
        <div
          className="modal-backdrop d-flex justify-content-center align-items-center animate-fade-in"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1070 }}
          onClick={() => setShowConfirmDelete(false)}
        >
          <div
            className="bg-white rounded-4 shadow p-4"
            style={{ maxWidth: "400px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="mb-3 text-warning">
                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
              </div>
              <h5 className="fw-bold text-secondary">Excluir Profissional?</h5>
              <p className="text-muted small mb-0">
                Essa ação é irreversível e removerá o acesso do usuário.
              </p>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-light text-secondary fw-bold px-4 rounded-pill shadow-none"
                style={{ boxShadow: "none" }}
                onClick={() => setShowConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger fw-bold px-4 rounded-pill d-flex align-items-center gap-2 shadow-none"
                style={{ boxShadow: "none" }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  <FontAwesomeIcon icon={faTrash} />
                )}
                <span>{deleting ? "Removendo..." : "Sim, remover"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfissionalDetailModal;
