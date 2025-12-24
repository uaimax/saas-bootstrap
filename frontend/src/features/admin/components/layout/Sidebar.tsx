/** Componente de sidebar para navegação lateral. */

import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  /** Label do item */
  label: string;
  /** Ícone do item (lucide-react) */
  icon?: ReactNode;
  /** Link do item */
  href: string;
  /** Badge opcional (ex: contador) */
  badge?: string | number;
  /** Itens filhos (para submenu) - não implementado na Fase 1 */
  children?: NavItem[];
}

export interface SidebarProps {
  /** Itens do menu */
  items: NavItem[];
  /** Estado colapsado (controlado) */
  collapsed?: boolean;
  /** Callback quando colapso muda */
  onCollapse?: (collapsed: boolean) => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de sidebar para navegação lateral.
 * Suporta colapso e destaca item ativo baseado na rota atual.
 *
 * @example
 * <Sidebar
 *   items={[
 *     { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
 *     { label: "Leads", href: "/dashboard/leads", icon: <Users /> },
 *   ]}
 *   collapsed={collapsed}
 *   onCollapse={setCollapsed}
 * />
 */
export function Sidebar({
  items,
  collapsed: controlledCollapsed,
  onCollapse,
  className,
}: SidebarProps) {
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Usar estado controlado se fornecido, senão usar interno
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onCollapse ?? setInternalCollapsed;

  // Persistir estado no localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null && controlledCollapsed === undefined) {
      setInternalCollapsed(saved === "true");
    }
  }, [controlledCollapsed]);

  useEffect(() => {
    if (controlledCollapsed === undefined) {
      localStorage.setItem("sidebar-collapsed", String(internalCollapsed));
    }
  }, [internalCollapsed, controlledCollapsed]);

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header da sidebar */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="font-semibold text-lg">Admin</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu items */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon && (
                  <span className={cn("flex-shrink-0", collapsed && "mx-auto")}>
                    {item.icon}
                  </span>
                )}
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

