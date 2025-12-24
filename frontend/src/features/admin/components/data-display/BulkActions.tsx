/** Componente para ações em massa (similar ao Django Admin actions). */

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkAction {
  /** Label da ação */
  label: string;
  /** Ícone da ação (opcional) */
  icon?: ReactNode;
  /** Callback quando a ação é executada */
  onAction: (selectedIds: (string | number)[]) => Promise<void> | void;
  /** Se a ação requer confirmação */
  requiresConfirmation?: boolean;
  /** Mensagem de confirmação */
  confirmationMessage?: string;
  /** Se a ação está desabilitada */
  disabled?: boolean;
  /** Variante do botão (destructive para ações perigosas) */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface BulkActionsProps {
  /** IDs dos itens selecionados */
  selectedIds: (string | number)[];
  /** Ações disponíveis */
  actions: BulkAction[];
  /** Callback quando a seleção é limpa */
  onClearSelection?: () => void;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente para ações em massa.
 * Similar ao Django Admin actions dropdown.
 *
 * @example
 * <BulkActions
 *   selectedIds={selectedIds}
 *   actions={[
 *     {
 *       label: "Excluir selecionados",
 *       icon: <Trash2 className="h-4 w-4" />,
 *       onAction: async (ids) => await deleteLeads(ids),
 *       requiresConfirmation: true,
 *       variant: "destructive",
 *     },
 *   ]}
 *   onClearSelection={() => setSelectedIds([])}
 * />
 */
export function BulkActions({
  selectedIds,
  actions,
  onClearSelection,
  className,
}: BulkActionsProps) {
  if (selectedIds.length === 0) {
    return null;
  }

  const handleAction = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      const message = action.confirmationMessage || `Tem certeza que deseja executar "${action.label}"?`;
      if (!window.confirm(message)) {
        return;
      }
    }

    try {
      await action.onAction(selectedIds);
      onClearSelection?.();
    } catch (error) {
      console.error("Erro ao executar ação em massa:", error);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">
        {selectedIds.length} {selectedIds.length === 1 ? "item selecionado" : "itens selecionados"}
      </span>
      {actions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Ações
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações em massa</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleAction(action)}
                disabled={action.disabled}
                className={cn(action.variant === "destructive" && "text-destructive")}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {onClearSelection && (
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Limpar seleção
        </Button>
      )}
    </div>
  );
}


