/** Layout principal para páginas admin. */

import { ReactNode, useState } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { Header, type BreadcrumbItem } from "./Header";
import { cn } from "@/lib/utils";

export interface MainLayoutProps {
  /** Conteúdo da página */
  children: ReactNode;
  /** Itens do menu da sidebar */
  sidebarItems?: NavItem[];
  /** Título da página (exibido no header) */
  title?: string;
  /** Itens do breadcrumb */
  breadcrumbs?: BreadcrumbItem[];
  /** Ações adicionais no header */
  headerActions?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Layout principal para páginas admin.
 * Compõe Sidebar + Header + Content area.
 *
 * @example
 * <MainLayout
 *   sidebarItems={[
 *     { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard /> },
 *     { label: "Leads", href: "/dashboard/leads", icon: <Users /> },
 *   ]}
 *   title="Dashboard"
 *   breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }]}
 * >
 *   <YourPageContent />
 * </MainLayout>
 */
export function MainLayout({
  children,
  sidebarItems = [],
  title,
  breadcrumbs,
  headerActions,
  className,
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Sidebar */}
      {sidebarItems.length > 0 && (
        <Sidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={title}
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


