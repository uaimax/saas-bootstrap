"""Serializers for leads app."""

from rest_framework import serializers

from apps.core.serializers import CompanySerializer
from apps.leads.models import Lead


class LeadSerializer(CompanySerializer):
    """Serializer para modelo Lead."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "company_id",
            "name",
            "email",
            "phone",
            "client_company",
            "status",
            "status_display",
            "notes",
            "source",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "company_id", "created_at", "updated_at"]


class LeadListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de leads."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "email",
            "client_company",
            "status",
            "status_display",
            "source",
            "created_at",
        ]

