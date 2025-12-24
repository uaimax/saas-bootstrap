/** Hook para gerenciar paginação de tabelas. */

import { useState, useCallback, useMemo } from "react";
import type { PaginationInfo } from "@/features/admin/components/data-display/Pagination";

export interface UsePaginationOptions {
  /** Tamanho inicial da página */
  initialPageSize?: number;
  /** Página inicial (1-indexed) */
  initialPage?: number;
}

export interface UsePaginationReturn {
  /** Página atual (1-indexed) */
  page: number;
  /** Tamanho da página */
  pageSize: number;
  /** Informações de paginação calculadas */
  paginationInfo: PaginationInfo | null;
  /** Muda a página */
  setPage: (page: number) => void;
  /** Muda o tamanho da página */
  setPageSize: (pageSize: number) => void;
  /** Reseta a paginação */
  reset: () => void;
  /** Parâmetros de query para a API */
  queryParams: {
    page: number;
    page_size: number;
  };
}

/**
 * Hook para gerenciar estado de paginação.
 * Calcula informações de paginação baseado no total de itens.
 *
 * @param totalItems - Total de itens (vem da API)
 * @param options - Opções de configuração
 * @returns Estado e métodos de paginação
 *
 * @example
 * const { page, pageSize, setPage, setPageSize, queryParams } = usePagination(totalItems);
 */
export function usePagination(
  totalItems: number = 0,
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { initialPageSize = 25, initialPage = 1 } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const paginationInfo: PaginationInfo | null = useMemo(() => {
    if (totalItems === 0) {
      return null;
    }

    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.min(page, Math.max(1, totalPages));
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      startIndex,
      endIndex,
    };
  }, [totalItems, pageSize, page]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const handleSetPageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset para primeira página ao mudar tamanho
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  const queryParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
    }),
    [page, pageSize]
  );

  return {
    page,
    pageSize,
    paginationInfo,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    reset,
    queryParams,
  };
}


