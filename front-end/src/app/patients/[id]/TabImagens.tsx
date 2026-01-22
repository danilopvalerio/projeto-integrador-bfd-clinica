"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faDownload,
  faSearchPlus,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// Lightbox
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

import api from "../../../utils/api";
import { getSignedUrl, uploadFileToBackend } from "../../../utils/fileStorage";
import {
  ProntuarioArquivo,
  TipoArquivoProntuario,
  TipoEntradaProntuario,
  ProntuarioEntity,
  ProntuarioEntrada,
} from "./../types";

interface ImagemComUrl extends ProntuarioArquivo {
  srcSegura: string;
}

export default function TabImagens() {
  const params = useParams();
  const [imagens, setImagens] = useState<ImagemComUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [index, setIndex] = useState(-1);

  // --- BUSCAR IMAGENS (Via Prontuário -> Entradas) ---
  const fetchImagens = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Busca o ID do prontuário do paciente
      const resProntuario = await api.get<ProntuarioEntity>(
        `/patients/${params.id}/prontuario`
      );
      const idProntuario = resProntuario.data.id_prontuario;

      // 2. Busca todas as entradas do prontuário
      const resEntradas = await api.get<ProntuarioEntrada[]>(
        `/prontuarios/${idProntuario}/entradas`
      );

      // 3. Extrai todos os arquivos de todas as entradas (Flatten)
      // O 'flatMap' pega os arrays de arquivos de cada entrada e junta em um só
      const todosArquivos = resEntradas.data.flatMap(
        (entrada) => entrada.arquivos || []
      );

      // 4. Filtra apenas o que é FOTO ou RADIOGRAFIA
      const arquivosImagem = todosArquivos.filter(
        (f) =>
          f.tipo_documento === TipoArquivoProntuario.FOTO ||
          f.tipo_documento === TipoArquivoProntuario.RADIOGRAFIA
      );

      // 5. Gera as URLs assinadas (Signed URLs)
      const imagensResolvidas = await Promise.all(
        arquivosImagem.map(async (img) => {
          try {
            const url = await getSignedUrl(img.url_arquivo);
            return { ...img, srcSegura: url };
          } catch {
            return { ...img, srcSegura: "" };
          }
        })
      );

      setImagens(imagensResolvidas.filter((i) => i.srcSegura !== ""));
    } catch (err) {
      console.error("Erro ao buscar imagens", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) fetchImagens();
  }, [params.id, fetchImagens]);

  // --- LÓGICA DE UPLOAD ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !params.id) return;

    try {
      setUploading(true);

      // 1. Obter ID do Prontuário
      const prontuarioRes = await api.get<ProntuarioEntity>(
        `/patients/${params.id}/prontuario`
      );
      const idProntuario = prontuarioRes.data.id_prontuario;

      // 2. Upload Físico (Envia para o Backend -> Supabase)
      const path = await uploadFileToBackend(file);

      // 3. Criar uma Entrada "Container" para a imagem
      // Regra de Negócio: Arquivo não existe solto, precisa de uma entrada.
      const entradaRes = await api.post(
        `/prontuarios/${idProntuario}/entradas`,
        {
          tipo: TipoEntradaProntuario.OBSERVACAO_GERAL,
          descricao: "Upload de imagem via Galeria",
        }
      );
      const idEntrada = entradaRes.data.id_entrada;

      // 4. Determinar Tipo (Foto ou Radiografia)
      let tipoDoc = TipoArquivoProntuario.FOTO;
      if (file.name.toLowerCase().includes("raio"))
        tipoDoc = TipoArquivoProntuario.RADIOGRAFIA;

      // 5. Vincular Arquivo à Entrada criada
      await api.post(
        `/prontuarios/${idProntuario}/entradas/${idEntrada}/arquivos`,
        {
          nome_arquivo: file.name,
          url_arquivo: path,
          tipo_arquivo: file.type,
          tipo_documento: tipoDoc,
          descricao: "Adicionado pela aba Imagens",
        }
      );

      // Recarregar a lista
      await fetchImagens();
    } catch (err) {
      alert("Erro ao enviar imagem. Verifique o console.");
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const slides = imagens.map((img) => ({
    src: img.srcSegura,
    alt: img.nome_arquivo,
  }));

  if (loading)
    return (
      <div className="p-5 text-center text-muted">Carregando galeria...</div>
    );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0 text-secondary">Galeria de Imagens</h5>

        {/* Botão de Upload */}
        <label
          className={`btn btn-success text-white fw-bold ${
            uploading ? "disabled" : ""
          }`}
          style={{ cursor: uploading ? "wait" : "pointer" }}
        >
          {uploading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
          ) : (
            <FontAwesomeIcon icon={faPlus} className="me-2" />
          )}
          {uploading ? "ENVIANDO..." : "NOVO"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {imagens.length === 0 ? (
        <div
          className="card border-0 shadow-sm py-5 d-flex align-items-center justify-content-center bg-white"
          style={{ minHeight: "300px" }}
        >
          <div className="text-center">
            <FontAwesomeIcon
              icon={faImage}
              className="text-secondary mb-3 opacity-25"
              size="4x"
            />
            <h5 className="text-secondary fw-normal">
              Nenhuma imagem encontrada.
            </h5>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {imagens.map((img, i) => (
            <div key={img.id_arquivo} className="col-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0 overflow-hidden">
                <div
                  className="ratio ratio-1x1 bg-light position-relative"
                  style={{ cursor: "pointer" }}
                  onClick={() => setIndex(i)}
                >
                  <Image
                    src={img.srcSegura}
                    alt={img.nome_arquivo}
                    fill
                    className="object-fit-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0 hover-opacity-100 transition-all">
                    <FontAwesomeIcon
                      icon={faSearchPlus}
                      className="text-white fs-3"
                    />
                  </div>
                </div>
                <div className="card-body p-2 d-flex justify-content-between align-items-center">
                  <small
                    className="text-truncate"
                    style={{ maxWidth: "80%" }}
                    title={img.nome_arquivo}
                  >
                    {img.nome_arquivo}
                  </small>
                  <a
                    href={img.srcSegura}
                    target="_blank"
                    rel="noreferrer"
                    className="text-secondary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FontAwesomeIcon icon={faDownload} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Zoom]}
        zoom={{ maxZoomPixelRatio: 3 }}
      />
    </div>
  );
}
