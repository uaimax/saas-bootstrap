# Frontend — Análise do Módulo

> **Última atualização**: 2025-01
> **Domínio**: Frontend React + TypeScript + Tailwind CSS (direto)
> **Status**: ✅ Ativo (Fase 4) - Reescrito para Tailwind direto
> **Zona**: 🟢 VERDE (desenvolvimento normal)

---

## 🎯 Visão Geral

O frontend é uma **SPA (Single Page Application)** construída com:
- **React 19+** com TypeScript
- **Vite** como build tool
- **Tailwind CSS** para estilização (direto, sem shadcn/ui)
- **React Router** para roteamento
- **React Hook Form + Zod** para formulários

**Fase atual**: Fase 4 — Frontend Mínimo (Reescrito para Tailwind direto)

---

## 📁 Estrutura

```
frontend/
├── src/
│   ├── features/        # Módulos organizados por feature (estrutura modular)
│   │   ├── auth/       # Módulo de autenticação
│   │   │   ├── components/  # Componentes de auth (forms, etc)
│   │   │   ├── pages/       # Páginas de auth (Login, Register, OAuthCallback)
│   │   │   ├── services/    # Serviços de auth (socialAuth)
│   │   │   ├── hooks/       # Hooks de auth (useSocialProviders)
│   │   │   └── AuthContext.tsx  # Context de autenticação
│   │   ├── leads/      # Módulo de leads
│   │   │   ├── pages/       # Páginas de leads
│   │   │   ├── config/      # Configuração de recursos (leads.tsx)
│   │   │   └── services/    # Serviços de leads (se houver)
│   │   ├── admin/      # Módulo admin (Admin UI Kit)
│   │   │   ├── components/  # Componentes admin (layout, resources, forms, data-display)
│   │   │   ├── pages/       # Páginas admin (Dashboard, Settings)
│   │   │   └── hooks/       # Hooks admin (useTenant, usePermissions, etc)
│   │   ├── legal/      # Módulo legal
│   │   │   ├── components/  # Componentes legais (legal-document-dialog)
│   │   │   └── services/    # Serviços legais (legal.ts)
│   │   └── shared/     # Código compartilhado entre features (se necessário)
│   ├── components/     # Componentes compartilhados (ui, layout, theme)
│   ├── pages/          # Páginas gerais (Home, Dashboard)
│   ├── lib/            # Utilitários e helpers
│   ├── config/         # Configurações globais (api.ts)
│   └── assets/         # Imagens, fonts, etc
├── public/             # Arquivos estáticos
├── package.json        # Dependências
└── vite.config.ts      # Configuração do Vite
```

---

## 🏗️ Stack Principal

### Core
- **React 18+**: Biblioteca UI
- **TypeScript**: Type safety
- **Vite**: Build tool e dev server

### UI/Styling
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Componentes UI acessíveis
- **Radix UI**: Primitivos acessíveis (usado por shadcn/ui)

### State Management
- **React Context**: Estado global (quando necessário)
- **React Hooks**: Estado local

### HTTP Client
- **fetch API**: Cliente HTTP nativo
- **Axios** (opcional): Cliente HTTP alternativo

---

## 🔄 Integração com Backend

### Configuração de API

```typescript
// src/config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Company-ID': getCompanySlug(), // Multi-tenancy
  },
};
```

### Multi-Tenancy

O frontend deve enviar o header `X-Company-ID` em todas as requisições:

```typescript
// src/services/api.ts
const headers = {
  'X-Company-ID': companySlug,
  'Authorization': `Bearer ${token}`,
};
```

### Autenticação

```typescript
// src/services/auth.ts
export const login = async (email: string, password: string) => {
  const response = await fetch('/api/v1/accounts/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  // Armazenar token
  localStorage.setItem('token', data.token);
  return data;
};
```

---

## 📋 Convenções

### ALWAYS (Sempre Fazer)

1. **TypeScript** para type safety
2. **Componentes funcionais** com hooks
3. **shadcn/ui** para componentes UI
4. **Tailwind CSS** para estilização
5. **Tratamento de erros** em todas as chamadas de API
6. **Loading states** para operações assíncronas
7. **Validação de formulários** (client-side)

### NEVER (Nunca Fazer)

