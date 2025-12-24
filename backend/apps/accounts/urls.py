"""URLs para o app accounts."""

from django.urls import include, path

from .views import (
    available_social_providers,
    companies_list_view,
    legal_privacy_view,
    legal_terms_view,
    login_view,
    logout_view,
    oauth_callback_view,
    profile_view,
    register_view,
    update_profile_view,
)

app_name = "accounts"

urlpatterns = [
    # Autenticação
    path("auth/login/", login_view, name="login"),
    path("auth/logout/", logout_view, name="logout"),
    path("auth/register/", register_view, name="register"),
    # Perfil
    path("auth/profile/", profile_view, name="profile"),
    path("auth/profile/update/", update_profile_view, name="update-profile"),
    # Social Auth
    path("auth/providers/", available_social_providers, name="available-providers"),
    path("auth/social/", include("allauth.urls")),
    path("auth/social/callback/", oauth_callback_view, name="oauth-callback"),
    # Empresas
    path("companies/", companies_list_view, name="companies-list"),
    path("tenants/", companies_list_view, name="tenants-list"),  # Compatibilidade
    # Documentos Legais
    path("legal/terms/", legal_terms_view, name="legal-terms"),
    path("legal/privacy/", legal_privacy_view, name="legal-privacy"),
]

