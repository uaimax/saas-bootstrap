/** Hook para acessar informações do tenant (company) atual. */

import { useAuth, type User } from "@/features/auth/AuthContext";

/**
 * Tipo para representar informações do tenant.
 */
export interface TenantInfo {
  tenant: User["company"];
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
}

/**
 * Hook para acessar informações do tenant atual de forma consistente.
 * Usa o contexto de autenticação para obter dados da company do usuário.
 *
 * @returns Objeto com informações do tenant atual
 *
 * @example
 * const { tenant, tenantId, tenantName } = useTenant();
 * if (tenantId) {
 *   console.log(`Tenant atual: ${tenantName} (${tenantId})`);
 * }
 */
export function useTenant(): TenantInfo {
  const { user } = useAuth();

  const tenant = user?.company ?? null;
  const tenantId = tenant?.id.toString() ?? null;
  const tenantName = tenant?.name ?? null;
  const tenantSlug = tenant?.slug ?? null;

  return {
    tenant,
    tenantId,
    tenantName,
    tenantSlug,
  };
}


