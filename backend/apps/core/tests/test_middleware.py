"""Testes para middleware de multi-tenancy."""

from django.test import RequestFactory, TestCase

from apps.accounts.models import Company, User
from apps.core.middleware import CompanyMiddleware


class CompanyMiddlewareTestCase(TestCase):
    """Testes para CompanyMiddleware."""

    def setUp(self) -> None:
        """Configuração inicial para os testes."""
        self.factory = RequestFactory()
        self.middleware = CompanyMiddleware(lambda request: None)
        self.company = Company.objects.create(name="Test Company", slug="test-company")

    def test_middleware_sets_company_from_header(self) -> None:
        """Testa que middleware define company quando header existe."""
        request = self.factory.get("/", HTTP_X_COMPANY_ID="test-company")
        self.middleware(request)

        self.assertIsNotNone(request.company)
        self.assertEqual(request.company.slug, "test-company")
        self.assertEqual(request.company, self.company)

    def test_middleware_sets_none_when_header_missing(self) -> None:
        """Testa que middleware define None quando header não existe."""
        request = self.factory.get("/")
        self.middleware(request)

        self.assertIsNone(request.company)

    def test_middleware_sets_none_when_company_not_found(self) -> None:
        """Testa que middleware define None quando company não existe."""
        request = self.factory.get("/", HTTP_X_COMPANY_ID="inexistente")
        self.middleware(request)

        self.assertIsNone(request.company)

    def test_middleware_ignores_inactive_companies(self) -> None:
        """Testa que middleware ignora companies inativas."""
        inactive_company = Company.objects.create(
            name="Inactive Company", slug="inactive-company", is_active=False
        )

        request = self.factory.get("/", HTTP_X_COMPANY_ID="inactive-company")
        self.middleware(request)

        self.assertIsNone(request.company)

    def test_middleware_handles_empty_header(self) -> None:
        """Testa que middleware lida com header vazio."""
        request = self.factory.get("/")
        self.middleware(request)

        self.assertIsNone(request.company)

    def test_middleware_rejects_invalid_slug_format(self) -> None:
        """Testa que middleware rejeita slugs com formato inválido."""
        # Testar vários formatos inválidos
        invalid_slugs = [
            "Company-Name",  # Maiúsculas
            "company_name",  # Underscore
            "company@name",  # Caracteres especiais
            "company name",  # Espaços
            "company.name",  # Ponto
            "../../etc/passwd",  # Path traversal
            "<script>",  # XSS attempt
        ]

        for invalid_slug in invalid_slugs:
            request = self.factory.get("/", HTTP_X_COMPANY_ID=invalid_slug)
            self.middleware(request)
            self.assertIsNone(
                request.company,
                f"Slug '{invalid_slug}' deveria ser rejeitado",
            )

    def test_middleware_accepts_valid_slug_format(self) -> None:
        """Testa que middleware aceita slugs com formato válido."""
        # Criar company com slug válido
        valid_company = Company.objects.create(
            name="Valid Company", slug="valid-company-123", is_active=True
        )

        request = self.factory.get("/", HTTP_X_COMPANY_ID="valid-company-123")
        self.middleware(request)

        self.assertIsNotNone(request.company)
        self.assertEqual(request.company, valid_company)
        request = self.factory.get("/", HTTP_X_COMPANY_ID="")
        self.middleware(request)

        self.assertIsNone(request.company)

    def test_middleware_handles_whitespace_in_header(self) -> None:
        """Testa que middleware remove espaços em branco do header."""
        request = self.factory.get("/", HTTP_X_COMPANY_ID="  test-company  ")
        self.middleware(request)

        self.assertIsNotNone(request.company)
        self.assertEqual(request.company.slug, "test-company")

