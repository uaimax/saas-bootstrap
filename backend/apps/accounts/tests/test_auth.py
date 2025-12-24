"""Testes para autenticação."""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.accounts.models import Company

User = get_user_model()


class AuthenticationTestCase(TestCase):
    """Testes para endpoints de autenticação."""

    def setUp(self) -> None:
        """Configuração inicial."""
        self.client = APIClient()
        self.company = Company.objects.create(name="Test Company", slug="test-company")
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            company=self.company,
            first_name="Test",
            last_name="User",
        )

    def test_login_success(self) -> None:
        """Testa login bem-sucedido."""
        response = self.client.post(
            "/api/auth/login/",
            {"email": "test@example.com", "password": "testpass123"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.json())
        self.assertEqual(response.json()["user"]["email"], "test@example.com")

    def test_login_invalid_credentials(self) -> None:
        """Testa login com credenciais inválidas."""
        response = self.client.post(
            "/api/auth/login/",
            {"email": "test@example.com", "password": "wrongpass"},
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self) -> None:
        """Testa logout."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post("/api/auth/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_register_success_with_company_slug(self) -> None:
        """Testa registro bem-sucedido com company_slug (convite)."""
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "newuser@example.com",
                "password": "newpass123",
                "password_confirm": "newpass123",
                "company_slug": self.company.slug,
                "accepted_terms": True,
                "accepted_privacy": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.json())
        user = User.objects.get(email="newuser@example.com")
        self.assertEqual(user.company, self.company)

    def test_register_success_auto_create_company(self) -> None:
        """Testa registro bem-sucedido com criação automática de Company."""
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "newuser@example.com",
                "password": "newpass123",
                "password_confirm": "newpass123",
                "first_name": "New",
                "last_name": "User",
                "accepted_terms": True,
                "accepted_privacy": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.json())
        user = User.objects.get(email="newuser@example.com")
        self.assertIsNotNone(user.company)
        self.assertEqual(user.company.name, "Empresa de New User")
        self.assertTrue(user.company.slug.startswith("empresa-de-new-user"))

    def test_register_success_with_company_name(self) -> None:
        """Testa registro bem-sucedido com company_name personalizado."""
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "newuser@example.com",
                "password": "newpass123",
                "password_confirm": "newpass123",
                "first_name": "New",
                "last_name": "User",
                "company_name": "Minha Empresa Personalizada",
                "accepted_terms": True,
                "accepted_privacy": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.json())
        user = User.objects.get(email="newuser@example.com")
        self.assertIsNotNone(user.company)
        self.assertEqual(user.company.name, "Minha Empresa Personalizada")
        self.assertTrue(user.company.slug.startswith("minha-empresa-personalizada"))

    def test_register_password_mismatch(self) -> None:
        """Testa registro com senhas que não coincidem."""
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "newuser@example.com",
                "password": "newpass123",
                "password_confirm": "differentpass",
                "accepted_terms": True,
                "accepted_privacy": True,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_requires_auth(self) -> None:
        """Testa que perfil requer autenticação."""
        response = self.client.get("/api/auth/profile/")
        # DRF pode retornar 401 (Unauthorized) ou 403 (Forbidden) dependendo da configuração
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_profile_authenticated(self) -> None:
        """Testa obtenção de perfil autenticado."""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/auth/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["email"], "test@example.com")

    def test_update_profile(self) -> None:
        """Testa atualização de perfil."""
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(
            "/api/auth/profile/update/",
            {"first_name": "Updated", "last_name": "Name"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, "Updated")
        self.assertEqual(self.user.last_name, "Name")

    def test_companies_list(self) -> None:
        """Testa listagem de companies."""
        response = self.client.get("/api/companies/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)

