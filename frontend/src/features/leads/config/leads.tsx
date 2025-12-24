/** Configuração do recurso Lead (similar ao ModelAdmin do Django). */

import type { ResourceConfig } from "@/lib/admin/resource-config";
import { formatDate } from "@/lib/admin/formatters";
import * as z from "zod";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  status_display: string;
  created_at: string;
  updated_at?: string;
}

// Helper para renderizar status badge
const renderStatusBadge = (value: any, row: Lead): ReactNode => {
  // Mapear status para variantes de badge
  const getVariant = (status: string) => {
    switch (status) {
      case "new":
        return "default";
      case "contacted":
        return "secondary";
      case "qualified":
        return "default";
      case "converted":
        return "default";
      case "lost":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Badge variant={getVariant(row.status)}>
      {row.status_display || row.status}
    </Badge>
  );
};

/**
 * Configuração do recurso Lead.
 * Similar ao ModelAdmin do Django - define campos, colunas, permissões, etc.
 */
export const leadResource: ResourceConfig<Lead> = {
  name: "lead",
  namePlural: "leads",
  endpoint: "/leads/",

  // Campos do formulário
  fields: [
    {
      name: "name",
      label: "Nome",
      type: "text",
      placeholder: "Nome completo do lead",
      required: true,
      schema: z.string().min(1, "Nome é obrigatório"),
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "email@exemplo.com",
      required: true,
      schema: z.string().email("Email inválido"),
    },
    {
      name: "phone",
      label: "Telefone",
      type: "text",
      placeholder: "(11) 98765-4321",
      description: "Opcional",
      schema: z.string().optional(),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { value: "new", label: "Novo" },
        { value: "contacted", label: "Contactado" },
        { value: "qualified", label: "Qualificado" },
        { value: "converted", label: "Convertido" },
        { value: "lost", label: "Perdido" },
      ],
      schema: z.enum(["new", "contacted", "qualified", "converted", "lost"], {
        required_error: "Status é obrigatório",
      }),
    },
  ],

  // Colunas da tabela
  tableColumns: [
    {
      key: "name",
      label: "Nome",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "phone",
      label: "Telefone",
      render: (value) => (value ? String(value) : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: renderStatusBadge,
    },
    {
      key: "created_at",
      label: "Criado em",
      render: (value) => formatDate(String(value), "short"),
    },
  ],

  // Permissões RBAC
  permissions: {
    create: "leads.create",
    view: "leads.view",
    update: "leads.update",
    delete: "leads.delete",
  },

  // Títulos customizados
  listTitle: "Leads",
  createTitle: "Novo Lead",
  editTitle: "Editar Lead",
  detailTitle: "Detalhes do Lead",

  // Mensagens
  emptyMessage: "Nenhum lead encontrado",
  emptyDescription: "Comece criando seu primeiro lead",

  // Busca e ordenação
  searchFields: ["name", "email", "client_company", "phone"],
  orderingFields: ["name", "email", "status", "created_at", "updated_at"],
  defaultOrdering: "-created_at",
  initialPageSize: 25,
};

