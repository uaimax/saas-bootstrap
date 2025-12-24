/** Componente seletor de empresa para usuários com acesso a múltiplas empresas. */

import { Check, ChevronsUpDown } from "lucide-react";
import { useTenant } from "@/features/admin/hooks/useTenant";
import { useAvailableTenants } from "@/features/admin/hooks/useAvailableTenants";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

/**
 * Componente seletor de empresa.
 * Exibido apenas para usuários com acesso a múltiplas empresas (super admins ou usuários com múltiplas empresas).
 *
 * @example
 * <TenantSelector />
 */
export function TenantSelector() {
  // TODOS OS HOOKS DEVEM SER CHAMADOS ANTES DE QUALQUER RETORNO CONDICIONAL
  const { user } = useAuth();
  const { tenantSlug } = useTenant();
  const { tenants, loading } = useAvailableTenants();
  const [open, setOpen] = useState(false);

  // Para super admins, sempre exibir seletor (mesmo com apenas 1 empresa ou nenhuma)
  // Para usuários normais, só exibir se houver mais de uma empresa
  const isSuperAdmin = user?.is_superuser === true;

  // Se for super admin e não houver empresa selecionada, selecionar a primeira automaticamente
  // Este useEffect DEVE estar antes de qualquer return condicional
  // IMPORTANTE: Só executa uma vez quando tenants são carregados e não há empresa selecionada
  useEffect(() => {
    if (isSuperAdmin && tenants.length > 0) {
      const currentSlug = localStorage.getItem("company_id") || localStorage.getItem("tenant_id");
      // Só definir se não houver empresa selecionada E se a empresa selecionada não estiver na lista
      if (!currentSlug) {
        const firstTenant = tenants[0];
        if (firstTenant?.slug) {
          localStorage.setItem("company_id", firstTenant.slug);
          localStorage.setItem("tenant_id", firstTenant.slug);
        }
      } else {
        // Verificar se a empresa selecionada ainda existe na lista
        const selectedTenantExists = tenants.some((t) => t.slug === currentSlug);
        if (!selectedTenantExists && tenants.length > 0) {
          // Se a empresa selecionada não existe mais, selecionar a primeira
          const firstTenant = tenants[0];
          if (firstTenant?.slug) {
            localStorage.setItem("company_id", firstTenant.slug);
            localStorage.setItem("tenant_id", firstTenant.slug);
          }
        }
      }
    }
  }, [isSuperAdmin, tenants.length]); // Só re-executar quando o número de tenants mudar

  // Agora podemos fazer retornos condicionais APÓS todos os hooks
  // Se ainda está carregando, não exibir nada
  if (loading) {
    return null;
  }

  // Se não há usuário, não exibir
  if (!user) {
    return null;
  }

  // Para super admins, sempre exibir (mesmo sem empresas)
  // Para usuários normais, só exibir se houver mais de uma empresa
  if (!isSuperAdmin && tenants.length <= 1) {
    return null;
  }

  const handleSelectTenant = (selectedSlug: string) => {
    try {
      // Atualizar empresa no localStorage
      localStorage.setItem("company_id", selectedSlug);
      localStorage.setItem("tenant_id", selectedSlug); // Compatibilidade

      // Fechar o popover
      setOpen(false);

      // Para super admins, não precisamos atualizar o perfil porque a company do user
      // não muda (super admins não têm company fixa). Apenas atualizamos o localStorage
      // e forçamos uma atualização dos dados da página.
      // Usar window.location.reload() temporariamente para garantir que tudo seja atualizado
      // TODO: Implementar atualização mais suave sem reload completo
      window.location.reload();
    } catch (error) {
      console.error("Erro ao trocar empresa:", error);
      // Se houver erro, pelo menos atualizar o localStorage
      localStorage.setItem("company_id", selectedSlug);
      localStorage.setItem("tenant_id", selectedSlug);
    }
  };

  // Para super admins, usar o localStorage diretamente ao invés de user.company
  // porque super admins podem não ter company no user, mas têm uma empresa selecionada
  const currentTenantSlug = isSuperAdmin
    ? localStorage.getItem("company_id") || localStorage.getItem("tenant_id")
    : tenantSlug;
  const selectedTenant = tenants.find((t) => t.slug === currentTenantSlug);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedTenant ? selectedTenant.name : "Selecionar empresa..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar empresa..." />
          <CommandList>
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            <CommandGroup>
              {tenants.map((t) => (
                <CommandItem
                  key={t.id}
                  value={t.slug}
                  onSelect={() => {
                    handleSelectTenant(t.slug);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentTenantSlug === t.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {t.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

