"""Exemplos de uso do sistema de cache.

Este arquivo serve como referência de como usar o cache em diferentes cenários.
Não deve ser importado em produção.
"""

from apps.core.cache import cache_get_or_set, cache_invalidate_company, get_cache_key
from django.core.cache import cache


# Exemplo 1: Cache simples com timeout
def exemplo_cache_simples():
    """Cache básico sem multi-tenancy."""
    key = "user_count"
    count = cache_get_or_set(
        key,
        lambda: 100,  # Função que retorna o valor
        timeout=60,  # 1 minuto
    )
    return count


# Exemplo 2: Cache com isolamento por tenant
def exemplo_cache_tenant(company_id: str, user_id: str):
    """Cache isolado por company."""
    key = get_cache_key("user_profile", user_id, company_id=company_id)

    def fetch_user():
        # Simulação de query pesada
        from apps.accounts.models import User
        return User.objects.get(id=user_id)

    profile = cache_get_or_set(key, fetch_user, timeout=300, company_id=company_id)
    return profile


# Exemplo 3: Invalidação de cache por tenant
def exemplo_invalidar_tenant(company_id: str):
    """Invalida todo o cache de uma company."""
    count = cache_invalidate_company(company_id)
    return f"Invalidadas {count} chaves"


# Exemplo 4: Cache em ViewSet
def exemplo_viewset_cache():
    """Exemplo de como usar cache em um ViewSet."""
    # Em um ViewSet:
    # from apps.core.cache import cache_get_or_set, get_cache_key
    #
    # def list(self, request):
    #     company = request.company
    #     cache_key = get_cache_key("leads_list", company_id=company.id)
    #
    #     leads = cache_get_or_set(
    #         cache_key,
    #         lambda: list(Lead.objects.filter(company=company).values()),
    #         timeout=60,
    #         company_id=company.id,
    #     )
    #     return Response(leads)
    pass

