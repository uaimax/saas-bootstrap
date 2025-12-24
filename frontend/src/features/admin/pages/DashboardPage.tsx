/** Página de Dashboard Admin usando Admin UI Kit. */

import { LayoutDashboard, Users, Settings, BarChart3 } from "lucide-react";
import { MainLayout } from "@/features/admin/components/layout/MainLayout";
import { useTenant } from "@/features/admin/hooks/useTenant";
import { usePermissions } from "@/features/admin/hooks/usePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Página de Dashboard Admin demonstrando o uso do Admin UI Kit.
 * Mostra informações do tenant, permissões e cards de navegação.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { tenant, tenantName, tenantId } = useTenant();
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

  const breadcrumbs = [{ label: "Dashboard" }];

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      title="Dashboard"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-6">
        {/* Informações do Tenant */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tenant</CardTitle>
            <CardDescription>Dados do tenant atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Nome:</span>{" "}
                <span className="font-medium">{tenantName || "N/A"}</span>
              </div>
              {tenantId && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">ID:</span>{" "}
                  <span className="font-medium">{tenantId}</span>
                </div>
              )}
              {tenant?.slug && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Slug:</span>{" "}
                  <span className="font-medium">{tenant.slug}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Permissões</CardTitle>
            <CardDescription>Permissões do usuário atual</CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Total: {permissions.length} permissões
                </div>
                <div className="flex flex-wrap gap-2">
                  {permissions.slice(0, 10).map((perm, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                  {permissions.length > 10 && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      +{permissions.length - 10} mais
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhuma permissão configurada. O backend ainda não retorna permissões.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards de Navegação */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/admin/leads")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Leads
              </CardTitle>
              <CardDescription>Gerenciar leads</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Leads
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => navigate("/admin/settings")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>Configurações do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Abrir Configurações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Relatórios
              </CardTitle>
              <CardDescription>Visualizar relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Teste de Permissões */}
        <Card>
          <CardHeader>
            <CardTitle>Teste de Permissões</CardTitle>
            <CardDescription>Verificação de permissões específicas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">leads.view:</span>
                <span className={hasPermission("leads.view") ? "text-green-600" : "text-red-600"}>
                  {hasPermission("leads.view") ? "✓ Permitido" : "✗ Negado"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">leads.create:</span>
                <span className={hasPermission("leads.create") ? "text-green-600" : "text-red-600"}>
                  {hasPermission("leads.create") ? "✓ Permitido" : "✗ Negado"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">leads.delete:</span>
                <span className={hasPermission("leads.delete") ? "text-green-600" : "text-red-600"}>
                  {hasPermission("leads.delete") ? "✓ Permitido" : "✗ Negado"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">admin.*:</span>
                <span className={hasPermission("admin.*") ? "text-green-600" : "text-red-600"}>
                  {hasPermission("admin.*") ? "✓ Permitido" : "✗ Negado"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}


