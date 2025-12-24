"""ViewSets for leads app."""

from django.db import models
from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import CompanyObjectPermission
from apps.core.viewsets import CompanyViewSet
from apps.leads.models import Lead
from apps.leads.serializers import LeadListSerializer, LeadSerializer


class LeadViewSet(CompanyViewSet):
    """ViewSet para modelo Lead com filtro automático por company."""

    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    # Inclui CompanyObjectPermission para validar ownership (previne IDOR)
    permission_classes = [IsAuthenticated, CompanyObjectPermission]

    def get_serializer_class(self) -> type[LeadSerializer | LeadListSerializer]:
        """Retorna serializer apropriado para a ação."""
        if self.action == "list":
            return LeadListSerializer
        return LeadSerializer

    def get_queryset(self) -> models.QuerySet[Lead]:
        """Retorna queryset filtrado por company e com filtros opcionais."""
        queryset = super().get_queryset()

        # Filtros opcionais
        status = self.request.query_params.get("status")
        if status:
            queryset = queryset.filter(status=status)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search)
                | models.Q(email__icontains=search)
                | models.Q(client_company__icontains=search)
            )

        return queryset
