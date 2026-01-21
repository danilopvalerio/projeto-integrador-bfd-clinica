"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStethoscope,
  faNotesMedical,
  faUserMd,
  faCalendarAlt,
  faPlus,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../../utils/api";
import { uploadFileToBackend, getSignedUrl } from "../../../utils/fileStorage";
import { getErrorMessage } from "../../../utils/errorUtils";
import {
  ProntuarioEntity,
  ProntuarioEntrada,
  TipoEntradaProntuario,
  TipoArquivoProntuario,
  ProntuarioArquivo,
} from "./../types";
import AlertModal from "../../../components/AlertModal";

interface Props {
  pacienteId: string;
}

// Extensão da interface para incluir a URL assinada temporária na visualização
interface ArquivoComUrl extends ProntuarioArquivo {
  signedUrl?: string;
}

interface EntradaComArquivos extends Omit<ProntuarioEntrada, "arquivos"> {
  arquivos?: ArquivoComUrl[];
}

export default function TabTratamentos({ pacienteId }: Props) {
  const [prontuario, setProntuario] = useState<ProntuarioEntity | null>(null);
  const [entradas, setEntradas] = useState<EntradaComArquivos[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para nova entrada de texto
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newType, setNewType] = useState<TipoEntradaProntuario>(
    TipoEntradaProntuario.EVOLUCAO_VISITA
  );

  const [processing, setProcessing] = useState<string | null>(null);

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    message: string;
    variant: "success" | "error";
  }>({
    isOpen: false,
    message: "",
    variant: "success",
  });

  // Helper para resolver URLs de todos os arquivos das entradas
  const resolverUrlsDasEntradas = async (
    lista: ProntuarioEntrada[]
  ): Promise<EntradaComArquivos[]> => {
    return Promise.all(
      lista.map(async (entrada) => {
        if (!entrada.arquivos?.length) return entrada;

        const arquivosResolvidos = await Promise.all(
          entrada.arquivos.map(async (arq) => {
            try {
              const url = await getSignedUrl(arq.url_arquivo);
              return { ...arq, signedUrl: url };
            } catch {
              return { ...arq, signedUrl: "#erro" };
            }
          })
        );

        return { ...entrada, arquivos: arquivosResolvidos };
      })
    );
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const resP = await api.get<ProntuarioEntity>(
        `/patients/${pacienteId}/prontuario`
      );
      setProntuario(resP.data);

      const resE = await api.get<ProntuarioEntrada[]>(
        `/prontuarios/${resP.data.id_prontuario}/entradas`
      );

      const entradasProcessadas = await resolverUrlsDasEntradas(resE.data);
      setEntradas(entradasProcessadas);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddEntry = async () => {
    if (!prontuario || !newNote.trim()) return;

    try {
      setProcessing("saving_entry");
      await api.post(`/prontuarios/${prontuario.id_prontuario}/entradas`, {
        tipo: newType,
        descricao: newNote,
      });

      setAlert({
        isOpen: true,
        message: "Registro adicionado com sucesso!",
        variant: "success",
      });
      setIsAdding(false);
      setNewNote("");
      await fetchData();
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idEntrada: string
  ) => {
    const file = e.target.files?.[0];
    if (!file || !prontuario) return;

    try {
      setProcessing(idEntrada);

      // 1. Upload para o Backend (retorna o path interno)
      const path = await uploadFileToBackend(file);

      // 2. Determinar tipo
      let tipoDoc = TipoArquivoProntuario.OUTRO;
      if (file.type.includes("image")) tipoDoc = TipoArquivoProntuario.FOTO;
      else if (file.type.includes("pdf"))
        tipoDoc = TipoArquivoProntuario.ATESTADO;

      // 3. Salvar metadados
      await api.post(
        `/prontuarios/${prontuario.id_prontuario}/entradas/${idEntrada}/arquivos`,
        {
          nome_arquivo: file.name,
          url_arquivo: path, // Salva o caminho relativo
          tipo_arquivo: file.type,
          tipo_documento: tipoDoc,
          descricao: "Anexo via timeline",
        }
      );

      await fetchData();
      setAlert({
        isOpen: true,
        message: "Arquivo anexado com sucesso!",
        variant: "success",
      });
    } catch (err) {
      setAlert({
        isOpen: true,
        message: getErrorMessage(err),
        variant: "error",
      });
    } finally {
      setProcessing(null);
      e.target.value = "";
    }
  };

  const getIcon = (tipo: TipoEntradaProntuario) => {
    switch (tipo) {
      case TipoEntradaProntuario.DIAGNOSTICO:
        return faStethoscope;
      case TipoEntradaProntuario.PLANO_TRATAMENTO:
        return faNotesMedical;
      case TipoEntradaProntuario.ANAMNESE:
        return faUserMd;
      default:
        return faCalendarAlt;
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-center text-muted">
        Carregando histórico clínico...
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0 text-secondary">Linha do Tempo</h5>
        <button
          className="btn btn-primary fw-bold"
          onClick={() => setIsAdding(!isAdding)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Novo Registro
        </button>
      </div>

      {isAdding && (
        <div className="card shadow-sm border-0 mb-4 bg-light">
          <div className="card-body">
            <h6 className="fw-bold mb-3">Nova Entrada</h6>
            <div className="mb-3">
              <select
                className="form-select"
                value={newType}
                // CORREÇÃO: Tipagem explícita aqui para evitar 'any'
                onChange={(e) =>
                  setNewType(e.target.value as TipoEntradaProntuario)
                }
              >
                <option value={TipoEntradaProntuario.EVOLUCAO_VISITA}>
                  Evolução / Visita
                </option>
                <option value={TipoEntradaProntuario.DIAGNOSTICO}>
                  Diagnóstico
                </option>
                <option value={TipoEntradaProntuario.PLANO_TRATAMENTO}>
                  Plano de Tratamento
                </option>
                <option value={TipoEntradaProntuario.OBSERVACAO_GERAL}>
                  Observação Geral
                </option>
              </select>
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                placeholder="Descreva o procedimento..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success fw-bold"
                onClick={handleAddEntry}
                disabled={!!processing}
              >
                {processing === "saving_entry" ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {entradas.length === 0 && (
          <div className="text-center text-muted py-5">
            Nenhum registro encontrado.
          </div>
        )}

        {entradas.map((entrada) => (
          <div key={entrada.id_entrada} className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center"
                    style={{ width: 40, height: 40 }}
                  >
                    <FontAwesomeIcon icon={getIcon(entrada.tipo)} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">
                      {entrada.tipo.replace(/_/g, " ")}
                    </h6>
                    <small className="text-muted">
                      {new Date(entrada.criado_em).toLocaleString("pt-BR")} •{" "}
                      {entrada.profissional?.nome || "Profissional"}
                    </small>
                  </div>
                </div>
              </div>

              <p
                className="mb-3 text-secondary mt-2"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {entrada.descricao}
              </p>

              <div className="border-top pt-3">
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {entrada.arquivos?.map((arq) => (
                    <a
                      key={arq.id_arquivo}
                      href={arq.signedUrl} // URL Assinada
                      target="_blank"
                      rel="noreferrer"
                      className="badge bg-light text-dark border text-decoration-none p-2 d-flex align-items-center"
                    >
                      <FontAwesomeIcon icon={faPaperclip} className="me-2" />
                      {arq.nome_arquivo}
                    </a>
                  ))}
                </div>

                <label
                  className={`btn btn-sm btn-outline-secondary ${
                    processing === entrada.id_entrada ? "disabled" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-1" />
                  {processing === entrada.id_entrada
                    ? "Enviando..."
                    : "Anexar Arquivo"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => handleFileUpload(e, entrada.id_entrada)}
                    disabled={processing === entrada.id_entrada}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertModal
        {...alert}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
    </div>
  );
}
