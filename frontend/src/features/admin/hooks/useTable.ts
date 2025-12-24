/** Hook para gerenciar estado de tabelas de dados com paginação, busca e ordenação. */

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/config/api";
import { useTenant } from "./useTenant";
import { useAuth } from "@/features/auth/AuthContext";
import { usePagination, type UsePaginationReturn } from "./usePagination";

/**
 * Estado de uma tabela com paginação.
 */
export interface TableState<T> {
  /** Dados da tabela */
  data: T[];
  /** Estado de carregamento */
  loading: boolean;
  /** Erro, se houver */
  error: string | null;
  /** Linhas selecionadas */
  selectedRows: T[];
  /** Total de itens (para paginação) */
  totalItems: number;
}

/**
 * Retorno do hook useTable.
 */
export interface UseTableReturn<T> extends TableState<T>, UsePaginationReturn {
  /** Recarrega os dados da tabela */
  refresh: () => Promise<void>;
  /** Seleciona uma linha específica */
  selectRow: (row: T, selected: boolean) => void;
  /** Seleciona todas as linhas */
  selectAll: (selected: boolean) => void;
  /** Limpa a seleção */
  clearSelection: () => void;
  /** Termo de busca */
  search: string;
  /** Define o termo de busca */
  setSearch: (search: string) => void;
  /** Ordenação atual (ex: "name" ou "-created_at") */
  ordering: string | null;
  /** Define a ordenação */
  setOrdering: (ordering: string | null) => void;
}

/**
 * Opções de configuração do hook useTable.
 */
export interface UseTableOptions<T> {
  /** URL da API para buscar dados */
  endpoint: string;
  /** Função para transformar dados da API (opcional) */
  transform?: (data: any) => T[];
  /** Chave única para identificar linhas (para seleção) */
  rowKey?: (row: T) => string | number;
  /** Filtros adicionais para a requisição */
  filters?: Record<string, any>;
  /** Recarregar automaticamente quando filters mudarem */
  autoRefresh?: boolean;
  /** Campos de busca (para SearchFilter do DRF) */
  searchFields?: string[];
  /** Campos de ordenação permitidos */
  orderingFields?: string[];
  /** Ordenação padrão */
  defaultOrdering?: string;
  /** Tamanho inicial da página */
  initialPageSize?: number;
}

/**
 * Hook para gerenciar estado de tabelas com paginação, busca e ordenação.
 * Integra com API, gerencia seleção de linhas e filtro automático por tenant.
 *
 * @param options - Opções de configuração
 * @returns Estado e métodos para gerenciar a tabela
 *
 * @example
 * const { data, loading, refresh, paginationInfo, search, setSearch } = useTable({
 *   endpoint: "/leads/",
 *   rowKey: (row) => row.id,
 *   searchFields: ["name", "email"],
 * });
 */
export function useTable<T extends Record<string, any>>(
  options: UseTableOptions<T>
): UseTableReturn<T> {
  const {
    endpoint,
    transform,
    rowKey,
    filters = {},
    autoRefresh = true,
    searchFields = [],
    orderingFields = [],
    defaultOrdering,
    initialPageSize = 25,
  } = options;
  const { tenantId } = useTenant();
  const { user } = useAuth();

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<string | null>(defaultOrdering || null);

  // Super admin pode ver todos os dados sem filtro de tenant
  const isSuperAdmin = user?.is_superuser === true;

  // Paginação
  const pagination = usePagination(totalItems, { initialPageSize });

  const fetchData = useCallback(async () => {
    // Super admin não precisa de tenantId, usuários normais sim
    if (!isSuperAdmin && !tenantId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construir parâmetros de query
      const params: Record<string, any> = {
        ...filters,
        ...pagination.queryParams,
      };

      // Adicionar busca se houver campos de busca configurados
      if (search && searchFields.length > 0) {
        params.search = search;
      }

      // Adicionar ordenação
      if (ordering) {
        params.ordering = ordering;
      }

      const response = await apiClient.get(endpoint, { params });

      // DRF retorna { count, next, previous, results } quando paginado
      // ou array direto quando não paginado
      let responseData: T[];
      let total: number;

      if (response.data.results) {
        // Resposta paginada
        responseData = response.data.results;
        total = response.data.count || 0;
      } else if (Array.isArray(response.data)) {
        // Resposta não paginada (array direto)
        responseData = response.data;
        total = responseData.length;
      } else {
        // Resposta não paginada (objeto único)
        responseData = [response.data];
        total = 1;
      }

      const transformedData = transform ? transform(responseData) : (responseData as T[]);

      setData(transformedData);
      setTotalItems(total);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Erro ao carregar dados";
      setError(errorMessage);
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [
    endpoint,
    transform,
    tenantId,
    isSuperAdmin,
    JSON.stringify(filters),
    pagination.queryParams,
    search,
    ordering,
    searchFields.length,
  ]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const selectRow = useCallback(
    (row: T, selected: boolean) => {
      if (selected) {
        setSelectedRows((prev) => {
          // Evitar duplicatas
          const key = rowKey ? rowKey(row) : JSON.stringify(row);
          const exists = prev.some((r) => {
            const rKey = rowKey ? rowKey(r) : JSON.stringify(r);
            return rKey === key;
          });
          return exists ? prev : [...prev, row];
        });
      } else {
        setSelectedRows((prev) => {
          const key = rowKey ? rowKey(row) : JSON.stringify(row);
          return prev.filter((r) => {
            const rKey = rowKey ? rowKey(r) : JSON.stringify(r);
            return rKey !== key;
          });
        });
      }
    },
    [rowKey]
  );

  const selectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedRows([...data]);
      } else {
        setSelectedRows([]);
      }
    },
    [data]
  );

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  // Resetar para primeira página quando busca ou filtros mudarem
  useEffect(() => {
    if (autoRefresh) {
      pagination.setPage(1);
    }
  }, [search, JSON.stringify(filters), autoRefresh]);

  // Carregar dados inicialmente e quando dependências mudarem
  useEffect(() => {
    if (autoRefresh) {
      fetchData();
    }
  }, [fetchData, autoRefresh]);

  return {
    data,
    loading,
    error,
    selectedRows,
    totalItems,
    refresh,
    selectRow,
    selectAll,
    clearSelection,
    search,
    setSearch,
    ordering,
    setOrdering,
    ...pagination,
  };
}
