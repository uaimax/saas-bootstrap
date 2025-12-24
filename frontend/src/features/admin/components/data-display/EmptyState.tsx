/** Componente para exibir estado vazio (quando não há dados). */

import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Título do estado vazio */
  title: string;
  /** Descrição opcional */
  description?: string;
  /** Ação opcional (botão ou elemento React) */
  action?: ReactNode;
  /** Ícone customizado (padrão: Inbox) */
  icon?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para exibir estado vazio quando não há dados para mostrar.
 *
 * @example
 * <EmptyState
 *   title="Nenhum lead encontrado"
 *   description="Comece criando seu primeiro lead"
 *   action={<Button onClick={handleCreate}>Criar Lead</Button>}
 * />
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 text-muted-foreground">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}


