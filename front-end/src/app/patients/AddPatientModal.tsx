"use client";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import api from "../../utils/api";
import { getErrorMessage } from "../../utils/errorUtils";
import PacienteGeneralForm, { PacienteFormData } from "./PacienteGeneralForm";
import { CreatePacientePayload, Sexo } from "./types";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddPacienteModal = ({ onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    email: "",
    senha: "",
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleChange = (field: keyof PacienteFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.sexo) {
      setError("Selecione o sexo do paciente.");
      setLoading(false);
      return;
    }
    if (!formData.email || !formData.senha) {
      setError("Informe o e-mail e a senha para o cadastro do usuário.");
      setLoading(false);
      return;
    }

    try {
      const telefonesPayload = [];
      if (formData.telefonePrincipal) {
        telefonesPayload.push({
          telefone: formData.telefonePrincipal,
          principal: true,
        });
      }
      if (formData.telefoneSecundario) {
        telefonesPayload.push({
          telefone: formData.telefoneSecundario,
          principal: false,
        });
      }

      // Payload ajustado para a nova estrutura: Nome vai dentro de usuário
      const payload: CreatePacientePayload = {
        cpf: formData.cpf,
        sexo: formData.sexo,
        data_nascimento: formData.data_nascimento,

        usuario: {
          nome: formData.nome, // <--- Nome aqui
          email: formData.email,
          senha: formData.senha!,
          tipo_usuario: "PACIENTE",
        },

        ...(telefonesPayload.length > 0 && { telefones: telefonesPayload }),
      };

      if (formData.rua && formData.cidade && formData.estado) {
        payload.endereco = {
          rua: formData.rua,
          numero: formData.numero || undefined,
          cidade: formData.cidade,
          estado: formData.estado,
        };
      }

      await api.post("/patients", payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      const err = error as AxiosError;
      if (err.response?.status === 409) {
        setError("Erro: CPF ou E-mail já cadastrados.");
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div className="modal-header border-bottom-0 p-4 pb-0">
            <h5 className="modal-title fw-bold text-secondary">
              Novo Paciente
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
            <form onSubmit={handleSubmit}>
              <PacienteGeneralForm
                data={formData}
                onChange={handleChange}
                disabled={loading}
                isEditing={false} // Permite cadastrar email/senha
              />
              <div className="d-flex justify-content-end align-items-center mt-4 pt-3 border-top gap-3">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none"
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="button-dark-grey px-4 py-2 rounded-pill shadow-sm fw-bold"
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Cadastrar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPacienteModal;
