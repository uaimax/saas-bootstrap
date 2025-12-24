/** Configuração do cliente HTTP para API. */

import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

/** URL base da API.
 *
 * Em desenvolvimento: usa VITE_API_URL do .env
 * Em produção (junto): '/api/v1' (relativo, versionado)
 * Em produção (separado): VITE_API_URL do .env (deve incluir /v1)
 */
const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

/** Cliente HTTP configurado para API do backend.
 *
 * Características:
 * - Base URL configurável via variável de ambiente
 * - Credenciais incluídas (cookies/sessão)
 * - Timeout de 30 segundos
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Para cookies/sessão Django
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Interceptador de requisições para adicionar header X-Company-ID, JWT e CSRF token. */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Adicionar header X-Company-ID se disponível (mantém X-Tenant-ID para compatibilidade)
    const companyId = localStorage.getItem("company_id") || localStorage.getItem("tenant_id");
    if (companyId && config.headers) {
      config.headers["X-Company-ID"] = companyId;
      config.headers["X-Tenant-ID"] = companyId; // Compatibilidade
    }

    // Adicionar JWT token se disponível (prioridade sobre session)
    const accessToken = localStorage.getItem("access_token");
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Obter CSRF token dos cookies (se disponível e não usando JWT)
    if (!accessToken) {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      if (csrfToken && config.headers) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/** Interceptador de respostas para tratamento de erros. */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Tratamento de erros comuns
    if (error.response?.status === 401) {
      // Não autenticado - limpar dados
      localStorage.removeItem("company_id");
      localStorage.removeItem("tenant_id"); // Compatibilidade
      localStorage.removeItem("access_token");
      // Redirecionamento será feito pelo componente ProtectedRoute
    }
    if (error.response?.status === 403) {
      // Não autorizado
      console.error("Acesso negado:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
