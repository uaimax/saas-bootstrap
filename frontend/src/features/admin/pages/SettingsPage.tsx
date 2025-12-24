/** Página de Configurações Admin usando Admin UI Kit. */

import { LayoutDashboard, Users, Settings } from "lucide-react";
import { MainLayout } from "@/features/admin/components/layout/MainLayout";
import { useTenant } from "@/features/admin/hooks/useTenant";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/**
 * Página de Configurações Admin demonstrando o uso do Admin UI Kit.
 * Mostra informações do tenant, permissões e configurações básicas.
 */
export default function SettingsPage() {
  const { tenant, tenantName, tenantId, tenantSlug } = useTenant();
  const { hasPermission, permissions } = usePermissions();

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Leads",
      href: "/admin/leads",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Configurações",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];

  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Configurações" },
  ];

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      title="Configurações"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Informações do Tenant */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tenant</CardTitle>
            <CardDescription>Dados do tenant atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-sm font-medium">{tenantName || "N/A"}</p>
              </div>
              {tenantId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-medium">{tenantId}</p>
                </div>
              )}
              {tenantSlug && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="text-sm font-medium">{tenantSlug}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissões do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Permissões do Usuário</CardTitle>
            <CardDescription>Permissões RBAC do usuário atual</CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total de permissões:</span>
                  <Badge>{permissions.length}</Badge>
                </div>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {permissions.map((perm, index) => (
                    <Badge key={index} variant="secondary">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhuma permissão configurada. O backend ainda não retorna permissões no objeto User.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Configurações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">Alterar tema claro/escuro</p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">Gerenciar notificações</p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Idioma</p>
                <p className="text-sm text-muted-foreground">Alterar idioma da interface</p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Verificação de Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Permissões</CardTitle>
            <CardDescription>Verificação de permissões específicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">leads.view</span>
                <Badge variant={hasPermission("leads.view") ? "default" : "secondary"}>
                  {hasPermission("leads.view") ? "Permitido" : "Negado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">leads.create</span>
                <Badge variant={hasPermission("leads.create") ? "default" : "secondary"}>
                  {hasPermission("leads.create") ? "Permitido" : "Negado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">leads.delete</span>
                <Badge variant={hasPermission("leads.delete") ? "default" : "secondary"}>
                  {hasPermission("leads.delete") ? "Permitido" : "Negado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">admin.*</span>
                <Badge variant={hasPermission("admin.*") ? "default" : "secondary"}>
                  {hasPermission("admin.*") ? "Permitido" : "Negado"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}


