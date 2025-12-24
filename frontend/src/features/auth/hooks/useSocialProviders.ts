/** Hook para buscar e gerenciar providers sociais disponíveis. */

import { useState, useEffect } from 'react';
import { getAvailableProviders } from '@/features/auth/services/socialAuth';

export interface SocialProvider {
  provider: string;
  name: string;
}

export const useSocialProviders = () => {
  const [providers, setProviders] = useState<SocialProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const available = await getAvailableProviders();
        setProviders(available);
      } catch (error) {
        console.error('Erro ao carregar providers:', error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  return { providers, loading };
};

