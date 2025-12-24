"""Base ViewSets para APIs com multi-tenancy."""

from typing import TYPE_CHECKING

from django.db import models
from rest_framework import permissions, serializers, viewsets

from apps.core.permissions import CompanyObjectPermission

if TYPE_CHECKING:
    from apps.accounts.models import Company
    from rest_framework.response import Response


class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet base com filtro automático por company.

    Todos os ViewSets que trabalham com models CompanyModel devem herdar desta classe.
    O filtro por company é aplicado automaticamente usando request.company do middleware.
    Usa soft delete: destroy() marca como deletado ao invés de remover do banco.

    Segurança:
    - Valida explicitamente que objetos pertencem à company do request (previne IDOR)
    - Filtra automaticamente por company em todas as queries
    """

    permission_classes = [permissions.IsAuthenticated, CompanyObjectPermission]

    def get_queryset(self) -> models.QuerySet:
        """Retorna queryset filtrado por company e excluindo deletados."""
        queryset = super().get_queryset()

        # Filtra por company se disponível no request
        company: "Company | None" = getattr(self.request, "company", None)
        if company:
            queryset = queryset.filter(company=company)

        # objects manager já filtra deletados automaticamente
        return queryset

    def perform_create(self, serializer: serializers.Serializer) -> None:
        """Define company automaticamente ao criar."""
        company: "Company | None" = getattr(self.request, "company", None)
        if company:
            serializer.save(company=company)
        else:
            serializer.save()

    def destroy(self, request, *args, **kwargs) -> "Response":
        """Realiza soft delete ao invés de deletar permanentemente."""
        instance = self.get_object()
        # Verifica se tem método soft_delete (herda de SoftDeleteModel)
        if hasattr(instance, "soft_delete"):
            instance.soft_delete()
            from rest_framework.response import Response
            from rest_framework import status
            return Response(status=status.HTTP_204_NO_CONTENT)
        # Fallback para delete permanente se não tiver soft_delete
        return super().destroy(request, *args, **kwargs)


class BaseViewSet(viewsets.ModelViewSet):
    """ViewSet base sem filtro de company (para models globais).

    Use CompanyViewSet se o model precisa de multi-tenancy.
    """

    pass

