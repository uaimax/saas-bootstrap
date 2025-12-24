"""Testes para ViewSets base."""

from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import Company, User
from apps.core.models import CompanyModel
from apps.core.viewsets import CompanyViewSet
from django.db import models


# Model de teste que herda CompanyModel
# Nota: Este model não será criado no banco, apenas usado para testes
class MockCompanyModel(CompanyModel):
    """Model mock para validar CompanyViewSet."""

    name = models.CharField(max_length=100)

    class Meta:
        app_label = "core"
        # Não criar tabela no banco
        managed = False


# ViewSet de teste
class MockCompanyViewSet(CompanyViewSet):
    """ViewSet mock para testes."""

    queryset = MockCompanyModel.objects.all()


class CompanyViewSetTestCase(TestCase):
    """Testes para CompanyViewSet."""

    def setUp(self) -> None:
        """Configuração inicial."""
        self.client = APIClient()
        self.company1 = Company.objects.create(name="Company 1", slug="company-1")
        self.company2 = Company.objects.create(name="Company 2", slug="company-2")
        self.user1 = User.objects.create_user(
            email="user1@test.com", password="pass", company=self.company1
        )

    def test_viewset_filters_by_company(self) -> None:
        """Testa que ViewSet filtra por company automaticamente."""
        # Usar Lead como modelo de teste real (já que MockCompanyModel não tem tabela)
        from apps.leads.models import Lead
        from rest_framework.test import APIRequestFactory
        from rest_framework.request import Request

        obj1 = Lead.objects.create(name="Obj 1", company=self.company1, email="obj1@test.com")
        obj2 = Lead.objects.create(name="Obj 2", company=self.company2, email="obj2@test.com")

        # Criar ViewSet para Lead com request real do DRF
        from apps.leads.viewsets import LeadViewSet
        factory = APIRequestFactory()
        wsgi_request = factory.get("/api/leads/", HTTP_X_COMPANY_ID=self.company1.slug)
        request = Request(wsgi_request)  # Converter para Request do DRF
        request.company = self.company1  # Simular middleware

        viewset = LeadViewSet()
        viewset.request = request
        viewset.action = "list"

        queryset = viewset.get_queryset()
        self.assertEqual(queryset.count(), 1)
        self.assertEqual(queryset.first(), obj1)


    def test_viewset_perform_create_sets_company(self) -> None:
        """Testa que perform_create define company automaticamente."""
        from apps.leads.viewsets import LeadViewSet
        from apps.leads.serializers import LeadSerializer

        viewset = LeadViewSet()
        viewset.request = type("Request", (), {"company": self.company1})()

        # Mock serializer
        class MockSerializer:
            def save(self, company=None):
                self.company = company

        serializer = MockSerializer()
        viewset.perform_create(serializer)

        self.assertEqual(serializer.company, self.company1)

