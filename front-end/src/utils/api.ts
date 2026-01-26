import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Fila de requisições que falharam enquanto o token estava sendo atualizado
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const api = axios.create({
  baseURL: "http://localhost:3333/api",
  withCredentials: true,
});

// Interceptor de Requisição
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 1. Ignorar erro 401 na rota de Login (deixa o form tratar "Senha incorreta")
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes("/sessions/login")
    ) {
      return Promise.reject(error);
    }

    // 2. Tratamento de Token Expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Log bonito avisando que o token expirou
      console.groupCollapsed("🔒 Autenticação: Token Expirado");
      console.warn("Recebido 401. Iniciando processo de refresh token...");

      if (isRefreshing) {
        console.info(
          "⏳ Já existe um refresh em andamento. Colocando requisição na fila...",
        );
        console.groupEnd();

        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.info("🔄 Solicitando novo token ao servidor...");

        const response = await api.post("/sessions/refresh");
        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        console.log("✅ Token renovado com sucesso!");
        console.log(
          `📤 Reenviando ${failedQueue.length + 1} requisições pendentes...`,
        );

        processQueue(null, accessToken);

        console.groupEnd(); // Fecha o grupo do console
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Falha ao renovar token. Sessão expirada.");
        console.groupEnd();

        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
