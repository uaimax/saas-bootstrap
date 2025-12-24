/** Componente de paginação para tabelas (similar ao Django Admin). */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface PaginationInfo {
  /** Página atual (1-indexed) */
  currentPage: number;
  /** Total de páginas */
  totalPages: number;
  /** Total de itens */
  totalItems: number;
  /** Itens por página */
  pageSize: number;
  /** Índice do primeiro item da página atual */
  startIndex: number;
  /** Índice do último item da página atual */
  endIndex: number;
}

export interface PaginationProps {
  /** Informações de paginação */
  pagination: PaginationInfo;
  /** Callback quando a página muda */
  onPageChange: (page: number) => void;
  /** Callback quando o tamanho da página muda */
  onPageSizeChange: (pageSize: number) => void;
  /** Opções de tamanho de página */
  pageSizeOptions?: number[];
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de paginação para tabelas.
 * Similar ao Django Admin, com navegação de páginas e controle de tamanho.
 *
 * @example
 * <Pagination
 *   pagination={paginationInfo}
 *   onPageChange={(page) => setPage(page)}
 *   onPageSizeChange={(size) => setPageSize(size)}
 * />
 */
export function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: PaginationProps) {
  const { currentPage, totalPages, totalItems, pageSize, startIndex, endIndex } = pagination;

  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between px-2 py-4", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Mostrando {startIndex} a {endIndex} de {totalItems} itens
        </span>
        <span className="text-muted-foreground">|</span>
        <span>Itens por página:</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          aria-label="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLastPage}
          disabled={currentPage >= totalPages}
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}


