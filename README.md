# SaaS Bootstrap

Projeto Django 5 + DRF para lançamento rápido de MicroSaaS.

## 🚀 Início Rápido

```bash
# Inicia ambiente de desenvolvimento (backend + frontend)
./dev-start.sh

# Reiniciar tudo (mata sessão existente e recria)
./dev-start.sh --restart

# Executa testes
./run-tests.sh
```

**Nota:** O script usa `tmux` se disponível (recomendado). Se não tiver tmux instalado, roda apenas o backend em modo simples.

## 📁 Estrutura

```
backend/
├── config/        # Projeto Django (settings, urls, wsgi)
└── apps/          # Apps modulares
    └── core/      # App base (models, mixins, viewsets)

frontend/          # React SPA (Fase 4)
```

## 🛠️ Comandos Make

```bash
make dev           # Inicia servidor de desenvolvimento
make test          # Executa testes
make migrate       # Aplica migrations
make seed          # Popula dados de exemplo (tenants, users, leads)
make seed-clear    # Limpa e recria dados de exemplo
```

## 🔐 LGPD - Compliance

O sistema inclui auditoria completa para LGPD:

- ✅ Captura automática de mudanças em dados pessoais
- ✅ Política de retenção configurável (mínimo: 1 ano)
- ✅ Comando de limpeza: `python manage.py cleanup_audit_logs`
- ✅ API e Admin para consulta de logs

**Configuração obrigatória** no `.env`:
```bash
AUDIT_LOG_RETENTION_DAYS=1095  # 3 anos (recomendado)
```

📚 [Documentação LGPD](docs/LGPD_COMPLIANCE.md)

## ⚡ Performance e Proteção

O bootstrap inclui sistemas estruturais para performance e segurança:

- ✅ **Cache Strategy** (Redis) - Melhora performance de queries frequentes
- ✅ **Rate Limiting** (Throttling) - Protege APIs de abuso
- ✅ **Logging Estruturado** - Facilita debugging e monitoramento

📚 [Guia de Cache e Performance](docs/CACHE_AND_PERFORMANCE.md) | [Variáveis de Ambiente](docs/ENV_VARIABLES.md)

## 📋 Fases do Projeto

- ✅ Fase 1: Fundação (estrutura, settings, scripts)
- ✅ Fase 2: API Base (DRF, OpenAPI)
- ✅ Fase 3: Módulo de Exemplo (Leads)
- ✅ Fase 4: Frontend Mínimo (React + shadcn/ui)

## 📚 Documentação

- [Setup como Template](docs/TEMPLATE_SETUP.md) - **Comece aqui se usar como template**
- [Guia dev-start.sh](docs/DEV_START.md) - **Como usar o script de desenvolvimento**
- [Compliance LGPD](docs/LGPD_COMPLIANCE.md) - **Sistema de auditoria para LGPD**
- [Arquitetura](docs/ARCHITECTURE.md) - Decisões técnicas e estrutura
- [Deploy](docs/DEPLOYMENT.md) - Guia de deploy e migração
- [Cuidados Implementados](docs/CAREFUL_CHANGES.md) - Preparação para separação futura

## 🔧 Tecnologias

### Backend
- Django 5.x
- Django REST Framework
- Django Jazzmin (Admin)
- pytest-django
- SQLite (dev) / PostgreSQL (prod)

### Frontend (Fase 4)
- React 18+ + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui (componentes UI)

