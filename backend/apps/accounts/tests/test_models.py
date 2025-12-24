"""Testes para models do app accounts."""

import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from apps.accounts.models import Company

User = get_user_model()


@pytest.mark.django_db
class TestCompany:
    """Testes para modelo Company."""

    def test_create_company(self) -> None:
        """Testa criação de company."""
        company = Company.objects.create(name="Test Company", slug="test-company")
        assert company.name == "Test Company"
        assert company.slug == "test-company"
        assert company.is_active is True

    def test_company_str(self) -> None:
        """Testa representação string da company."""
        company = Company.objects.create(name="My Company", slug="my-company")
        assert str(company) == "My Company"

    def test_company_slug_unique(self) -> None:
        """Testa que slug deve ser único."""
        Company.objects.create(name="Company 1", slug="company-1")
        with pytest.raises(Exception):  # IntegrityError ou ValidationError
            Company.objects.create(name="Company 2", slug="company-1")


@pytest.mark.django_db
class TestUser:
    """Testes para modelo User customizado."""

    def test_create_user_with_company(self) -> None:
        """Testa criação de usuário com company."""
        company = Company.objects.create(name="Test Company", slug="test-company")
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            company=company,
        )
        assert user.email == "test@example.com"
        assert user.company == company
        assert user.check_password("testpass123")

    def test_create_user_without_company(self) -> None:
        """Testa criação de usuário sem company (permitido)."""
        user = User.objects.create_user(
            email="test2@example.com",
            password="testpass123",
        )
        assert user.company is None

    def test_user_str(self) -> None:
        """Testa representação string do usuário."""
        company = Company.objects.create(name="My Company", slug="my-company")
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            company=company,
        )
        assert "test@example.com" in str(user)
        assert "My Company" in str(user)

    def test_user_str_no_company(self) -> None:
        """Testa representação string do usuário sem company."""
        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
        )
        assert "test@example.com" in str(user)
        assert "Sem empresa" in str(user)

