# Páginas Admin - Exemplos de Uso do Admin UI Kit

Estas páginas demonstram o uso completo do Admin UI Kit implementado.

## Páginas Disponíveis

### `/admin/dashboard`
- **Arquivo**: `DashboardPage.tsx`
- **Demonstra**: MainLayout, useTenant, usePermissions, Cards de navegação
- **Uso**: Página inicial do painel admin

### `/admin/leads`
- **Arquivo**: `LeadsPage.tsx`
- **Demonstra**: MainLayout, DataTable, useTable, formatters, permissões condicionais
- **Uso**: Lista de leads com tabela interativa

### `/admin/leads/new`
- **Arquivo**: `LeadFormPage.tsx`
- **Demonstra**: MainLayout, FormField, SubmitButton, React Hook Form + Zod
- **Uso**: Formulário de criação de lead

## Como Usar

1. **Acesse as rotas admin após fazer login**
2. **Navegue entre as páginas usando a sidebar**
3. **Observe os diferentes componentes em ação**

## Características Demonstradas

### MainLayout
- Sidebar colapsável com navegação
- Header com breadcrumbs e menu do usuário
- Layout responsivo

### DataTable
- Integração com useTable hook
- Seleção de linhas
- Estados de loading e empty
- Renderização customizada de células

### FormField
- Integração com React Hook Form
- Suporte a diferentes tipos (text, email, select, textarea)
- Validação automática com Zod

### Hooks
- `useTenant()` - Acessa informações do tenant
- `usePermissions()` - Verifica permissões RBAC
- `useTable()` - Gerencia estado de tabelas

### Utilitários
- `formatDate()` - Formatação de datas
- `checkPermission()` - Verificação de permissões

## Próximos Passos

1. **Adaptar para suas necessidades**: Modifique as páginas conforme seu domínio
2. **Adicionar mais funcionalidades**: Use os componentes como base
3. **Criar novas páginas**: Siga os padrões estabelecidos

## Notas

- As permissões RBAC funcionarão quando o backend retornar o campo `permissions` no User
- O multi-tenancy funciona automaticamente via header `X-Company-ID`
- Todos os componentes são type-safe com TypeScript


