# Aprendizados Positivos - Frontend

Este arquivo documenta **soluções do frontend que funcionaram bem** e devem ser replicadas.

---

---
date: 2024-12-23
category: frontend
tags: [tailwindcss, shadcn-ui, configuração]
severity: medium
---

## Configuração Correta do shadcn/ui com Tailwind CSS 3.x

### Contexto
Setup completo do shadcn/ui funcionando corretamente.

### Solução que Funcionou
**Stack correta:**
- Tailwind CSS 3.4.1 (não 4.x)
- Plugin `tailwindcss-animate` para animações
- Configuração completa de cores do tema via variáveis CSS
- `@apply` funcionando corretamente com classes customizadas

**Estrutura de configuração:**
1. `tailwind.config.js` com todas as cores do shadcn/ui
2. `postcss.config.js` com `tailwindcss` e `autoprefixer`
3. `index.css` com variáveis CSS e `@tailwind` directives
4. `components.json` configurado corretamente

### Padrão a Replicar
- Sempre usar Tailwind CSS 3.x quando usar shadcn/ui
- Configurar todas as cores do tema via variáveis CSS HSL
- Usar `@apply` para estilos base quando possível
- Plugin `tailwindcss-animate` é essencial para animações do shadcn/ui

### Referências
- Arquivos: `frontend/tailwind.config.js`, `frontend/src/index.css`
- Docs: [shadcn/ui docs](https://ui.shadcn.com/docs)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, blocks, cli, instalação]
severity: high
---

## Uso Correto de Blocks do shadcn/ui

### Contexto
shadcn/ui oferece "blocks" (exemplos completos) que podem ser instalados via CLI e adaptados.

### Solução que Funcionou
**Processo completo:**
1. Instalar block: `npx shadcn@latest add login-05`
2. Mover arquivos de `@/components/` para `src/components/forms/`
3. Adaptar para nosso contexto:
   - Integrar com AuthContext
   - Adicionar React Hook Form + Zod
   - Conectar com endpoints do backend
   - Manter estrutura visual do block

**Estrutura resultante:**
- Componente em `components/forms/` com toda lógica
- Página apenas renderiza o componente
- Validação com Zod
- Tratamento de erros com Alert do shadcn/ui

### Padrão a Replicar
- Usar `npx shadcn@latest add [block-name]` para instalar blocks
- Sempre adaptar blocks (não usar "as is")
- Manter estrutura visual, integrar lógica de negócio
- Seguir padrão: componente separado, página apenas renderiza

### Referências
- Arquivos: `frontend/src/components/forms/login-form.tsx`
- Docs: [shadcn/ui blocks](https://ui.shadcn.com/blocks)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, componentes, reutilização, código-desnecessário]
severity: high
---

## Evitando CSS/Tailwind Desnecessário com shadcn/ui

### Contexto
Princípio fundamental: usar componentes shadcn/ui ao invés de criar CSS/Tailwind customizado.

### Solução que Funcionou
**Checklist antes de criar CSS:**
1. ✅ Verificar se shadcn/ui tem componente equivalente
2. ✅ Usar componente shadcn/ui se existir
3. ✅ Apenas customizar via props/variants se necessário
4. ✅ Usar `cn()` para combinar classes quando necessário

**Exemplos de substituição:**
- ❌ `<div className="p-4 border rounded-lg">` → ✅ `<Card><CardContent>`
- ❌ `<input className="w-full px-3 py-2 border">` → ✅ `<Input>`
- ❌ `<button className="px-4 py-2 bg-blue-500">` → ✅ `<Button>`
- ❌ `<div className="text-red-500">Erro</div>` → ✅ `<Alert variant="destructive">`

**Benefícios:**
- Menos código para manter
- Consistência visual automática
- Acessibilidade built-in
- Design system unificado

### Padrão a Replicar
- **SEMPRE verificar shadcn/ui antes de criar CSS**
- Usar componentes ao invés de classes Tailwind diretas
- Customizar apenas quando realmente necessário
- Manter consistência com design system

### Referências
- Arquivos: `frontend/src/components/ui/`
- Docs: [shadcn/ui components](https://ui.shadcn.com/docs/components)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, theming, dark-mode, next-themes]
severity: high
---

## Implementação de Dark Mode Sem CSS Customizado

### Contexto
shadcn/ui já tem todas as variáveis CSS para dark mode, só precisa de um provider.

### Solução que Funcionou
**Stack:**
- `next-themes` para gerenciar tema
- CSS variables do shadcn/ui (já configuradas)
- `ThemeProvider` wrapper simples
- `ThemeToggle` usando DropdownMenu do shadcn/ui

**Zero CSS customizado:**
- Todas as cores via CSS variables em `index.css`
- `.dark` class aplicada automaticamente
- Componentes shadcn/ui respondem automaticamente
- Transições suaves sem código adicional

### Padrão a Replicar
- Usar `next-themes` para gerenciar tema
- NUNCA criar CSS customizado para dark mode
- Aproveitar variáveis CSS do shadcn/ui
- ThemeToggle sempre no Layout/Header

### Referências
- Arquivos: `frontend/src/components/theme-provider.tsx`, `frontend/src/components/theme-toggle.tsx`
- Docs: [next-themes](https://github.com/pacocoursey/next-themes)

---

---
date: 2024-12-24
category: frontend
tags: [typescript, vite, exports, interfaces]
severity: high
---

## Problema com Exportação de Interfaces TypeScript no Vite

### Contexto
Vite em modo dev pode ter problemas ao importar interfaces TypeScript entre módulos, causando erro: "does not provide an export named 'X'".

### Problema Encontrado
```typescript
// socialAuth.ts
export interface SocialProvider { ... }

// useSocialProviders.ts
import { SocialProvider } from '@/services/socialAuth'; // ❌ Erro no Vite dev
```

### Solução que Funcionou
**Definir o tipo/interface diretamente no arquivo que usa**, evitando exportação cross-module de interfaces:

```typescript
// useSocialProviders.ts
export interface SocialProvider {
  provider: string;
  name: string;
}

// Usar apenas funções exportadas de socialAuth.ts
import { getAvailableProviders } from '@/services/socialAuth';
```

**Alternativa:** Se precisar compartilhar, usar `export type` em vez de `export interface`, ou definir em arquivo separado de tipos.

### Padrão a Replicar
- Para tipos usados em poucos lugares, definir localmente
- Para tipos compartilhados, criar arquivo `types.ts` dedicado
- Preferir `export type` para compartilhamento entre módulos
- Testar sempre em modo dev do Vite (não apenas build)

### Referências
- Arquivos: `frontend/src/hooks/useSocialProviders.ts`, `frontend/src/services/socialAuth.ts`

---
