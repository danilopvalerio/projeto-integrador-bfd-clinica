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
  baseURL: "http://localhost:3333/api", // Ajuste se sua porta for diferente
  withCredentials: true, // Importante para enviar/receber Cookies (RefreshToken)
});

// Interceptor de Requisição: Adiciona o Token se existir
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: Trata o erro 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // --- CORREÇÃO AQUI ---
    // Se o erro for 401 E a URL for a de login, NÃO tente dar refresh.
    // Apenas rejeite o erro para que o LoginForm exiba "Senha incorreta".
    if (
      error.response?.status === 401 &&
      originalRequest.url?.includes("/sessions/login")
    ) {
      return Promise.reject(error);
    }

    // Se der 401 em outras rotas, tenta renovar o token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está renovando, coloca na fila
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
        // Tenta pegar novo token
        const response = await api.post("/sessions/refresh");
        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);

        // Configura o header padrão para as próximas chamadas
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Processa a fila de requisições pausadas
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar (refresh token expirado ou inválido)
        processQueue(refreshError, null);

        // Limpa tudo e redireciona pro login
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
  }
);

export default api;
