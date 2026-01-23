"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faStethoscope,
  faNotesMedical,
  faClipboardCheck,
  faUserMd,
  faSpinner,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";
import {
  ProntuarioEntity,
  ProntuarioEntrada,
  TipoEntradaProntuario,
  CreateEntradaPayload,
} from "./../types";
import AlertModal from "../../../components/AlertModal";
import ConfirmationModal from "../../../components/ConfirmationModal";

interface Props {
  pacienteId: string;
}

// 1. Definição da interface para a configuração visual (Fim do 'any')
interface EntryConfigItem {
  label: string;
  color: string;
  bg: string;
  icon: IconProp;
}

// 2. Tipagem estrita usando o Enum como chave
const ENTRY_CONFIG: Record<TipoEntradaProntuario, EntryConfigItem> = {
  [TipoEntradaProntuario.EVOLUCAO_VISITA]: {
    label: "Evolução / Visita",
    color: "text-primary",
    bg: "bg-primary",
    icon: faUserMd,
  },
  [TipoEntradaProntuario.DIAGNOSTICO]: {
    label: "Diagnóstico",
    color: "text-danger",
    bg: "bg-danger",
    icon: faStethoscope,
  },
  [TipoEntradaProntuario.PLANO_TRATAMENTO]: {
    label: "Plano de Tratamento",
    color: "text-success",
    bg: "bg-success",
    icon: faClipboardCheck,
  },
  [TipoEntradaProntuario.OBSERVACAO_GERAL]: {
    label: "Observação Geral",
    color: "text-secondary",
    bg: "bg-secondary",
    icon: faNotesMedical,
  },
  [TipoEntradaProntuario.ANAMNESE]: {
    label: "Anamnese",
    color: "text-info",
    bg: "bg-info",
    icon: faNotesMedical,
  },
};

