# CLAUDE.md — Contexto Global para Claude Code

> **Versão**: 1.0.0
> **Última atualização**: 2024-12
> **Compatível com**: Claude Code, Cursor, Windsurf

---

## 🎯 Propósito deste Arquivo

Este arquivo é o **ponto de entrada principal** para qualquer LLM operando neste repositório.
Ele define contexto, regras, limites e referências para navegação segura.

**Hierarquia de leitura obrigatória:**
1. Este arquivo (`CLAUDE.md`)
2. `@AGENTS.md` — Agentes especializados
3. `@docs/context/PROTECTED_AREAS.md` — Áreas proibidas
4. `ANALYSIS.md` do módulo em que está trabalhando

---

## 📦 Visão Geral do Projeto

| Aspecto | Valor |
|---------|-------|
| **Nome** | SaaS Bootstrap |
| **Stack** | Django 5 + Django REST Framework |
| **Arquitetura** | Multi-tenancy por `tenant_id` |
| **Banco Dev** | SQLite |
| **Banco Prod** | PostgreSQL |
| **Frontend** | React + Vite + TypeScript + shadcn/ui (Fase 4) |

### Estrutura Principal

```
saas-bootstrap/
├── backend/                 # Django Backend
│   ├── core/               # Projeto Django (settings, urls)
│   ├── apps/               # Apps modulares
│   │   ├── core/          # TenantModel, middleware
│   │   └── accounts/      # User, Tenant
│   └── api/               # Rotas API
├── frontend/               # React SPA + shadcn/ui (Fase 4)
└── docs/                   # Documentação
```

---

## 🔐 REGRAS ABSOLUTAS (SEMPRE SEGUIR)

### ALWAYS (Sempre Fazer)

1. **Ler contexto antes de agir**
   - Ler `ANALYSIS.md` do módulo atual
   - Verificar `@docs/context/PROTECTED_AREAS.md`
   - Entender dependências

2. **Usar type hints** em todas as funções Python

3. **Manter arquivos < 300 linhas**

4. **Testes junto ao app** em `tests/`

5. **APIs com prefixo `/api/`** sempre

6. **Multi-tenancy**: Herdar `TenantModel` para dados de tenant

7. **Variáveis de ambiente**: Nunca hardcodar URLs ou secrets

### NEVER (Nunca Fazer)

1. **NUNCA modificar migrations existentes**
   - Caminho: `backend/apps/*/migrations/`
   - Risco: Quebra de banco de dados

2. **NUNCA alterar models de autenticação sem autorização**
   - `backend/apps/accounts/models.py` (User, Tenant)
   - `backend/apps/core/models.py` (TenantModel)

3. **NUNCA modificar middleware de tenant**
   - `backend/apps/core/middleware.py`
   - Risco: Vazamento entre tenants

4. **NUNCA alterar settings de produção**
   - `backend/config/settings/prod.py`
   - Risco: Exposição de produção

5. **NUNCA executar comandos destrutivos**
   - `DROP`, `DELETE` em massa, `migrate --fake`

6. **NUNCA criar código sem docstrings** em funções públicas

---

## 🚦 Sistema de Zonas de Proteção

### 🔴 ZONA VERMELHA — NUNCA TOCAR

```
backend/apps/accounts/migrations/
backend/apps/accounts/models.py
backend/apps/core/models.py
backend/apps/core/middleware.py
backend/config/settings/prod.py
```

**Ação**: PARAR e solicitar autorização humana.

### 🟡 ZONA AMARELA — CUIDADO ESPECIAL

```
backend/config/settings/base.py
backend/config/settings/dev.py
backend/config/urls.py
dev-start.sh
run-tests.sh
Makefile
```

**Ação**: Criar PLAN, aguardar aprovação, mudanças mínimas.

### 🟢 ZONA VERDE — DESENVOLVIMENTO NORMAL

```
backend/api/
backend/apps/ (novos apps)
frontend/
docs/
tests/
```

**Ação**: Desenvolver seguindo convenções.

---

## 🤖 Agentes Especializados

Este repositório usa agentes @007 para tarefas específicas.

**Referência completa**: `@AGENTS.md`

| Agente | Quando Usar |
|--------|-------------|
| `@007architect` | Decisões de arquitetura, novos módulos |
| `@007backend` | Django, APIs, models, services |
| `@007frontend` | React, UI, componentes, shadcn/ui |
| `@007security` | Auth, authz, vulnerabilidades |
| `@007qa` | Testes, validação, cobertura |
| `@007devops` | Deploy, CI/CD, containers |
| `@007explorer` | Análise, onboarding, descoberta |
| `@007docs` | Documentação, README, contexto |

---

## 🔄 Workflow de Trabalho

Antes de qualquer implementação:

```
1. DISCOVERY   → Entender contexto (ler ANALYSIS.md)
2. ZONE CHECK  → Verificar se área é protegida
3. ANALYSIS    → Avaliar impactos e dependências
4. PLAN        → Criar plano (aguardar aprovação se zona amarela/vermelha)
5. IMPLEMENT   → Executar mudanças incrementais
6. REVIEW      → Validar e testar
```

**Referência completa**: `@docs/context/STATE_MACHINE.md`

---

## 📍 Anchors Semânticos (Anti-Alucinação)

Termos-chave deste projeto — use para validar entendimento:

| Termo | Significado Correto |
|-------|---------------------|
| `TenantModel` | Base model com `tenant_id` para multi-tenancy |
| `X-Tenant-ID` | Header HTTP com slug do tenant |
| `TenantMiddleware` | Define `request.tenant` |
| `/api/` | Prefixo obrigatório para todas as APIs |
| `AUTH_USER_MODEL` | `accounts.User` (customizado) |
| `Jazzmin` | Tema do Django Admin |

---

## 🧭 Navegação de Contexto

### Para entender o projeto
```
@README.md
@docs/ARCHITECTURE.md
```

### Para entender regras de proteção
```
@docs/context/PROTECTED_AREAS.md
@docs/context/ORCHESTRATION.md
```

### Para entender um módulo específico
```
@backend/ANALYSIS.md
@backend/apps/accounts/ANALYSIS.md
@backend/apps/core/ANALYSIS.md
```

### Para entender agentes
```
@AGENTS.md
```

---

## 🛠️ Comandos Úteis

```bash
# Iniciar desenvolvimento
./dev-start.sh

# Executar testes
./run-tests.sh

# Aplicar migrations
make migrate

# Criar migrations
make makemigrations
```

---

## 📚 Referências Externas

- [Django 5 Docs](https://docs.djangoproject.com/en/5.0/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [drf-spectacular](https://drf-spectacular.readthedocs.io/)

---

## ⚠️ Lembrete Final

> **Antes de modificar qualquer código, pergunte-se:**
>
> 1. Estou em uma zona protegida?
> 2. Li o ANALYSIS.md deste módulo?
> 3. Entendo as invariantes?
> 4. Minhas mudanças seguem as convenções?
> 5. Preciso de autorização humana?

**Em caso de dúvida, PARE e pergunte.**

