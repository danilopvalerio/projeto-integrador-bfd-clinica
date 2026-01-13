"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { PatientDetail, UpdatePatientPayload } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import PatientGeneralForm from "./PatientGeneralForm";

interface Props {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PatientDetailModal = ({ patientId, onClose, onSuccess }: Props) => {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState<PatientDetail>({
    id_paciente: "",
    nome_completo: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    id_usuario: "",
    id_endereco: ""
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
        const res = await api.get<PatientDetail>(`/patients/${patientId}`);
        setFormData(res.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload: UpdatePatientPayload = { ...formData };
      await api.patch(`/patients/${patientId}`, payload);
      setSuccessMsg("Dados atualizados com sucesso!");
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir este paciente? Esta ação é irreversível.")) return;
    try {
      setSaving(true);
      await api.delete(`/patients/${patientId}`);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="modal-backdrop d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
      <div className="modal-dialog detail-box" style={{ maxWidth: "650px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between">
            <h5 className="modal-title fw-bold text-secondary">Detalhes do Paciente</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 pt-2">
            {error && <div className="alert alert-danger small py-2 rounded-3 mb-3">{error}</div>}
            {successMsg && <div className="alert alert-success small py-2 rounded-3 mb-3">{successMsg}</div>}

            <form onSubmit={handleUpdate}>
              <PatientGeneralForm
                data={formData}
                onChange={handleChange as any}
                disabled={saving}
              />

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-danger border-0 d-flex align-items-center gap-2 px-2"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span className="small fw-bold">Excluir Registro</span>
                </button>

                <div className="d-flex gap-3">
                  <button type="button" className="btn btn-link text-secondary text-decoration-none" onClick={onClose}>
                    Fechar
                  </button>
                  <button type="submit" className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold" disabled={saving}>
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

export default PatientDetailModal;