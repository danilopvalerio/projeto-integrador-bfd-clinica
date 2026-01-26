"use client";

import { useState, useEffect } from "react";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import { PacienteDetail, UpdatePacientePayload, Sexo } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import PacienteGeneralForm, { PacienteFormData } from "./PacienteGeneralForm";

// IMPORT DO SEU COMPONENTE REUTILIZÁVEL PRONTO
import UserCredentialsForm from "../../components/UserCredentialsForm";

interface Props {
  pacienteId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PacienteDetailModal = ({ pacienteId, onClose, onSuccess }: Props) => {
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Estado apenas para o ID do usuário (necessário para o componente filho)
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  // O formData agora só cuida dos dados PESSOAIS (sem email/senha)
  const [formData, setFormData] = useState<PacienteFormData>({
    nome: "",
    cpf: "",
    sexo: "" as Sexo,
    data_nascimento: "",
    rua: "",
    numero: "",
    cidade: "",
    estado: "",
    telefonePrincipal: "",
    telefoneSecundario: "",
    // email e senha REMOVIDOS daqui, pois o UserCredentialsForm cuida disso
  });

  // Fecha no ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Carrega dados do Paciente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<PacienteDetail>(`/patients/${pacienteId}`);
        const data = res.data;

        const dateFormatted = data.data_nascimento
          ? new Date(data.data_nascimento).toISOString().split("T")[0]
          : "";

        const listaTelefones = data.telefones || [];
        const telObjPrincipal = listaTelefones.find(
          (t) => t.principal === true,
        );
        const telObjSecundario = listaTelefones.find(
          (t) => t.principal === false,
        );

        // Captura o ID do usuário vinculado para passar pro componente filho
        // ATENÇÃO: Certifique-se que o type PacienteDetail tem usuario.id_usuario
        if (data.usuario?.id_usuario) {
          setUsuarioId(data.usuario.id_usuario);
        } else if (data.id_usuario) {
          // Fallback se estiver na raiz
          setUsuarioId(data.id_usuario);
        }

        setFormData({
          nome: data.nome,
          cpf: data.cpf,
          sexo: data.sexo,
          data_nascimento: dateFormatted,
          rua: data.endereco?.rua || "",
          numero: data.endereco?.numero || "",
          cidade: data.endereco?.cidade || "",
          estado: data.endereco?.estado || "",
          telefonePrincipal: telObjPrincipal ? telObjPrincipal.telefone : "",
          telefoneSecundario: telObjSecundario ? telObjSecundario.telefone : "",
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };
    if (pacienteId) fetchData();
  }, [pacienteId]);

  const handleChange = (field: keyof PacienteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Salva APENAS dados pessoais (o componente filho salva o acesso sozinho)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const telefonesToSend: string[] = [];
      if (formData.telefonePrincipal)
        telefonesToSend.push(formData.telefonePrincipal);
      if (formData.telefoneSecundario)
        telefonesToSend.push(formData.telefoneSecundario);

      const payload: UpdatePacientePayload = {
        nome: formData.nome,
        sexo: formData.sexo as Sexo,
        cpf: formData.cpf,
        data_nascimento: formData.data_nascimento,
        telefones: telefonesToSend,
        endereco: {
          rua: formData.rua,
          numero: formData.numero,
          cidade: formData.cidade,
          estado: formData.estado,
        },
      };

      await api.patch(`/patients/${pacienteId}`, payload);

      setSuccessMsg("Dados pessoais atualizados com sucesso!");
      setTimeout(() => onSuccess(), 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return;
    try {
      setSaving(true);
      await api.delete(`/patients/${pacienteId}`);
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
        style={{
          maxWidth: "700px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow rounded-4"
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "100%",
          }}
        >
          {/* HEADER */}
          <div className="modal-header border-bottom-0 p-4 pb-0 d-flex justify-content-between flex-shrink-0">
            <h5 className="modal-title fw-bold text-secondary">
              Detalhes do Paciente
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* BODY SCROLLABLE */}
          <div
            className="modal-body p-4 pt-2 overflow-auto"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            {/* ALERTAS */}
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

            {/* --- BLOCO 1: DADOS PESSOAIS --- */}
            <form onSubmit={handleUpdate} className="mb-4">
              <div className="bg-white border rounded-4 p-4 shadow-sm">
                <h6 className="fw-bold mb-3 text-secondary">Dados Pessoais</h6>

                <PacienteGeneralForm
                  data={formData}
                  onChange={handleChange}
                  disabled={saving}
                  isEditing={true}
                />

                <div className="text-end mt-3 border-top pt-3">
                  <button
                    type="submit"
                    className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold border-0"
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar Dados Pessoais"}
                  </button>
                </div>
              </div>
            </form>

            {/* --- BLOCO 2: DADOS DE ACESSO (UserCredentialsForm) --- */}
            {/* Aqui usamos o componente pronto. Ele vai buscar o email e gerenciar a senha sozinho usando o usuarioId */}
            {usuarioId && (
              <div className="mb-4">
                <UserCredentialsForm
                  userId={usuarioId}
                  userTypeLabel="do Paciente"
                />
              </div>
            )}

            {/* --- BLOCO 3: ZONA DE PERIGO --- */}
            <div className="mt-2 text-muted fst-italic small text-center">
              * Para excluir o paciente, use o botão abaixo.
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-danger border-0 d-flex align-items-center gap-2 px-2"
                onClick={handleDelete}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span className="small fw-bold">Excluir Paciente</span>
              </button>
              <button
                type="button"
                className="btn btn-link text-secondary text-decoration-none"
                onClick={onClose}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PacienteDetailModal;
