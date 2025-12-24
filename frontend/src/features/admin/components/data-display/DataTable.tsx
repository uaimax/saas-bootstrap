/** Componente de tabela de dados para exibição de listas. */

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { cn } from "@/lib/utils";

/**
 * Definição de uma coluna da tabela.
 */
export interface Column<T> {
  /** Chave única da coluna (deve corresponder a uma propriedade de T) */
  key: keyof T | string;
  /** Label da coluna */
  label: string;
  /** Função customizada para renderizar o valor (opcional) */
  render?: (value: T[keyof T], row: T, index: number) => ReactNode;
  /** Alinhamento do conteúdo */
  align?: "left" | "center" | "right";
  /** Largura da coluna (opcional) */
  width?: string;
  /** Classe CSS adicional para células desta coluna */
  className?: string;
}

export interface DataTableProps<T extends Record<string, any>> {
  /** Dados da tabela */
  data: T[];
  /** Definição das colunas */
  columns: Column<T>[];
  /** Estado de carregamento */
  loading?: boolean;
  /** Callback quando uma linha é clicada */
  onRowClick?: (row: T, index: number) => void;
  /** Habilitar seleção de linhas */
  selectable?: boolean;
  /** Linhas selecionadas (controlado) */
  selectedRows?: T[];
  /** Callback quando seleção muda */
  onSelectionChange?: (selected: T[]) => void;
  /** Função para obter chave única de uma linha */
  rowKey?: (row: T) => string | number;
  /** Mensagem quando não há dados */
  emptyMessage?: string;
  /** Descrição quando não há dados */
  emptyDescription?: string;
  /** Ação quando não há dados */
  emptyAction?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Componente de tabela de dados para exibição de listas.
 * Suporta seleção de linhas, loading state, empty state e renderização customizada.
 *
 * @example
 * <DataTable
 *   data={leads}
 *   columns={[
 *     { key: "name", label: "Nome" },
 *     { key: "email", label: "Email" },
 *     { key: "status", label: "Status", render: (value) => <Badge>{value}</Badge> },
 *   ]}
 *   loading={loading}
 *   selectable
 *   onRowClick={(row) => navigate(`/leads/${row.id}`)}
 * />
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey,
  emptyMessage = "Nenhum dado encontrado",
  emptyDescription,
  emptyAction,
  className,
}: DataTableProps<T>) {
  // Função para obter chave única de uma linha
  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) {
      return rowKey(row);
    }
    // Tentar usar 'id' se disponível
    if ("id" in row && typeof row.id === "string" || typeof row.id === "number") {
      return row.id;
    }
    // Fallback para índice
    return index;
  };

  // Verificar se uma linha está selecionada
  const isRowSelected = (row: T, index: number): boolean => {
    if (!selectable || selectedRows.length === 0) {
      return false;
    }
    const key = getRowKey(row, index);
    return selectedRows.some((selected) => {
      const selectedKey = rowKey ? rowKey(selected) : ("id" in selected ? selected.id : null);
      return selectedKey === key;
    });
  };

  // Verificar se todas as linhas estão selecionadas
  const isAllSelected = (): boolean => {
    if (!selectable || data.length === 0) {
      return false;
    }
    return data.every((row, index) => isRowSelected(row, index));
  };

  // Verificar se algumas linhas estão selecionadas (indeterminado)
  const isIndeterminate = (): boolean => {
    if (!selectable || data.length === 0) {
      return false;
    }
    const selectedCount = data.filter((row, index) => isRowSelected(row, index)).length;
    return selectedCount > 0 && selectedCount < data.length;
  };

  // Handler para selecionar/deselecionar uma linha
  const handleRowSelect = (row: T, index: number, checked: boolean) => {
    if (!onSelectionChange) return;

    const key = getRowKey(row, index);
    const currentSelected = [...selectedRows];

    if (checked) {
      // Adicionar à seleção se não estiver já selecionada
      if (!isRowSelected(row, index)) {
        onSelectionChange([...currentSelected, row]);
      }
    } else {
      // Remover da seleção
      const filtered = currentSelected.filter((selected) => {
        const selectedKey = rowKey ? rowKey(selected) : ("id" in selected ? selected.id : null);
        return selectedKey !== key;
      });
      onSelectionChange(filtered);
    }
  };

  // Handler para selecionar/deselecionar todas as linhas
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...data]);
    } else {
      onSelectionChange([]);
    }
  };

  // Renderizar valor de uma célula
  const renderCellValue = (column: Column<T>, row: T, index: number): ReactNode => {
    const value = row[column.key as keyof T];

    if (column.render) {
      return column.render(value, row, index);
    }

    // Renderização padrão
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>;
    }

    return String(value);
  };

  // Loading state
  if (loading) {
    return <LoadingState rows={5} />;
  }

  // Empty state
  if (!loading && data.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected()}
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todas as linhas"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={cn(
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right",
                  column.className
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={getRowKey(row, rowIndex)}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/50",
                isRowSelected(row, rowIndex) && "bg-muted/50"
              )}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {selectable && (
                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  className="w-12"
                >
                  <Checkbox
                    checked={isRowSelected(row, rowIndex)}
                    onCheckedChange={(checked) =>
                      handleRowSelect(row, rowIndex, checked === true)
                    }
                    aria-label={`Selecionar linha ${rowIndex + 1}`}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className={cn(
                    column.align === "center" && "text-center",
                    column.align === "right" && "text-right",
                    column.className
                  )}
                >
                  {renderCellValue(column, row, rowIndex)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


