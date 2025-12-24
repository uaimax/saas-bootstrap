"""Views para autenticação e gerenciamento de usuários."""

from typing import TYPE_CHECKING

from django.conf import settings
from django.contrib.auth import login, logout
from django.shortcuts import redirect
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Company, LegalDocument, User
from .serializers import (
    CompanySerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .services import get_active_legal_document, render_legal_document

if TYPE_CHECKING:
    from rest_framework.serializers import Serializer


@extend_schema(
    summary="Login",
    description="Autentica um usuário usando email e senha.",
    tags=["Autenticação"],
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "email": {"type": "string", "format": "email"},
                "password": {"type": "string"},
            },
            "required": ["email", "password"],
        }
    },
    responses={
        200: OpenApiResponse(description="Login realizado com sucesso"),
        400: OpenApiResponse(description="Dados inválidos"),
        401: OpenApiResponse(description="Credenciais inválidas"),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request: Request) -> Response:
    """Endpoint de login usando email."""
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response(
            {"error": "Email e senha são obrigatórios."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        # Usar authenticate do Django que suporta email quando USERNAME_FIELD = email
        from django.contrib.auth import authenticate

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"error": "Credenciais inválidas."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "Usuário inativo."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        login(request, user)

        # Gerar JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        serializer = UserProfileSerializer(user)
        return Response(
            {
                "message": "Login realizado com sucesso.",
                "user": serializer.data,
                "access": access_token,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"error": "Erro ao fazer login. Tente novamente."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@extend_schema(
    summary="Logout",
    description="Encerra a sessão do usuário atual.",
    tags=["Autenticação"],
    responses={
        200: OpenApiResponse(description="Logout realizado com sucesso"),
    },
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request: Request) -> Response:
    """Endpoint de logout."""
    logout(request)
    return Response(
        {"message": "Logout realizado com sucesso."},
        status=status.HTTP_200_OK,
    )


@extend_schema(
    summary="Registro",
    description="Registra um novo usuário.",
    tags=["Autenticação"],
    responses={
        201: OpenApiResponse(description="Usuário criado com sucesso"),
        400: OpenApiResponse(description="Dados inválidos"),
    },
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request: Request) -> Response:
    """Endpoint de registro usando email."""
    serializer = UserRegistrationSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)

        # Gerar JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        user_serializer = UserProfileSerializer(user)
        return Response(
            {
                "message": "Usuário criado com sucesso.",
                "user": user_serializer.data,
                "access": access_token,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Perfil do Usuário",
    description="Retorna informações do usuário autenticado.",
    tags=["Autenticação"],
    responses={
        200: UserProfileSerializer,
        401: OpenApiResponse(description="Não autenticado"),
    },
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request: Request) -> Response:
    """Endpoint para obter perfil do usuário atual."""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    summary="Atualizar Perfil",
    description="Atualiza informações do usuário autenticado.",
    tags=["Autenticação"],
    responses={
        200: UserProfileSerializer,
        400: OpenApiResponse(description="Dados inválidos"),
        401: OpenApiResponse(description="Não autenticado"),
    },
)
@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_profile_view(request: Request) -> Response:
    """Endpoint para atualizar perfil do usuário atual."""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        profile_serializer = UserProfileSerializer(serializer.instance)
        return Response(profile_serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Listar Empresas",
    description="Lista todas as empresas ativas.",
    tags=["Empresas"],
    responses={
        200: OpenApiResponse(description="Lista de empresas"),
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def companies_list_view(request: Request) -> Response:
    """Endpoint para listar empresas ativas.

    Usa cache para melhorar performance (5 minutos).
    """
    from apps.core.cache import cache_get_or_set, get_cache_key

    # Cache por 5 minutos
    cache_key = get_cache_key("companies_list")

    def fetch_companies():
        companies = Company.objects.filter(is_active=True)
        serializer = CompanySerializer(companies, many=True)
        return serializer.data

    data = cache_get_or_set(cache_key, fetch_companies, timeout=300)
    return Response(data, status=status.HTTP_200_OK)


@extend_schema(
    summary="Listar Providers Sociais Disponíveis",
    description="Retorna lista de providers de autenticação social configurados e ativos.",
    tags=["Autenticação"],
    responses={
        200: OpenApiResponse(description="Lista de providers disponíveis"),
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def available_social_providers(request: Request) -> Response:
    """Retorna lista de providers sociais configurados.

    Verifica SocialApps criados no banco de dados (via Admin ou sync_social_apps).
    Se nenhum SocialApp existir, retorna lista vazia.
    """
    try:
        from allauth.socialaccount.models import SocialApp
        from django.contrib.sites.models import Site

        site = Site.objects.get_current()
        # SocialApp tem relacionamento ManyToMany com Site
        # Nota: SocialApp não tem campo 'active', apenas verifica se está configurado
        apps = SocialApp.objects.filter(sites=site)

        # Filtrar apenas providers que estão na lista de habilitados via settings
        enabled_providers = getattr(settings, "SOCIAL_AUTH_ENABLED_PROVIDERS", [])
        if enabled_providers:
            apps = apps.filter(provider__in=enabled_providers)

        providers = []
        for app in apps:
            providers.append(
                {
                    "provider": app.provider,
                    "name": app.name or app.provider.title(),
                }
            )

        return Response({"providers": providers}, status=status.HTTP_200_OK)
    except ImportError:
        # django-allauth não está instalado ou configurado
        return Response({"providers": []}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def oauth_callback_view(request: Request):
    """View customizada para callback OAuth que gera JWT e redireciona para frontend.

    Nota: Esta view é um fallback. O redirecionamento principal é feito
    via adapter.get_login_redirect_url() após login social bem-sucedido.
    """
    # Verificar se usuário foi autenticado via social auth
    if not request.user.is_authenticated:
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        return redirect(f"{frontend_url}/oauth/callback?error=not_authenticated")

    try:
        # Gerar JWT
        refresh = RefreshToken.for_user(request.user)
        access_token = str(refresh.access_token)

        # Redirecionar para frontend com token
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        return redirect(f"{frontend_url}/oauth/callback?token={access_token}")

    except Exception as e:
        frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
        return redirect(f"{frontend_url}/oauth/callback?error={str(e)}")


@extend_schema(
    summary="Obter Termos e Condições",
    description="Retorna os Termos e Condições renderizados para a empresa do tenant atual.",
    tags=["Documentos Legais"],
    responses={
        200: OpenApiResponse(description="Termos e Condições renderizados"),
        404: OpenApiResponse(description="Documento não encontrado"),
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def legal_terms_view(request: Request) -> Response:
    """Endpoint para obter Termos e Condições renderizados.

    Retorna o documento global do sistema.
    Usa cache para melhorar performance (1 hora - documentos mudam raramente).
    """
    from apps.core.cache import cache_get_or_set, get_cache_key

    cache_key = get_cache_key("legal_terms")

    def fetch_terms():
        # Buscar documento ativo global
        document = get_active_legal_document("terms")

        if not document:
            return {
                "error": "Termos e Condições não encontrados.",
                "status": status.HTTP_404_NOT_FOUND,
            }

        # Renderizar documento usando configurações globais do SaaS
        rendered_content = render_legal_document(document)

        return {
            "content": rendered_content,
            "version": document.version,
            "last_updated": document.last_updated,
            "status": status.HTTP_200_OK,
        }

    result = cache_get_or_set(cache_key, fetch_terms, timeout=3600)  # 1 hora
    return Response(
        {k: v for k, v in result.items() if k != "status"},
        status=result.get("status", status.HTTP_200_OK),
    )


@extend_schema(
    summary="Obter Política de Privacidade",
    description="Retorna a Política de Privacidade renderizada para a empresa do tenant atual.",
    tags=["Documentos Legais"],
    responses={
        200: OpenApiResponse(description="Política de Privacidade renderizada"),
        404: OpenApiResponse(description="Documento não encontrado"),
    },
)
@api_view(["GET"])
@permission_classes([AllowAny])
def legal_privacy_view(request: Request) -> Response:
    """Endpoint para obter Política de Privacidade renderizada.

    Retorna o documento global do sistema.
    Usa cache para melhorar performance (1 hora - documentos mudam raramente).
    """
    from apps.core.cache import cache_get_or_set, get_cache_key

    cache_key = get_cache_key("legal_privacy")

    def fetch_privacy():
        # Buscar documento ativo global
        document = get_active_legal_document("privacy")

        if not document:
            return {
                "error": "Política de Privacidade não encontrada.",
                "status": status.HTTP_404_NOT_FOUND,
            }

        # Renderizar documento usando configurações globais do SaaS
        rendered_content = render_legal_document(document)

        return {
            "content": rendered_content,
            "version": document.version,
            "last_updated": document.last_updated,
            "status": status.HTTP_200_OK,
        }

    result = cache_get_or_set(cache_key, fetch_privacy, timeout=3600)  # 1 hora
    return Response(
        {k: v for k, v in result.items() if k != "status"},
        status=result.get("status", status.HTTP_200_OK),
    )

