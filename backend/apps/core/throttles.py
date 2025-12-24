"""Throttles customizados para rate limiting."""

from rest_framework.throttling import UserRateThrottle


class CompanyRateThrottle(UserRateThrottle):
    """Throttle baseado em company (tenant).

    Permite diferentes limites por company, útil para planos diferentes.
    Por padrão, usa o mesmo limite de UserRateThrottle, mas pode ser
    customizado por company via settings ou banco de dados.
    """

    def get_cache_key(self, request, view) -> str:
        """Gera chave de cache incluindo company_id."""
        if request.user and request.user.is_authenticated:
            # Incluir company_id na chave para isolamento por tenant
            company_id = getattr(request, "company", None)
            company_suffix = f":{company_id.id}" if company_id else ""
            ident = f"{request.user.id}{company_suffix}"
        else:
            ident = self.get_ident(request)

        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }

    def get_rate(self) -> str:
        """Obtém rate do throttle.

        Pode ser customizado por company no futuro.
        """
        return super().get_rate()

