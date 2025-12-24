"""Utilitários de cache para multi-tenancy."""

from typing import Any, Optional

from django.core.cache import cache
from django.core.cache.backends.base import BaseCache


def get_cache_key(prefix: str, *args, company_id: Optional[str] = None) -> str:
    """Gera chave de cache com prefixo e company_id.

    Args:
        prefix: Prefixo da chave (ex: 'user_profile')
        *args: Argumentos adicionais para a chave
        company_id: ID da company (opcional, para isolamento multi-tenant)

    Returns:
        Chave de cache formatada: 'prefix:company_id:arg1:arg2:...'
    """
    parts = [prefix]
    if company_id:
        parts.append(str(company_id))
    parts.extend(str(arg) for arg in args)
    return ":".join(parts)


def cache_get_or_set(
    key: str,
    callable_func: callable,
    timeout: int = 300,
    company_id: Optional[str] = None,
) -> Any:
    """Obtém valor do cache ou executa função e armazena.

    Args:
        key: Chave base do cache
        callable_func: Função a executar se não estiver em cache
        timeout: Tempo de expiração em segundos (padrão: 5 minutos)
        company_id: ID da company para isolamento

    Returns:
        Valor do cache ou resultado da função
    """
    cache_key = get_cache_key(key, company_id=company_id) if company_id else key

    value = cache.get(cache_key)
    if value is None:
        value = callable_func()
        cache.set(cache_key, value, timeout)
    return value


def cache_invalidate_pattern(pattern: str) -> int:
    """Invalida todas as chaves que correspondem ao padrão.

    Args:
        pattern: Padrão da chave (ex: 'user_profile:*')

    Returns:
        Número de chaves invalidadas
    """
    # django-redis suporta padrões via iter_keys
    try:
        keys = cache.keys(pattern)
        if keys:
            cache.delete_many(keys)
            return len(keys)
    except AttributeError:
        # Fallback se não suportar padrões
        pass
    return 0


def cache_invalidate_company(company_id: str, prefix: Optional[str] = None) -> int:
    """Invalida todo o cache de uma company.

    Args:
        company_id: ID da company
        prefix: Prefixo opcional para filtrar (ex: 'user_profile')

    Returns:
        Número de chaves invalidadas
    """
    pattern = f"{prefix}:{company_id}:*" if prefix else f"*:{company_id}:*"
    return cache_invalidate_pattern(pattern)

