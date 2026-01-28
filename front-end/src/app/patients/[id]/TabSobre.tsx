"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTag,
  faPlus,
  faTimes,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { PacienteSummary } from "../types";
import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";
import AlertModal from "../../../components/AlertModal";

// Definição local de Tag caso não esteja no types.ts
interface PacienteTag {
  id_tag: string;
  nome: string;
  id_paciente: string;
}

interface Props {
  paciente: PacienteSummary;
}

export default function TabSobre({ paciente }: Props) {
  const [loadingSave, setLoadingSave] = useState(false);

  // Estado do Formulário de Edição
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
  });

  // Estado das Tags
  const [tags, setTags] = useState<PacienteTag[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loadingTag, setLoadingTag] = useState(false);

  // Feedback
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    variant: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    variant: "success",
  });

  // Carrega dados iniciais e busca tags
  useEffect(() => {
    if (paciente) {
      setFormData({
        // ALTERAÇÃO: Lê o nome de paciente.usuario.nome
        nome: paciente.usuario?.nome || "",
        cpf: paciente.cpf,
        data_nascimento: paciente.data_nascimento
          ? new Date(paciente.data_nascimento).toISOString().split("T")[0]
          : "",
      });
      fetchTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paciente]);

  const fetchTags = async () => {
    try {
      const res = await api.get<PacienteTag[]>(
        `/patients/${paciente.id_paciente}/tags`,
      );
      setTags(res.data);
    } catch (err) {
      console.error("Erro ao carregar tags", err);
    }
  };

  // --- Ações de Edição ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingSave(true);

      // ALTERAÇÃO: Envia o nome dentro do objeto usuario
      await api.patch(`/patients/${paciente.id_paciente}`, {
        cpf: formData.cpf,
        data_nascimento: new Date(formData.data_nascimento).toISOString(),
        usuario: {
          nome: formData.nome,
        },
      });

      setAlert({
        isOpen: true,
        message: "Dados atualizados com sucesso!",
        variant: "success",
      });
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  // --- Ações de Tags ---
  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      setLoadingTag(true);
      const res = await api.post(`/patients/${paciente.id_paciente}/tags`, {
        nome: newTag.trim(),
      });

      setTags([...tags, res.data]);
      setNewTag("");
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setLoadingTag(false);
    }
  };

  const handleDeleteTag = async (id_tag: string) => {
    try {
      await api.delete(`/patients/tags/${id_tag}`);
      setTags(tags.filter((t) => t.id_tag !== id_tag));
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  return (
    <div className="row g-4 p-2">
      {/* Coluna Esquerda: Formulário */}
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-white border-bottom py-3">
            <h6 className="fw-bold mb-0 text-secondary">Dados Cadastrais</h6>
          </div>
          <div className="card-body p-4">
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small text-muted">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className="form-control fw-bold"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">CPF</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-muted">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.data_nascimento}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        data_nascimento: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="btn btn-primary fw-bold px-4"
                  disabled={loadingSave}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {loadingSave ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Tags e Info Read-only */}
      <div className="col-lg-4">
        {/* Card Tags */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom py-3">
            <h6 className="fw-bold mb-0 text-secondary">
              <FontAwesomeIcon icon={faTag} className="me-2" />
              Etiquetas
            </h6>
          </div>
          <div className="card-body p-3">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nova tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                disabled={loadingTag}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button
                className="btn btn-outline-primary"
                onClick={handleAddTag}
                disabled={loadingTag}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id_tag}
                  className="badge bg-light text-dark border py-2 px-3 rounded-pill d-flex align-items-center gap-2"
                >
                  {tag.nome}
                  <FontAwesomeIcon
                    icon={faTimes}
                    className="text-muted cursor-pointer hover-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDeleteTag(tag.id_tag)}
                  />
                </span>
              ))}
              {tags.length === 0 && (
                <small className="text-muted">Nenhuma tag.</small>
              )}
            </div>
          </div>
        </div>

        {/* Card Contato (Read Only - Exatamente como estava) */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold text-secondary mb-3">Contato e Endereço</h6>
            <div className="mb-3">
              <div className="small text-muted mb-1">
                <FontAwesomeIcon icon={faPhone} className="me-1" /> Telefones
              </div>
              {paciente.telefones && paciente.telefones.length > 0 ? (
                paciente.telefones.map((tel) => (
                  <div key={tel.id_telefone} className="fw-bold text-dark">
                    {tel.telefone}{" "}
                    {tel.principal && (
                      <span className="text-success small">(Principal)</span>
                    )}
                  </div>
                ))
              ) : (
                <div>--</div>
              )}
            </div>
            <div>
              <div className="small text-muted mb-1">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />{" "}
                Localização
              </div>
              <div className="fw-bold text-dark">
                {paciente.endereco
                  ? `${paciente.endereco.cidade} - ${paciente.endereco.estado}`
                  : "--"}
              </div>
              <div className="small text-secondary">
                {paciente.endereco?.rua}, {paciente.endereco?.numero}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}
