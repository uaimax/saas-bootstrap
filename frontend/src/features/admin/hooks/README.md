# Admin Hooks

Hooks customizados para funcionalidades administrativas.

## useTenant

Acessa informações do tenant (company) atual.

```tsx
import { useTenant } from "@/features/admin/hooks/useTenant";

function MyComponent() {
  const { tenant, tenantId, tenantName } = useTenant();

  return <div>Tenant: {tenantName}</div>;
}
```

## usePermissions

Verifica permissões RBAC do usuário.

```tsx
import { usePermissions } from "@/features/admin/hooks/usePermissions";

function MyComponent() {
  const { hasPermission } = usePermissions();

  if (hasPermission("leads.view")) {
    return <LeadsList />;
  }

  return <div>Sem permissão</div>;
}
```

## useTable

Gerencia estado de tabelas com integração automática à API.

```tsx
import { useTable } from "@/features/admin/hooks/useTable";

function LeadsPage() {
  const { data, loading, error, refresh, selectRow } = useTable({
    endpoint: "/leads/",
    rowKey: (row) => row.id,
  });

  return <DataTable data={data} loading={loading} />;
}
```