export default function TabEvolucao({ pacienteId }: Props) {
  const [prontuario, setProntuario] = useState<ProntuarioEntity | null>(null);
  const [entradas, setEntradas] = useState<ProntuarioEntrada[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de Criação
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<TipoEntradaProntuario>(
    TipoEntradaProntuario.EVOLUCAO_VISITA,
  );
  const [textoEntrada, setTextoEntrada] = useState("");
  const [saving, setSaving] = useState(false);

  // Modais
  const [alert, setAlert] = useState({
    isOpen: false,
    message: "",
    variant: "success" as "success" | "error",
  });
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });

  // 3. Padrão Gold Standard: useCallback para estabilizar a função
  const fetchData = useCallback(async () => {
    if (!pacienteId) return;

    try {
      setLoading(true);
      // Busca ID do Prontuário
      const resProntuario = await api.get<ProntuarioEntity>(
        `/patients/${pacienteId}/prontuario`,
      );
      setProntuario(resProntuario.data);

      // Busca todas as entradas
      const resEntradas = await api.get<ProntuarioEntrada[]>(
        `/prontuarios/${resProntuario.data.id_prontuario}/entradas`,
      );

      // Filtra para NÃO mostrar Anamnese aqui
      const filtered = resEntradas.data.filter(
        (e) => e.tipo !== TipoEntradaProntuario.ANAMNESE,
      );

      setEntradas(filtered);
    } catch (err) {
      console.error(getErrorMessage(err)); // Loga o erro, mas não trava a UI
    } finally {
      setLoading(false);
    }
  }, [pacienteId]); // Dependência correta: só recria se o ID do paciente mudar

  // 4. useEffect chamando a função estabilizada
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Salvar Nova Entrada
  const handleSave = async () => {
    if (!prontuario) return;
    if (!textoEntrada.trim()) {
      setAlert({
        isOpen: true,
        message: "O texto da entrada é obrigatório.",
        variant: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const payload: CreateEntradaPayload = {
        tipo: selectedType,
        descricao: textoEntrada,
      };

      await api.post(
        `/prontuarios/${prontuario.id_prontuario}/entradas`,
        payload,
      );

      setAlert({
        isOpen: true,
        message: "Registro adicionado com sucesso!",
        variant: "success",
      });

      // Resetar form
      setTextoEntrada("");
      setIsCreating(false);

      // Recarregar lista (Reusa a função estabilizada)
      fetchData();
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Deletar Entrada
  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/prontuarios/entradas/${confirmDelete.id}`);

      // Otimista: remove da lista localmente sem precisar chamar a API de novo
      setEntradas((prev) =>
        prev.filter((e) => e.id_entrada !== confirmDelete.id),
      );

      setConfirmDelete({ isOpen: false, id: null });
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    }
  };

  if (loading)
    return (
      <div className="p-5 text-center text-muted">
        <FontAwesomeIcon icon={faSpinner} spin /> Carregando linha do tempo...
      </div>
    );

  return (
    <div className="p-4">
      {/* Cabeçalho e Botão de Adicionar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0 text-secondary">Linha do Tempo Clínica</h5>
        {!isCreating && (
          <button
            className="btn btn-primary fw-bold shadow-sm"
            onClick={() => setIsCreating(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Adicionar
            Registro
          </button>
        )}
      </div>

      {/* Formulário de Nova Entrada */}
      {isCreating && (
        <div className="card border-primary shadow-sm mb-4 animate-fade-in">
          <div className="card-header bg-primary bg-opacity-10 border-0">
            <h6 className="fw-bold text-primary mb-0">Novo Registro</h6>
          </div>
          <div className="card-body">
            {/* Seletor de Tipo (Badges clicáveis) */}
            <div className="d-flex gap-2 flex-wrap mb-3">
              {(Object.keys(ENTRY_CONFIG) as TipoEntradaProntuario[])
                .filter((t) => t !== TipoEntradaProntuario.ANAMNESE) // Opcional: esconder botão de anamnese aqui
                .map((tipo) => {
                  const config = ENTRY_CONFIG[tipo];
                  const isSelected = selectedType === tipo;
                  return (
                    <button
                      key={tipo}
                      onClick={() => setSelectedType(tipo)}
                      className={`btn btn-sm rounded-pill fw-bold d-flex align-items-center gap-2 ${
                        isSelected
                          ? `btn-${config.color.replace(
                              "text-",
                              "",
                            )} text-white`
                          : "btn-light text-secondary border"
                      }`}
                    >
                      <FontAwesomeIcon icon={config.icon} />
                      {config.label}
                    </button>
                  );
                })}
            </div>

            <textarea
              className="form-control mb-3"
              rows={4}
              placeholder="Descreva os detalhes deste registro..."
              value={textoEntrada}
              onChange={(e) => setTextoEntrada(e.target.value)}
              disabled={saving}
            />

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setIsCreating(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary fw-bold"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />{" "}
                    Salvando...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" /> Salvar
                    Registro
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Entradas (Timeline) */}
      <div className="d-flex flex-column gap-3">
        {entradas.length === 0 ? (
          <div className="text-center text-muted py-5 border rounded-3 bg-light">
            <FontAwesomeIcon
              icon={faNotesMedical}
              className="fs-1 mb-3 opacity-25"
            />
            <p>Nenhum registro clínico encontrado além da Anamnese.</p>
          </div>
        ) : (
          entradas.map((entrada) => {
            const config =
              ENTRY_CONFIG[entrada.tipo] ||
              ENTRY_CONFIG[TipoEntradaProntuario.OBSERVACAO_GERAL];
            const data = new Date(entrada.criado_em);

            return (
              <div
                key={entrada.id_entrada}
                className="card border-0 shadow-sm animate-fade-in"
              >
                <div className="card-body p-0 d-flex">
                  {/* Faixa Colorida Lateral */}
                  <div
                    className={`${config.bg}`}
                    style={{ width: "6px", borderRadius: "6px 0 0 6px" }}
                  ></div>

                  <div className="p-3 flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`badge rounded-pill ${config.bg} bg-opacity-10 ${config.color} d-flex align-items-center gap-2 px-3 py-2`}
                        >
                          <FontAwesomeIcon icon={config.icon} />
                          {config.label}
                        </span>
                        <small className="text-muted ms-2">
                          {data.toLocaleDateString()} às{" "}
                          {data.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>

                      {/* Botão de Excluir */}
                      <button
                        className="btn btn-sm text-secondary hover-danger opacity-50"
                        onClick={() =>
                          setConfirmDelete({
                            isOpen: true,
                            id: entrada.id_entrada,
                          })
                        }
                        title="Excluir registro"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>

                    <div
                      className="text-dark"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {entrada.descricao}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modais de Controle */}
      <AlertModal
        isOpen={alert.isOpen}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        title="Excluir Registro"
        message="Tem certeza que deseja remover este registro do histórico? Esta ação não pode ser desfeita."
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />
    </div>
  );
}
