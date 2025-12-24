/** Serviço para autenticação social (OAuth2/OIDC). */

import { apiClient } from '@/config/api';

export interface SocialProvider {
  provider: string;
  name: string;
}

/**
 * Busca lista de providers sociais disponíveis no backend.
 */
export const getAvailableProviders = async (): Promise<SocialProvider[]> => {
  try {
    const response = await apiClient.get('/auth/providers/');
    return response.data.providers || [];
  } catch (error) {
    console.error('Erro ao buscar providers sociais:', error);
    return [];
  }
};

/**
 * Inicia o fluxo de autenticação social com um provider.
 * @param provider - Nome do provider (google, github, microsoft, etc.)
 * @param companySlug - Slug da empresa (opcional)
 */
export const initiateSocialLogin = (provider: string, companySlug?: string): void => {
  // Gerar state com company_slug e nonce para segurança (mantém tenant_slug para compatibilidade)
  const slug = companySlug || localStorage.getItem('company_id') || localStorage.getItem('tenant_id') || null;
  const stateData = {
    company_slug: slug,
    tenant_slug: slug, // Compatibilidade
    nonce: crypto.randomUUID(),
  };

  const state = btoa(JSON.stringify(stateData));

  // Redirecionar para endpoint OAuth do backend
  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
  const redirectUri = `${apiUrl}/auth/social/${provider}/login/?state=${state}`;

  window.location.href = redirectUri;
};

