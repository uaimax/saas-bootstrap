/** Componente de breadcrumbs para navegação hierárquica. */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  /** Label do item */
  label: string;
  /** Link do item (opcional, último item geralmente não tem link) */
  href?: string;
}

export interface BreadcrumbsProps {
  /** Itens do breadcrumb */
  items: BreadcrumbItem[];
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de breadcrumbs para navegação hierárquica.
 * Último item não é clicável (representa página atual).
 *
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: "Dashboard", href: "/dashboard" },
 *     { label: "Leads", href: "/dashboard/leads" },
 *     { label: "Detalhes" }, // Último item sem href
 *   ]}
 * />
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn("flex items-center space-x-2 text-sm", className)}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center">
            {!isFirst && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
            )}
            {isLast || !item.href ? (
              <span
                className={cn(
                  "font-medium",
                  isLast ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}


