/** Componente para exibir estado de carregamento. */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  /** Mensagem opcional de carregamento */
  message?: string;
  /** Número de linhas skeleton (padrão: 5) */
  rows?: number;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para exibir estado de carregamento usando skeleton loaders.
 *
 * @example
 * <LoadingState message="Carregando leads..." rows={10} />
 */
export function LoadingState({
  message,
  rows = 5,
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}


