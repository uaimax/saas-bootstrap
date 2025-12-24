# Admin UI Kit

Componentes reutilizáveis para painéis administrativos do SaaS Bootstrap.

## Estrutura

```
admin/
├── layout/          # Componentes de layout (Sidebar, Header, MainLayout)
├── data-display/    # Componentes de exibição de dados (DataTable, EmptyState, LoadingState)
└── forms/           # Componentes de formulário (FormField, SubmitButton)
```

## Uso Básico

### Layout Principal

```tsx
import { MainLayout } from "@/features/admin/components/layout/MainLayout";
import { LayoutDashboard, Users } from "lucide-react";

function DashboardPage() {
  return (
    <MainLayout
      sidebarItems={[
        { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
        { label: "Leads", href: "/admin/leads", icon: <Users /> },
      ]}
      title="Dashboard"
      breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}
    >
      <YourContent />
    </MainLayout>
  );
}
```

### DataTable

```tsx
import { DataTable } from "@/features/admin/components/data-display/DataTable";
import { useTable } from "@/features/admin/hooks/useTable";

function LeadsPage() {
  const { data, loading, refresh } = useTable({
    endpoint: "/leads/",
    rowKey: (row) => row.id,
  });

  return (
    <DataTable
      data={data}
      columns={[
        { key: "name", label: "Nome" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" },
      ]}
      loading={loading}
      onRowClick={(row) => navigate(`/leads/${row.id}`)}
    />
  );
}
```

### FormField

```tsx
import { FormField } from "@/features/admin/components/forms/FormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

function LeadForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          label="Nome"
          required
        />
        <FormField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          required
        />
      </form>
    </Form>
  );
}
```

## Hooks

- `useTenant()` - Acessa informações do tenant atual
- `usePermissions()` - Verifica permissões RBAC
- `useTable()` - Gerencia estado de tabelas

## Utilitários

- `lib/admin/rbac.ts` - Helpers para RBAC
- `lib/admin/formatters.ts` - Formatadores de dados
- `lib/admin/validators.ts` - Validadores Zod reutilizáveis

## Padrões

- Componentes simples usam Tailwind CSS direto
- Componentes complexos usam Radix UI (Dialog, Select, Dropdown, etc)
- TypeScript strict mode
- Tailwind CSS para estilização
- Acessibilidade (a11y) via Radix UI primitives (componentes complexos)