1. **Lógica de negócio no frontend** (delegar para backend)
2. **Secrets ou tokens hardcoded**
3. **Ignorar tratamento de erros de API**
4. **Componentes > 200 linhas** (quebrar em menores)
5. **Classes CSS customizadas** (usar Tailwind)
6. **Acessibilidade ignorada** (WCAG 2.1)

---

## 🎨 Componentes shadcn/ui

### Componentes Disponíveis

O projeto usa **shadcn/ui** — componentes acessíveis e customizáveis:

- `Button`, `Input`, `Label`
- `Card`, `Dialog`, `Dropdown`
- `Table`, `Form`, `Select`
- E mais...

### Uso

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const MyComponent = () => {
  return (
    <div>
      <Input placeholder="Email" />
      <Button>Enviar</Button>
    </div>
  );
};
```

---

## 🔗 Estrutura de Pastas (Modular)

### `src/features/` (Estrutura Modular)
Código organizado por feature/módulo:

```
features/
├── auth/            # Módulo de autenticação
│   ├── components/  # LoginForm, RegisterForm
│   ├── pages/       # Login, Register, OAuthCallback
│   ├── services/    # socialAuth
│   ├── hooks/       # useSocialProviders
│   └── AuthContext.tsx
├── leads/           # Módulo de leads
│   ├── pages/       # LeadsPage
│   └── config/      # leadResource (configuração)
├── admin/           # Módulo admin (Admin UI Kit)
│   ├── components/  # MainLayout, ResourceListPage, etc
│   ├── pages/       # DashboardPage, SettingsPage
│   └── hooks/       # useTenant, usePermissions, useResource
└── legal/           # Módulo legal
    ├── components/  # LegalDocumentDialog
    └── services/    # legal (getTerms, getPrivacyPolicy)
```

### `src/components/`
Componentes compartilhados:

```
components/
├── ui/              # Componentes shadcn/ui (button, input, card, etc)
├── Layout.tsx       # Layout principal
├── ProtectedRoute.tsx  # Proteção de rotas
└── theme-provider.tsx  # Provider de tema
```

### `src/pages/`
Páginas gerais (não específicas de feature):

```
pages/
├── Home.tsx         # Página inicial
└── Dashboard.tsx    # Dashboard geral (redireciona para /admin/dashboard)
```

### `src/config/`
Configurações globais:

```
config/
└── api.ts           # Cliente HTTP base (apiClient)
```

### `src/lib/`
Utilitários e helpers:

```
lib/
└── utils.ts         # Funções utilitárias (cn, etc)
```

---

## 🧪 Testes

### Estrutura (quando implementado)

```
src/
├── components/
│   └── __tests__/   # Testes de componentes
└── services/
    └── __tests__/   # Testes de services
```

### Ferramentas Recomendadas

- **Vitest**: Test runner (compatível com Vite)
- **React Testing Library**: Testes de componentes
- **MSW**: Mock Service Worker (mock de APIs)

---

## 📚 Referências

- `@backend/ANALYSIS.md` — Análise do backend
- `@docs/FRONTEND_INTEGRATION.md` — Guia de integração
- `@docs/ARCHITECTURE.md` — Decisões arquiteturais
- `@CLAUDE.md` — Contexto global
- `@AGENTS.md#007frontend` — Agente frontend
- `@frontend/.context/shadcn-ui-guide.md` — Guia do shadcn/ui

---

## ⚠️ Invariantes (Nunca Quebrar)

1. **Header `X-Company-ID` sempre enviado** em requisições
2. **Token sempre armazenado** de forma segura
3. **Erros sempre tratados** (não deixar quebrar UI)
4. **TypeScript sempre usado** (não usar `any`)
5. **Acessibilidade sempre respeitada** (WCAG 2.1)

---

## 🚀 Próximos Passos Recomendados

1. Implementar roteamento (React Router)
2. Adicionar estado global (Context API ou Zustand)
3. Implementar autenticação completa
4. Adicionar testes de componentes
5. Implementar tratamento de erros global
6. Adicionar loading states globais

---

## 🔍 Anchors Semânticos

| Termo | Significado |
|-------|-------------|
| `shadcn/ui` | Biblioteca de componentes UI acessíveis |
| `X-Company-ID` | Header HTTP com slug da company |
| `Vite` | Build tool e dev server |
| `Tailwind CSS` | Utility-first CSS framework |
| `WCAG` | Web Content Accessibility Guidelines |


