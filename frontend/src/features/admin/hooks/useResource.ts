/** Hook genérico para gerenciar CRUD de recursos. */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/config/api";
import { useTable } from "./useTable";
import { usePermissions } from "./usePermissions";
import { useAuth } from "@/features/auth/AuthContext";
import type { ResourceConfig } from "@/lib/admin/resource-config";
import { createResourceSchema } from "@/lib/admin/resource-config";

/**
 * Hook genérico para gerenciar CRUD de recursos.
 * Similar ao Django Admin, mas no frontend.
 *
 * @param config - Configuração do recurso
 * @returns Estado e métodos para gerenciar o recurso
 *
 * @example
 * const { list, create, update, remove, form } = useResource(leadResource);
 */
export function useResource<T extends Record<string, any>>(
  config: ResourceConfig<T>
) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  // Schema de validação
  const schema = createResourceSchema(config.fields);
  type FormValues = z.infer<typeof schema>;

  // Form
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Table state
  const {
    data,
    loading,
    error,
    refresh,
    selectedRows,
    selectRow,
    selectAll,
    clearSelection: clearTableSelection,
    search,
    setSearch,
    ordering,
    setOrdering,
    paginationInfo,
    setPage,
    setPageSize,
    totalItems,
  } = useTable<T>({
    endpoint: config.endpoint,
    rowKey: config.rowKey || ((row: T) => (row.id as string | number)),
    transform: config.transform,
    autoRefresh: true,
    searchFields: config.searchFields,
    orderingFields: config.orderingFields,
    defaultOrdering: config.defaultOrdering,
    initialPageSize: config.initialPageSize,
  });

  // Super admins têm acesso a tudo
  const isSuperAdmin = user?.is_superuser === true;

  // Permissões (super admins sempre têm acesso)
  const canCreate = isSuperAdmin
    ? true
    : config.permissions?.create
    ? hasPermission(config.permissions.create)
    : true;
  const canView = isSuperAdmin
    ? true
    : config.permissions?.view
    ? hasPermission(config.permissions.view)
    : true;
  const canUpdate = isSuperAdmin
    ? true
    : config.permissions?.update
    ? hasPermission(config.permissions.update)
    : true;
  const canDelete = isSuperAdmin
    ? true
    : config.permissions?.delete
    ? hasPermission(config.permissions.delete)
    : true;

  // CRUD methods
  const create = useCallback(
    async (values: FormValues) => {
      const response = await apiClient.post(config.endpoint, values);
      await refresh();
      return response.data;
    },
    [config.endpoint, refresh]
  );

  const get = useCallback(
    async (id: string | number) => {
      const response = await apiClient.get(`${config.endpoint}${id}/`);
      return response.data;
    },
    [config.endpoint]
  );

  const update = useCallback(
    async (id: string | number, values: Partial<FormValues>) => {
      const response = await apiClient.patch(`${config.endpoint}${id}/`, values);
      await refresh();
      return response.data;
    },
    [config.endpoint, refresh]
  );

  const remove = useCallback(
    async (id: string | number) => {
      await apiClient.delete(`${config.endpoint}${id}/`);
      await refresh();
    },
    [config.endpoint, refresh]
  );

  // Navigation helpers
  const goToList = useCallback(() => {
    navigate(`/admin/${config.namePlural}`);
  }, [navigate, config.namePlural]);

  const goToCreate = useCallback(() => {
    navigate(`/admin/${config.namePlural}/new`);
  }, [navigate, config.namePlural]);

  const goToDetail = useCallback(
    (id: string | number) => {
      navigate(`/admin/${config.namePlural}/${id}`);
    },
    [navigate, config.namePlural]
  );

  const goToEdit = useCallback(
    (id: string | number) => {
      navigate(`/admin/${config.namePlural}/${id}?edit=true`);
    },
    [navigate, config.namePlural]
  );

  return {
    // Data
    data,
    loading,
    error,
    selectedRows,
    refresh,
    totalItems,

    // Form
    form,

    // CRUD
    create,
    get,
    update,
    remove,

    // Permissions
    canCreate,
    canView,
    canUpdate,
    canDelete,

    // Navigation
    goToList,
    goToCreate,
    goToDetail,
    goToEdit,

    // Search & Sorting
    search,
    setSearch,
    ordering,
    setOrdering,

    // Pagination
    paginationInfo,
    setPage,
    setPageSize,

    // Selection
    selectRow,
    selectAll,
    clearSelection: clearTableSelection,
  };
}

