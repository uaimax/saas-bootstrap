"""Adapters customizados para django-allauth com suporte a multi-tenancy."""

import base64
import json

from allauth.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.core.cache import cache
from django.http import HttpResponseBadRequest, HttpResponseForbidden
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Company


class CompanySocialAccountAdapter(DefaultSocialAccountAdapter):
    """Adapter que associa usuários sociais a companies durante OAuth."""

    def pre_social_login(self, request, sociallogin):
        """Associa usuário à company antes de completar login."""
        company = getattr(request, "company", None) or getattr(request, "tenant", None)  # Compatibilidade

        # Se não há company no request, tentar extrair do state parameter
        if not company:
            state = request.GET.get("state")
            if state:
                try:
                    decoded_state = base64.b64decode(state).decode("utf-8")
                    state_data = json.loads(decoded_state)
                    company_slug = state_data.get("company_slug") or state_data.get("tenant_slug")  # Compatibilidade

                    if company_slug:
                        try:
                            company = Company.objects.get(slug=company_slug, is_active=True)
                            request.company = company
                            request.tenant = company  # Compatibilidade
                        except Company.DoesNotExist:
                            raise ImmediateHttpResponse(
                                HttpResponseBadRequest("Empresa não encontrada ou inativa.")
                            )

                    # Validar nonce para prevenir replay attacks
                    nonce = state_data.get("nonce")
                    if nonce:
                        cache_key = f"oauth_nonce:{nonce}"
                        if cache.get(cache_key):
                            raise ImmediateHttpResponse(
                                HttpResponseBadRequest("Nonce já usado. Tente novamente.")
                            )
                        cache.set(cache_key, True, timeout=600)  # 10 minutos

                except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
                    # State inválido, mas não bloquear - pode ser de outro fluxo
                    pass

        # Se ainda não há company, não bloquear mas registrar warning
        if not company:
            # Em produção, pode querer bloquear aqui
            # Por enquanto, permitir mas sem associar company
            return

        # Se usuário já existe, verificar se pertence à company
        if sociallogin.is_existing:
            user = sociallogin.user
            if user.company_id and user.company_id != company.id:
                raise ImmediateHttpResponse(
                    HttpResponseForbidden(
                        "Usuário não pertence a esta empresa. "
                        "Por favor, use a conta correta ou entre em contato com o suporte."
                    )
                )

        # Associar company ao usuário
        sociallogin.user.company = company

    def save_user(self, request, sociallogin, form=None):
        """Garante que company seja salva com o usuário."""
        user = super().save_user(request, sociallogin, form)

        # Associar company se disponível
        company = getattr(request, "company", None) or getattr(request, "tenant", None)  # Compatibilidade
        if company:
            user.company = company
            user.save()

        return user

    def is_open_for_signup(self, request, sociallogin):
        """Permite signup via social auth."""
        return True

    def get_login_redirect_url(self, request):
        """Customiza o redirecionamento após login social para incluir JWT."""
        # Se usuário está autenticado, gerar JWT e redirecionar para frontend
        if request.user.is_authenticated:
            try:
                refresh = RefreshToken.for_user(request.user)
                access_token = str(refresh.access_token)
                frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
                return f"{frontend_url}/oauth/callback?token={access_token}"
            except Exception:
                # Se falhar, usar redirecionamento padrão
                pass

        # Redirecionamento padrão do django-allauth
        return super().get_login_redirect_url(request)

