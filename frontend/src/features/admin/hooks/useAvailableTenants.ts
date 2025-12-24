/** Hook para listar tenants (companies) disponíveis para o usuário. */

import { useState, useEffect } from "react";
import { apiClient } from "@/config/api";
import { useAuth } from "@/features/auth/AuthContext";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

/**
 * Hook para listar tenants disponíveis.
 * Super admins veem todos os tenants ativos.
 * Usuários normais veem apenas seu próprio tenant (se tiver).
 *
 * @returns Lista de tenants disponíveis e estado de loading
 */
export function useAvailableTenants() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenants = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Se for super admin, buscar todas as empresas
        // Se não, retornar apenas a empresa do usuário
        if (user.is_superuser) {
          const response = await apiClient.get("/companies/");
          // Lidar com paginação (results) ou array direto
          const companies = response.data.results || response.data || [];
          // Garantir que temos um array válido
          if (Array.isArray(companies)) {
            setTenants(companies);
          } else {
            console.warn("Resposta de /companies/ não é um array:", companies);
            setTenants([]);
          }
        } else if (user.company) {
          // Usuário normal: apenas seu próprio tenant
          setTenants([
            {
              id: user.company.id.toString(),
              name: user.company.name,
              slug: user.company.slug,
              created_at: "", // Não disponível no User.company
            },
          ]);
        } else {
          setTenants([]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar tenants:", err);
        setError(err.response?.data?.detail || "Erro ao carregar tenants");
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [user]);

  return { tenants, loading, error };
}

