# Erros Comuns e Soluções

Este arquivo documenta **erros já enfrentados** e suas soluções para evitar repetição.

---

## ❌ NUNCA Modificar Migrations Existentes

**Data**: 2025-01-27
**Categoria**: backend
**Tags**: [django, migrations, database]
**Severidade**: critical

### Contexto
Tentativa de corrigir migration já aplicada em produção ou desenvolvimento.

### Problema
Modificar migrations existentes quebra o histórico do Django e pode causar inconsistências em ambientes que já aplicaram a migration.

### Solução
**SEMPRE criar nova migration** ao invés de modificar existente:

```bash
# ❌ ERRADO: Editar migration existente
# ✅ CORRETO: Criar nova migration
python manage.py makemigrations
```

### Lições Aprendidas
- Migrations são imutáveis após commit
- Se migration está errada, criar nova que corrige
- Nunca editar `migrations/` diretamente

### Referências
- `docs/context/PROTECTED_AREAS.md`
- `.cursorrules`

---

## ❌ Não Hardcodar Secrets ou URLs

**Data**: 2025-01-27
**Categoria**: backend
**Tags**: [security, configuration, environment]
**Severidade**: high

### Contexto
Código com valores hardcoded que devem ser configuráveis.

### Problema
Secrets ou URLs hardcoded no código:
- Não funcionam em diferentes ambientes
- São risco de segurança
- Dificultam deploy

### Solução
**SEMPRE usar variáveis de ambiente**:

```python
# ❌ ERRADO
DATABASE_URL = "postgresql://user:pass@localhost/db"

# ✅ CORRETO
import os
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3')
```

### Lições Aprendidas
- Usar `os.getenv()` ou `django-environ`
- Documentar variáveis necessárias em `.env.example`
- Nunca commitar `.env` no Git

### Referências
- `backend/config/settings/base.py`
- `.cursorrules`

---

## ❌ Não Ignorar Multi-tenancy em ViewSets

**Data**: 2025-01-27
**Categoria**: backend
**Tags**: [multi-tenancy, viewsets, security]
**Severidade**: critical

### Contexto
ViewSet que não filtra por tenant, permitindo acesso a dados de outros tenants.

---

## ❌ Remover CompanyObjectPermission ao Sobrescrever permission_classes

**Data**: 2025-12-24
**Categoria**: backend, security
**Tags**: [security, permissions, idor, multi-tenancy]
**Severidade**: critical

### Contexto
ViewSet que herda de `CompanyViewSet` mas sobrescreve `permission_classes` sem incluir `CompanyObjectPermission`.

### Problema
```python
# ❌ ERRADO
class MyViewSet(CompanyViewSet):
    permission_classes = [IsAuthenticated]  # Remove proteção IDOR!
```

### Solução
```python
# ✅ CORRETO
from apps.core.permissions import CompanyObjectPermission

class MyViewSet(CompanyViewSet):
    permission_classes = [IsAuthenticated, CompanyObjectPermission]
```

### Por Que É Crítico
- Remove proteção contra IDOR (Insecure Direct Object Reference)
- Permite acesso a objetos de outras companies
- Violação crítica de isolamento multi-tenant

### Lições Aprendidas
- **SEMPRE** incluir `CompanyObjectPermission` ao sobrescrever `permission_classes`
- `CompanyViewSet` já inclui por padrão, mas sobrescrever remove
- Verificar em code review se `CompanyObjectPermission` está presente

### Referências
- `backend/.context/security-patterns.md`
- `apps/core/permissions.py`
- `docs/SECURITY_ANALYSIS.md`

---

## ❌ Logar Dados Sensíveis Diretamente

**Data**: 2025-12-24
**Categoria**: backend, security
**Tags**: [security, logging, data-leakage]
**Severidade**: high

### Contexto
Código que loga senhas, tokens ou outros dados sensíveis diretamente.

### Problema
```python
# ❌ ERRADO
logger.info(f"Login attempt: password={password}, token={token}")
logger.error(f"API call failed: api_key={api_key}")
```

### Solução
```python
# ✅ CORRETO
# O SensitiveDataFilter redige automaticamente, mas melhor não logar
logger.info("Login attempt", extra={"user_id": user.id, "email": user.email})
logger.error("API call failed", extra={"endpoint": endpoint})
```

### Por Que É Crítico
- Dados sensíveis podem vazar em logs
- Logs são acessíveis por múltiplas pessoas/ferramentas
- Violação de LGPD se dados pessoais

### Lições Aprendidas
- **NUNCA** logar senhas, tokens, chaves diretamente
- `SensitiveDataFilter` redige automaticamente, mas não confiar apenas nisso
- Usar `extra={}` para contexto estruturado sem dados sensíveis

### Referências
- `backend/.context/security-patterns.md`
- `apps/core/logging.py`
- `docs/SECURITY_ANALYSIS.md`

---

## ❌ Não Ignorar Multi-tenancy em ViewSets

**Data**: 2025-01-27
**Categoria**: backend
**Tags**: [multi-tenancy, viewsets, security]
**Severidade**: critical

### Contexto
ViewSet que não filtra por tenant, permitindo acesso a dados de outros tenants.

### Problema
ViewSet sem filtro de tenant permite vazamento de dados entre tenants (violação de isolamento).

### Solução
**SEMPRE filtrar por `request.tenant`**:

```python
# ❌ ERRADO
class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()  # Sem filtro!

# ✅ CORRETO
class LeadViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return Lead.objects.filter(tenant=self.request.tenant)
```

### Lições Aprendidas
- Sempre verificar filtro de tenant em ViewSets
- Testar isolamento de dados
- Usar `TenantModel` facilita, mas não garante (ainda precisa filtrar)

### Referências
- `backend/apps/core/middleware.py`
- `docs/ARCHITECTURE.md`

---

## ❌ Não Criar Arquivos > 300 Linhas

**Data**: 2025-01-27
**Categoria**: general
**Tags**: [code-quality, maintainability]
**Severidade**: medium

### Contexto
Arquivo Python muito grande, difícil de manter e entender.

### Problema
Arquivos grandes:
- São difíceis de navegar
- Violam princípio de responsabilidade única
- Dificultam trabalho da LLM (contexto limitado)

### Solução
**Quebrar em módulos menores**:

```python
# ❌ ERRADO: arquivo.py com 500+ linhas
# ✅ CORRETO:
#   - arquivo/models.py
#   - arquivo/views.py
#   - arquivo/services.py
```

### Lições Aprendidas
- Máximo 300 linhas por arquivo
- Separar por responsabilidade (models, views, services)
- Facilita manutenção e compreensão

### Referências
- `.cursorrules`
- `AGENTS.md`

---

