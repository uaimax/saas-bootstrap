# Erros Comuns e Soluções - Frontend

Este arquivo documenta **erros específicos do frontend** já enfrentados e suas soluções.

---

---
date: 2024-12-23
category: frontend
tags: [tailwindcss, shadcn-ui, compatibilidade, postcss]
severity: high
---

## Tailwind CSS 4.x Incompatível com shadcn/ui

### Contexto
Projeto usando Tailwind CSS 4.1.18 com shadcn/ui. CSS não estava carregando corretamente, design aparecendo sem estilos.

### Problema
- Tailwind CSS 4.x tem sintaxe e configuração completamente diferentes da v3
- shadcn/ui foi desenvolvido para Tailwind CSS 3.x
- `@tailwindcss/postcss` é necessário na v4, mas shadcn/ui não suporta
- `@apply` com classes customizadas não funciona da mesma forma na v4
- CSS gerado estava incompleto (4.55 kB vs 10.60 kB esperado)

### Solução
**Downgrade para Tailwind CSS 3.4.1:**

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.1 postcss@^8.4.35 autoprefixer@^10.4.18
npm install -D tailwindcss-animate
```

**Atualizar `postcss.config.js`:**
```js
export default {
  plugins: {
    tailwindcss: {},  // Não usar @tailwindcss/postcss
    autoprefixer: {},
  },
}
```

**Configurar `tailwind.config.js` completo para shadcn/ui:**
- Adicionar plugin `tailwindcss-animate`
- Configurar todas as cores do tema shadcn/ui
- Configurar keyframes e animações

### Lições Aprendidas
- **SEMPRE verificar compatibilidade de versões** antes de instalar
- shadcn/ui requer Tailwind CSS 3.x (não 4.x)
- Quando usar bibliotecas que dependem de versões específicas, verificar documentação oficial
- CSS gerado menor que esperado pode indicar problema de configuração

### Referências
- Arquivos: `frontend/tailwind.config.js`, `frontend/postcss.config.js`
- Docs: [shadcn/ui installation](https://ui.shadcn.com/docs/installation)

---

---
date: 2024-12-23
category: frontend
tags: [typescript, jsdoc, comentários, build]
severity: medium
---

## Comentários JSDoc Mal Formatados Quebram Build

### Contexto
Build do frontend falhando com erro "Expected */ to terminate multi-line comment".

### Problema
Comentários JSDoc usando sintaxe incorreta:
```typescript
/**Contexto de autenticação para gerenciar estado do usuário."""
```

O problema é o `"""` no final - isso não é sintaxe válida para comentários JSDoc em TypeScript/JavaScript.

### Solução
**Formato correto:**
```typescript
/** Contexto de autenticação para gerenciar estado do usuário. */
```

**Regras:**
- Usar `/**` para iniciar (com espaço após `/**`)
- Usar `*/` para fechar
- NUNCA usar `"""` (isso é Python, não TypeScript)
- Espaço após `/**` é recomendado para melhor formatação

### Lições Aprendidas
- Comentários JSDoc devem seguir sintaxe TypeScript/JavaScript
- Não misturar sintaxe de diferentes linguagens
- Erros de build podem ser causados por comentários mal formatados
- Sempre validar sintaxe antes de commit

### Referências
- Arquivos: `frontend/src/**/*.tsx`, `frontend/src/**/*.ts`

---

---
date: 2025-01-27
category: frontend
tags: [react, hooks, useEffect, rules-of-hooks]
severity: critical
---

## Violação das Regras dos Hooks: useEffect Após Retornos Condicionais

### Contexto
Componente `TenantSelector` quebrando com erro "React has detected a change in the order of Hooks" e página ficando em branco.

### Problema
O `useEffect` estava sendo chamado **depois** de retornos condicionais (`return null`), violando as regras dos hooks do React:

```typescript
// ❌ ERRADO
export function TenantSelector() {
  const { user } = useAuth();
  const { tenants, loading } = useAvailableTenants();

  if (loading) {
    return null; // Retorno condicional ANTES do useEffect
  }

  if (!user) {
    return null; // Outro retorno condicional
  }

  useEffect(() => { // ❌ Hook chamado DEPOIS de retornos condicionais
    // ...
  }, [deps]);
}
```

**Erro resultante:**
```
React has detected a change in the order of Hooks called by TenantSelector.
This will lead to bugs and errors if not fixed.
```

### Solução
**TODOS os hooks devem ser chamados ANTES de qualquer retorno condicional:**

```typescript
// ✅ CORRETO
export function TenantSelector() {
  // 1. TODOS OS HOOKS PRIMEIRO (sempre na mesma ordem)
  const { user } = useAuth();
  const { tenants, loading } = useAvailableTenants();
  const [open, setOpen] = useState(false);

  useEffect(() => { // ✅ Hook ANTES de qualquer return
    // ...
  }, [deps]);

  // 2. DEPOIS fazer retornos condicionais
  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  // 3. Resto do componente
  return <div>...</div>;
}
```

### Lições Aprendidas
- **SEMPRE** chamar todos os hooks no topo do componente, antes de qualquer `return`
- A ordem dos hooks deve ser **sempre a mesma** em cada render
- Retornos condicionais (`return null`, `return <Component />`) devem vir **depois** de todos os hooks
- Violar essa regra causa erros silenciosos que podem quebrar o render completamente
- Páginas em branco podem ser causadas por violação das regras dos hooks

### Referências
- Arquivos: `frontend/src/components/admin/layout/TenantSelector.tsx`
- Docs: [Rules of Hooks - React](https://react.dev/reference/rules/rules-of-hooks)

---

---
date: 2025-01-27
category: frontend
tags: [react, hooks, useEffect, dependencies, state-management]
severity: high
---

## useEffect com Dependências Incorretas Causa Re-execuções Desnecessárias

### Contexto
Componente `TenantSelector` deselecionando empresa automaticamente ao navegar entre páginas.

### Problema
O `useEffect` estava usando `tenants` (array) como dependência, causando re-execuções toda vez que o array mudava (mesmo que fosse o mesmo conteúdo):

```typescript
// ❌ ERRADO
useEffect(() => {
  if (isSuperAdmin && tenants.length > 0) {
    const currentSlug = localStorage.getItem("company_id");
    if (!currentSlug) {
      // Selecionar primeira empresa
    }
  }
}, [isSuperAdmin, tenants]); // ❌ Array como dependência causa re-execuções
```

**Problema:** Toda vez que `tenants` é recriado (mesmo com mesmo conteúdo), o `useEffect` executa novamente, potencialmente limpando a seleção.

### Solução
**Usar `tenants.length` ou verificar se realmente precisa atualizar:**

```typescript
// ✅ CORRETO
useEffect(() => {
  if (isSuperAdmin && tenants.length > 0) {
    const currentSlug = localStorage.getItem("company_id") || localStorage.getItem("tenant_id");

    if (!currentSlug) {
      // Só selecionar se não houver empresa selecionada
      const firstTenant = tenants[0];
      if (firstTenant?.slug) {
        localStorage.setItem("company_id", firstTenant.slug);
      }
    } else {
      // Verificar se empresa selecionada ainda existe
      const selectedTenantExists = tenants.some((t) => t.slug === currentSlug);
      if (!selectedTenantExists && tenants.length > 0) {
        // Só atualizar se empresa não existir mais
        const firstTenant = tenants[0];
        if (firstTenant?.slug) {
          localStorage.setItem("company_id", firstTenant.slug);
        }
      }
    }
  }
}, [isSuperAdmin, tenants.length]); // ✅ Usar length ao invés de array completo
```

### Lições Aprendidas
- **NUNCA** usar arrays/objetos como dependências diretas do `useEffect` se não precisar reagir a mudanças de conteúdo
- Usar valores primitivos (`length`, `id`, etc.) quando possível
- Sempre verificar se realmente precisa atualizar antes de modificar estado/localStorage
- Re-execuções desnecessárias podem causar bugs sutis (deseleção, re-renders, etc.)
- Verificar se valor já existe antes de sobrescrever

### Referências
- Arquivos: `frontend/src/components/admin/layout/TenantSelector.tsx`
- Docs: [useEffect Dependencies - React](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)

---
