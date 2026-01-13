"use client";

import { useEffect, useState } from "react";
import api from "../../utils/api";
import { PatientDetail, UpdatePatientPayload } from "./types";
import PatientGeneralForm from "./PatientGeneralForm";
import { getErrorMessage } from "../../utils/errorUtils";

interface Props {
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditPatientModal = ({ patientId, onClose, onSuccess }: Props) => {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PatientDetail>({
    id_paciente: "",
    nome_completo: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    id_usuario: "",
    id_endereco: ""
  });
  const [error, setError] = useState("");

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
    fetchData();
  }, [patientId]);

  const handleChange = (field: keyof PatientDetail, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload: UpdatePatientPayload = { ...formData };
      await api.patch(`/patients/${patientId}`, payload);
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) return <div className="spinner-border text-secondary"></div>;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content p-4">
          <h5>Editar Paciente</h5>
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSave}>
            <PatientGeneralForm data={formData} onChange={handleChange} />
            <div className="mt-3 d-flex justify-content-end gap-2">
              <button type="button" onClick={onClose}>Cancelar</button>
              <button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;
