/** Componente de header para layout admin. */

import { ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useTenant } from "@/features/admin/hooks/useTenant";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { TenantSelector } from "./TenantSelector";
import { LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  /** Título da página (opcional) */
  title?: string;
  /** Itens do breadcrumb */
  breadcrumbs?: BreadcrumbItem[];
  /** Ações adicionais no header (botões, etc) */
  actions?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de header para layout admin.
 * Inclui breadcrumbs, menu do usuário, theme toggle e ações customizadas.
 *
 * @example
 * <Header
 *   title="Dashboard"
 *   breadcrumbs={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Leads" },
 *   ]}
 *   actions={<Button>Novo Lead</Button>}
 * />
 */
export function Header({
  title,
  breadcrumbs,
  actions,
  className,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { tenantName } = useTenant();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "U";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Title and Breadcrumbs */}
        <div className="flex items-center gap-4">
          {title && (
            <h1 className="text-lg font-semibold hidden md:block">{title}</h1>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} />
          )}
        </div>

        {/* Right: Actions and User Menu */}
        <div className="flex items-center gap-2">
          {actions}

          <TenantSelector />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.email}
                  </p>
                  {tenantName && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {tenantName}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

