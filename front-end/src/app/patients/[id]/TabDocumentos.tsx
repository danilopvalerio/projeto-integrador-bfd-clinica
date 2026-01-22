"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faFileAlt,
  faDownload,
  faPlus,
  faSpinner,
  faFileWord,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

import api from "../../../utils/api";
import { getSignedUrl, uploadFileToBackend } from "../../../utils/fileStorage";
import {
  ProntuarioArquivo,
  TipoArquivoProntuario,
  TipoEntradaProntuario,
  ProntuarioEntity,
  ProntuarioEntrada,
} from "./../types";

interface DocComUrl extends ProntuarioArquivo {
  srcSegura: string;
}

export default function TabDocumentos() {
  const params = useParams();
  const [docs, setDocs] = useState<DocComUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // --- BUSCAR DOCUMENTOS (Mesma lógica de Imagens: Prontuário -> Entradas -> Arquivos) ---
  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Busca ID do Prontuário
      const resProntuario = await api.get<ProntuarioEntity>(
        `/patients/${params.id}/prontuario`
      );
      const idProntuario = resProntuario.data.id_prontuario;

      // 2. Busca Entradas
      const resEntradas = await api.get<ProntuarioEntrada[]>(
        `/prontuarios/${idProntuario}/entradas`
      );

      // 3. Flatten (Extrai arquivos das entradas)
      const todosArquivos = resEntradas.data.flatMap(
        (entrada) => entrada.arquivos || []
      );

      // 4. Filtra o que NÃO é Foto nem Radiografia (assume-se que seja Documento/Exame)
      const arquivosDoc = todosArquivos.filter(
        (f) =>
          f.tipo_documento !== TipoArquivoProntuario.FOTO &&
          f.tipo_documento !== TipoArquivoProntuario.RADIOGRAFIA
      );

      // 5. Gera URLs assinadas
      const docsResolvidos = await Promise.all(
        arquivosDoc.map(async (d) => {
          try {
            const url = await getSignedUrl(d.url_arquivo);
            return { ...d, srcSegura: url };
          } catch {
            return { ...d, srcSegura: "" };
          }
        })
      );

      setDocs(docsResolvidos.filter((d) => d.srcSegura !== ""));
    } catch (err) {
      console.error("Erro ao buscar documentos", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchDocs();
  }, [params.id, fetchDocs]);

  // --- LÓGICA DE UPLOAD ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !params.id) return;

    try {
      setUploading(true);

      // 1. Obter ID Prontuário
      const prontuarioRes = await api.get<ProntuarioEntity>(
        `/patients/${params.id}/prontuario`
      );
      const idProntuario = prontuarioRes.data.id_prontuario;

      // 2. Upload Físico (Storage)
      const path = await uploadFileToBackend(file);

      // 3. Criar Entrada Container
      const entradaRes = await api.post(
        `/prontuarios/${idProntuario}/entradas`,
        {
          tipo: TipoEntradaProntuario.OBSERVACAO_GERAL, // Ou EXAMES se houver esse tipo de entrada
          descricao: "Upload de documento via Aba Documentos",
        }
      );
      const idEntrada = entradaRes.data.id_entrada;

      // 4. Determinar Tipo de Documento (Lógica simples baseada em extensão ou padrão)
      // Aqui definimos como OUTROS ou EXAME, já que não é foto
      const tipoDoc = TipoArquivoProntuario.OUTRO;

      // 5. Vincular Arquivo
      await api.post(
        `/prontuarios/${idProntuario}/entradas/${idEntrada}/arquivos`,
        {
          nome_arquivo: file.name,
          url_arquivo: path,
          tipo_arquivo: file.type, // Mime type (application/pdf, etc)
          tipo_documento: tipoDoc,
          descricao: "Adicionado via Documentos",
        }
      );

      await fetchDocs();
    } catch (err) {
      alert("Erro ao enviar documento.");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Helper para escolher ícone
  const getIconForType = (mimeType: string) => {
    if (mimeType.includes("pdf")) return faFilePdf;
    if (mimeType.includes("word") || mimeType.includes("doc"))
      return faFileWord;
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
      return faFileExcel;
    return faFileAlt;
  };

  // Helper para cor do ícone
  const getColorForType = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "text-danger";
    if (mimeType.includes("word")) return "text-primary";
    if (mimeType.includes("excel")) return "text-success";
    return "text-secondary";
  };

  if (loading)
    return (
      <div className="p-5 text-center text-muted">Carregando documentos...</div>
    );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0 text-secondary">Documentos e Exames</h5>

        {/* Botão de Upload */}
        <label
          className={`btn btn-primary text-white fw-bold ${
            uploading ? "disabled" : ""
          }`}
          style={{ cursor: uploading ? "wait" : "pointer" }}
        >
          {uploading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
          ) : (
            <FontAwesomeIcon icon={faPlus} className="me-2" />
          )}
          {uploading ? "ENVIANDO..." : "NOVO DOC"}
          <input
            type="file"
            // Aceita PDF, Imagens, Word, Excel, Texto
            accept=".pdf, .doc, .docx, .xls, .xlsx, .txt, image/*"
            hidden
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {docs.length === 0 ? (
        <div
          className="card border-0 shadow-sm py-5 d-flex align-items-center justify-content-center bg-white"
          style={{ minHeight: "200px" }}
        >
          <div className="text-center">
            <FontAwesomeIcon
              icon={faFileAlt}
              className="text-secondary mb-3 opacity-25"
              size="4x"
            />
            <h5 className="text-secondary fw-normal">
              Nenhum documento encontrado.
            </h5>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {docs.map((doc) => {
            const isImage = doc.tipo_arquivo?.startsWith("image/");

            return (
              <div key={doc.id_arquivo} className="col-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm border-0">
                  {/* Área de Visualização (Icone ou Thumb Imagem) */}
                  <div className="ratio ratio-4x3 bg-light d-flex align-items-center justify-content-center overflow-hidden rounded-top">
                    {isImage ? (
                      <Image
                        src={doc.srcSegura}
                        alt={doc.nome_arquivo}
                        fill
                        className="object-fit-cover"
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center w-100 h-100">
                        <FontAwesomeIcon
                          icon={getIconForType(doc.tipo_arquivo || "")}
                          className={`${getColorForType(
                            doc.tipo_arquivo || ""
                          )} fs-1`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Corpo do Card */}
                  <div className="card-body p-3 d-flex flex-column justify-content-between">
                    <div className="mb-2">
                      <h6
                        className="card-title text-truncate fw-bold mb-1"
                        title={doc.nome_arquivo}
                        style={{ fontSize: "0.9rem" }}
                      >
                        {doc.nome_arquivo}
                      </h6>
                      <small
                        className="text-muted d-block"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(doc.data_upload).toLocaleDateString()} •{" "}
                        {doc.tipo_documento}
                      </small>
                    </div>

                    {/* Botão de Download */}
                    <a
                      href={doc.srcSegura}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-secondary btn-sm w-100 mt-2"
                    >
                      <FontAwesomeIcon icon={faDownload} className="me-2" />
                      Baixar
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
