/** Componente de busca para listagens (similar ao Django Admin search). */

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export interface SearchBarProps {
  /** Valor atual da busca */
  value?: string;
  /** Callback quando o valor da busca muda */
  onSearch: (value: string) => void;
  /** Placeholder do input */
  placeholder?: string;
  /** Debounce em milissegundos (padrão: 300ms) */
  debounceMs?: number;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de barra de busca com debounce.
 * Similar ao Django Admin search box.
 *
 * @example
 * <SearchBar
 *   value={searchTerm}
 *   onSearch={(value) => setSearchTerm(value)}
 *   placeholder="Buscar leads..."
 * />
 */
export function SearchBar({
  value = "",
  onSearch,
  placeholder = "Buscar...",
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sincronizar com valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce do valor
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onSearch]);

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
  };

  return (
    <div className={cn("relative w-full max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}


