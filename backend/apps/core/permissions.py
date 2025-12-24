"""Permissões customizadas para segurança multi-tenant."""

from rest_framework.permissions import BasePermission


class CompanyObjectPermission(BasePermission):
    """Valida que objeto pertence à company do request.

    Previne IDOR (Insecure Direct Object Reference) garantindo que
    usuários só possam acessar recursos de sua própria company.

    Uso:
        class MyViewSet(CompanyViewSet):
            permission_classes = [IsAuthenticated, CompanyObjectPermission]
    """

    def has_object_permission(self, request, view, obj) -> bool:
        """Verifica se o objeto pertence à company do request."""
        # Se objeto não tem company, negar acesso
        if not hasattr(obj, "company"):
            return False

        # Obter company do request (definida pelo middleware)
        request_company = getattr(request, "company", None)
        if not request_company:
            # Se não há company no request, negar acesso
            return False

        # Comparar IDs (suporta UUID e inteiros)
        return obj.company_id == request_company.id

    def has_permission(self, request, view) -> bool:
        """Permite acesso à view (validação de objeto é feita em has_object_permission)."""
        # Esta permissão valida ownership, não permissão de acesso geral
        # A permissão de autenticação (IsAuthenticated) deve ser aplicada separadamente
        return True

