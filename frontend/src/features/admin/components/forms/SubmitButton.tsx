/** Botão de submit com estado de loading integrado. */

import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
  /** Estado de loading */
  loading?: boolean;
  /** Texto do botão quando não está carregando */
  children?: React.ReactNode;
  /** Texto do botão quando está carregando (padrão: "Salvando...") */
  loadingText?: string;
}

/**
 * Botão de submit com estado de loading automático.
 * Desabilita automaticamente durante o submit e mostra spinner.
 *
 * @example
 * <SubmitButton loading={isSubmitting} onClick={handleSubmit}>
 *   Salvar
 * </SubmitButton>
 */
export function SubmitButton({
  loading = false,
  children = "Salvar",
  loadingText = "Salvando...",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? loadingText : children}
    </Button>
  );
}


