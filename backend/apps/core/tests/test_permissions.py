"""Testes para permissões de segurança multi-tenant."""

from django.test import TestCase
from rest_framework.test import APIRequestFactory

from apps.accounts.models import Company, User
from apps.core.models import BaseModel
from apps.core.permissions import CompanyObjectPermission
from apps.leads.models import Lead


class CompanyObjectPermissionTestCase(TestCase):
    """Testes para CompanyObjectPermission."""

    def setUp(self):
        """Configuração inicial."""
        self.factory = APIRequestFactory()
        self.permission = CompanyObjectPermission()

        # Criar duas companies
        self.company1 = Company.objects.create(
            name="Company 1",
            slug="company-1",
            is_active=True,
        )
        self.company2 = Company.objects.create(
            name="Company 2",
            slug="company-2",
            is_active=True,
        )

        # Criar usuários
        self.user1 = User.objects.create_user(
            email="user1@company1.com",
            password="testpass123",
            company=self.company1,
        )
        self.user2 = User.objects.create_user(
            email="user2@company2.com",
            password="testpass123",
            company=self.company2,
        )

        # Criar leads para cada company
        self.lead1 = Lead.objects.create(
            company=self.company1,
            name="Lead 1",
            email="lead1@example.com",
        )
        self.lead2 = Lead.objects.create(
            company=self.company2,
            name="Lead 2",
            email="lead2@example.com",
        )

    def test_permite_acesso_quando_objeto_pertence_à_company(self):
        """Testa que usuário pode acessar objeto de sua própria company."""
        request = self.factory.get("/")
        request.company = self.company1
        request.user = self.user1

        # Usuário da company1 pode acessar lead1 (mesma company)
        self.assertTrue(
            self.permission.has_object_permission(request, None, self.lead1)
        )

    def test_nega_acesso_quando_objeto_pertence_a_outra_company(self):
        """Testa que usuário NÃO pode acessar objeto de outra company."""
        request = self.factory.get("/")
        request.company = self.company1
        request.user = self.user1

        # Usuário da company1 NÃO pode acessar lead2 (company diferente)
        self.assertFalse(
            self.permission.has_object_permission(request, None, self.lead2)
        )

    def test_nega_acesso_quando_objeto_não_tem_company(self):
        """Testa que objeto sem company é negado."""
        # Criar objeto mock sem atributo company
        from unittest.mock import Mock

        obj_sem_company = Mock()
        # Não definir atributo 'company' no objeto

        request = self.factory.get("/")
        request.company = self.company1
        request.user = self.user1

        self.assertFalse(
            self.permission.has_object_permission(request, None, obj_sem_company)
        )

    def test_nega_acesso_quando_request_não_tem_company(self):
        """Testa que request sem company é negado."""
        request = self.factory.get("/")
        request.user = self.user1
        # request.company não definido

        self.assertFalse(
            self.permission.has_object_permission(request, None, self.lead1)
        )

    def test_has_permission_sempre_retorna_true(self):
        """Testa que has_permission sempre permite (validação é em has_object_permission)."""
        request = self.factory.get("/")
        request.user = self.user1

        # has_permission deve sempre retornar True
        # A validação real é feita em has_object_permission
        self.assertTrue(self.permission.has_permission(request, None))

