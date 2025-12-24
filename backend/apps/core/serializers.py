"""Base serializers para APIs."""

from rest_framework import serializers


class CompanySerializer(serializers.ModelSerializer):
    """Serializer base para models CompanyModel.

    Inclui company_id e timestamps automaticamente.
    """

    company_id = serializers.IntegerField(source="company.id", read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True


class BaseSerializer(serializers.ModelSerializer):
    """Serializer base para models sem company (globais).

    Use CompanySerializer se o model precisa de multi-tenancy.
    """

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True
