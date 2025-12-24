/** Componente genérico para listagem de recursos (similar ao Django Admin list_view). */

import { ReactNode, useMemo } from "react";
import { LayoutDashboard, Trash2 } from "lucide-react";
import { MainLayout } from "@/features/admin/components/layout/MainLayout";
import { DataTable } from "@/features/admin/components/data-display/DataTable";
import type { Column } from "@/features/admin/components/data-display/DataTable";
import { SearchBar } from "@/features/admin/components/data-display/SearchBar";
import { Pagination } from "@/features/admin/components/data-display/Pagination";
import { BulkActions, type BulkAction } from "@/features/admin/components/data-display/BulkActions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useResource } from "@/features/admin/hooks/useResource";
import { createTableColumns } from "@/lib/admin/resource-config";
import type { ResourceConfig } from "@/lib/admin/resource-config";
import { useToast } from "@/hooks/use-toast";

export interface ResourceListPageProps<T extends Record<string, any>> {
  /** Configuração do recurso */
  config: ResourceConfig<T>;
  /** Ícone para sidebar */
  sidebarIcon?: ReactNode;
  /** Itens adicionais da sidebar */
  additionalSidebarItems?: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
  }>;
  /** Ações customizadas no header */
  headerActions?: ReactNode;
  /** Conteúdo adicional antes da tabela */
  beforeTable?: ReactNode;
  /** Conteúdo adicional depois da tabela */
  afterTable?: ReactNode;
  /** Ações em massa customizadas */
  bulkActions?: BulkAction[];
}

/**
 * Componente genérico para listagem de recursos.
 * Similar ao Django Admin list_view, mas configurável.
 *
 * @example
 * <ResourceListPage config={leadResource} />
 */
export function ResourceListPage<T extends Record<string, any>>({
  config,
  sidebarIcon,
  additionalSidebarItems = [],
  headerActions,
  beforeTable,
  afterTable,
  bulkActions = [],
}: ResourceListPageProps<T>) {
  const { toast } = useToast();
  const {
    data,
    loading,
    error,
    selectedRows,
    totalItems,
    canCreate,
    canDelete,
    goToCreate,
    goToDetail,
    remove,
    search,
    setSearch,
    paginationInfo,
    setPage,
    setPageSize,
    clearSelection,
    selectRow,
    selectAll,
  } = useResource<T>(config);

  // Converter configuração em colunas do DataTable
  const columns: Column<T>[] = useMemo(() => {
    const cols = createTableColumns(config.tableColumns);

    // Adicionar coluna de ações se tiver permissão
    if (canDelete || canCreate) {
      cols.push({
        key: "actions",
        label: "Ações",
        align: "right",
        render: (value, row, index) => {
          const id = config.rowKey ? config.rowKey(row) : (row.id as string | number);
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  goToDetail(id);
                }}
              >
                Ver
              </Button>
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm(`Tem certeza que deseja excluir este ${config.name}?`)) {
                      try {
                        await remove(id);
                        toast({
                          title: "Sucesso",
                          description: `${config.name} excluído com sucesso.`,
                        });
                      } catch (err) {
                        toast({
                          title: "Erro",
                          description: `Erro ao excluir ${config.name}.`,
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                >
                  Excluir
                </Button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [config, canCreate, canDelete, goToDetail, remove, toast]);

  // IDs dos itens selecionados
  const selectedIds = useMemo(() => {
    return selectedRows.map((row) => config.rowKey ? config.rowKey(row) : (row.id as string | number));
  }, [selectedRows, config.rowKey]);

  // Ações em massa padrão (excluir)
  const defaultBulkActions: BulkAction[] = useMemo(() => {
    const actions: BulkAction[] = [];

    if (canDelete) {
      actions.push({
        label: `Excluir ${selectedIds.length} ${selectedIds.length === 1 ? config.name : config.namePlural}`,
        icon: <Trash2 className="h-4 w-4" />,
        onAction: async (ids) => {
          try {
            await Promise.all(ids.map((id) => remove(id)));
            toast({
              title: "Sucesso",
              description: `${ids.length} ${ids.length === 1 ? config.name : config.namePlural} excluído(s) com sucesso.`,
            });
            clearSelection();
          } catch (err) {
            toast({
              title: "Erro",
              description: `Erro ao excluir ${config.namePlural}.`,
              variant: "destructive",
            });
          }
        },
        requiresConfirmation: true,
        confirmationMessage: `Tem certeza que deseja excluir ${selectedIds.length} ${selectedIds.length === 1 ? config.name : config.namePlural}?`,
        variant: "destructive",
      });
    }

    return [...actions, ...bulkActions];
  }, [canDelete, selectedIds.length, config, remove, toast, clearSelection, bulkActions]);

  // Sidebar items
  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: config.listTitle || config.namePlural.charAt(0).toUpperCase() + config.namePlural.slice(1),
      href: `/admin/${config.namePlural}`,
      icon: sidebarIcon || <LayoutDashboard className="h-4 w-4" />,
      badge: totalItems > 0 ? totalItems : undefined,
    },
    ...additionalSidebarItems,
  ];

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: config.listTitle || config.namePlural.charAt(0).toUpperCase() + config.namePlural.slice(1) },
  ];

  // Header actions
  const defaultHeaderActions = canCreate ? (
    <Button onClick={goToCreate}>
      <Plus className="mr-2 h-4 w-4" />
      Novo {config.name.charAt(0).toUpperCase() + config.name.slice(1)}
    </Button>
  ) : null;

  return (
    <MainLayout
      sidebarItems={sidebarItems}
      title={config.listTitle || config.namePlural.charAt(0).toUpperCase() + config.namePlural.slice(1)}
      breadcrumbs={breadcrumbs}
      headerActions={headerActions || defaultHeaderActions}
    >
      <div className="space-y-4">
        {beforeTable}

        {/* Barra de busca e ações em massa */}
        <div className="flex items-center justify-between gap-4">
          {config.searchFields && config.searchFields.length > 0 && (
            <SearchBar
              value={search}
              onSearch={setSearch}
              placeholder={`Buscar ${config.namePlural}...`}
            />
          )}
          {selectedIds.length > 0 && (
            <BulkActions
              selectedIds={selectedIds}
              actions={defaultBulkActions}
              onClearSelection={clearSelection}
            />
          )}
        </div>

        {/* Tabela */}
        <DataTable
          data={data}
          columns={columns}
          loading={loading}
          onRowClick={(row) => {
            const id = config.rowKey ? config.rowKey(row) : (row.id as string | number);
            goToDetail(id);
          }}
          selectable={canDelete}
          selectedRows={selectedRows}
          onSelectionChange={(selected) => {
            // Sincronizar seleção: limpar atual e aplicar nova
            clearSelection();
            selected.forEach((row) => {
              selectRow(row, true);
            });
          }}
          emptyMessage={config.emptyMessage || `Nenhum ${config.name} encontrado`}
          emptyDescription={config.emptyDescription || `Comece criando seu primeiro ${config.name}`}
          emptyAction={
            canCreate ? (
              <Button onClick={goToCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Criar {config.name.charAt(0).toUpperCase() + config.name.slice(1)}
              </Button>
            ) : null
          }
        />

        {/* Paginação */}
        {paginationInfo && (
          <Pagination
            pagination={paginationInfo}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}

        {afterTable}

        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
