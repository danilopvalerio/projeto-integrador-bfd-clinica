"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faHistory,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../utils/api";
import { getErrorMessage } from "../../../utils/errorUtils";
import {
  ProntuarioEntity,
  ProntuarioEntrada,
  TipoEntradaProntuario,
  CreateEntradaPayload,
} from "./../types";
import AlertModal from "../../../components/AlertModal";

interface Props {
  pacienteId: string;
}

export default function TabAnamnese({ pacienteId }: Props) {
  const [prontuario, setProntuario] = useState<ProntuarioEntity | null>(null);
  const [lastAnamnese, setLastAnamnese] = useState<ProntuarioEntrada | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado do formulário
  const [textoAnamnese, setTextoAnamnese] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    variant: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    variant: "success",
  });

  // 1. Busca o Prontuário ID
  const fetchProntuario = useCallback(async () => {
    try {
      // Isso agora baterá com a rota backend corrigida: /patients/:id/prontuario
      const res = await api.get<ProntuarioEntity>(
        `/patients/${pacienteId}/prontuario`
      );
      setProntuario(res.data);
      console.log(res);
      return res.data.id_prontuario;
    } catch (err) {
      console.error("Erro ao buscar prontuário", err);
      // Não damos setLoading(false) aqui pois queremos que o finally do useEffect cuide disso
      // ou tratamos especificamente. Se falhar o prontuário, não adianta buscar anamnese.
      return null;
    }
  }, [pacienteId]);

  // 2. Busca a última Anamnese
  const fetchAnamnese = useCallback(async (idProntuario: string) => {
    try {
      const res = await api.get<ProntuarioEntrada[]>(
        `/prontuarios/${idProntuario}/entradas?tipo=${TipoEntradaProntuario.ANAMNESE}`
      );

      if (res.data && res.data.length > 0) {
        setLastAnamnese(res.data[0]);
        setTextoAnamnese(res.data[0].descricao);
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.error(err);
    }
    // Removemos o finally aqui para controlar o loading no useEffect principal
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProntuario().then(async (id) => {
      if (isMounted) {
        if (id) {
          await fetchAnamnese(id);
        } else {
          // Se não achou prontuário (404), provavelmente é um paciente novo sem prontuário criado
          // Ou erro de conexão. Aqui forçamos o fim do loading.
          setIsEditing(true);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchProntuario, fetchAnamnese]);

  // ... (handleSave e handleNewAnamnese permanecem iguais) ...
  const handleSave = async () => {
    if (!prontuario) return;
    if (!textoAnamnese.trim()) {
      setAlert({
        isOpen: true,
        message: "Texto obrigatório.",
        variant: "error",
      });
      return;
    }

    try {
      setSaving(true);
      const payload: CreateEntradaPayload = {
        tipo: TipoEntradaProntuario.ANAMNESE,
        descricao: textoAnamnese,
      };

      await api.post(
        `/prontuarios/${prontuario.id_prontuario}/entradas`,
        payload
      );

      setAlert({
        isOpen: true,
        message: "Anamnese salva!",
        variant: "success",
      });
      await fetchAnamnese(prontuario.id_prontuario);
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

  const handleNewAnamnese = () => {
    setTextoAnamnese("");
    setIsEditing(true);
    setLastAnamnese(null);
  };

  if (loading)
    return (
      <div className="p-5 text-center text-muted">
        <FontAwesomeIcon icon={faSpinner} spin /> Carregando...
      </div>
    );

  // Helper para data segura
  const getDataFormatada = () => {
    if (!lastAnamnese?.criado_em) return "";
    const date = new Date(lastAnamnese.criado_em);
    return isNaN(date.getTime()) ? "" : date.toLocaleDateString();
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0 text-secondary">
          {isEditing ? "Nova Anamnese" : `Histórico: ${getDataFormatada()}`}
        </h5>
        {!isEditing && (
          <button
            className="btn btn-outline-primary fw-bold"
            onClick={handleNewAnamnese}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" /> Nova Avaliação
          </button>
        )}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          {isEditing ? (
            <>
              <div className="alert alert-info small">
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Criando novo registro histórico.
              </div>
              <textarea
                className="form-control mb-3"
                rows={12}
                value={textoAnamnese}
                onChange={(e) => setTextoAnamnese(e.target.value)}
                disabled={saving}
              />
              <div className="d-flex justify-content-end gap-2">
                {/* Só mostra cancelar se existir um histórico anterior para voltar */}
                {lastAnamnese && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setTextoAnamnese(lastAnamnese.descricao);
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  className="btn btn-primary fw-bold px-4"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faSave} className="me-2" />
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>
              {lastAnamnese?.descricao}
            </div>
          )}
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
