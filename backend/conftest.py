"""Fixtures globais para testes pytest-django."""

import pytest
from django.contrib.auth import get_user_model

from apps.accounts.models import Tenant

User = get_user_model()


@pytest.fixture
def tenant(db) -> Tenant:
    """Cria um tenant de teste."""
    return Tenant.objects.create(name="Test Tenant", slug="test-tenant")


@pytest.fixture
def user(db, tenant: Tenant) -> User:
    """Cria um usuário de teste com tenant."""
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
        tenant=tenant,
    )

