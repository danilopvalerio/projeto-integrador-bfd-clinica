import api from "./api"; // Sua instância do Axios configurada

/**
 * Envia o arquivo para o Backend (Node/Express), que salvará no Supabase Privado.
 * Retorna o 'path' interno (ex: "prontuarios/user123/foto.jpg").
 */
export const uploadFileToBackend = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/arquivos/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.path;
};

/**
 * Troca o 'path' interno por uma URL assinada válida por 1 hora.
 */
export const getSignedUrl = async (path: string): Promise<string> => {
  // Se já for uma URL completa (legado ou externo), retorna ela mesma
  if (path.startsWith("http")) return path;

  const res = await api.post("/arquivos/url", { path });
  return res.data.url;
};
