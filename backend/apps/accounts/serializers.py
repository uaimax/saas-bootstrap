"""Serializers para o app accounts."""

from django.utils.text import slugify
from rest_framework import serializers

from .models import Company, User


class CompanySerializer(serializers.ModelSerializer):
    """Serializer para modelo Company."""

    class Meta:
        model = Company
        fields = ["id", "name", "slug", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer para registro de usuário usando email.

    Fluxo típico de SaaS:
    - Usuário se registra sem company → cria Company automaticamente
    - Usuário se registra com company_slug → junta-se a Company existente (convite)
    - Usuário pode fornecer company_name opcional para personalizar nome da Company criada
    """

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    company_slug = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Slug da empresa existente para se juntar (opcional). Se não fornecido, cria nova empresa automaticamente.",
    )
    company_name = serializers.CharField(
        write_only=True,
        required=False,
        max_length=255,
        help_text="Nome da empresa a ser criada (opcional). Se não fornecido, usa nome baseado no usuário.",
    )
    accepted_terms = serializers.BooleanField(write_only=True)
    accepted_privacy = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
            "company_slug",
            "company_name",
            "company",
            "accepted_terms",
            "accepted_privacy",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "company", "created_at", "updated_at"]
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate(self, attrs: dict) -> dict:
        """Valida se as senhas coincidem e se os termos foram aceitos."""
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem."})

        if not attrs.get("accepted_terms"):
            raise serializers.ValidationError({"accepted_terms": "Você deve aceitar os Termos e Condições."})

        if not attrs.get("accepted_privacy"):
            raise serializers.ValidationError({"accepted_privacy": "Você deve aceitar a Política de Privacidade."})

        return attrs

    def validate_company_slug(self, value: str) -> str:
        """Valida se a company existe e está ativa (se fornecida)."""
        if value:
            try:
                company = Company.objects.filter(is_active=True).get(slug=value)
            except Company.DoesNotExist:
                raise serializers.ValidationError("Empresa não encontrada ou inativa.")
        return value

    def _generate_unique_slug(self, base_name: str) -> str:
        """Gera um slug único a partir de um nome base.

        Se o slug já existir, adiciona sufixo numérico (ex: empresa, empresa-2, empresa-3).
        """
        base_slug = slugify(base_name)
        if not base_slug:
            # Se slugify retornar vazio (ex: apenas caracteres especiais), usar fallback
            base_slug = "empresa"

        slug = base_slug
        counter = 1
        while Company.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    def create(self, validated_data: dict) -> User:
        """Cria um novo usuário e Company automaticamente se necessário.

        Fluxo:
        1. Se company_slug fornecido → junta-se a Company existente (convite)
        2. Se não fornecido → cria Company automaticamente para o usuário
        """
        from apps.accounts.models import LegalDocumentAcceptance
        from apps.accounts.services import get_active_legal_document
        from apps.core.audit import log_audit
        from django.utils import timezone

        validated_data.pop("password_confirm", None)
        accepted_terms = validated_data.pop("accepted_terms", False)
        accepted_privacy = validated_data.pop("accepted_privacy", False)
        company_slug = validated_data.pop("company_slug", None)
        company_name = validated_data.pop("company_name", None)

        password = validated_data.pop("password")
        email = validated_data.pop("email")
        first_name = validated_data.get("first_name", "")
        last_name = validated_data.get("last_name", "")

        # Determinar company
        company = None
        if company_slug:
            # Caso 1: Usuário se junta a Company existente (convite)
            company = Company.objects.filter(is_active=True).get(slug=company_slug)
        else:
            # Caso 2: Criar Company automaticamente para novo usuário
            if company_name:
                # Usar nome fornecido pelo usuário
                name = company_name.strip()
            else:
                # Gerar nome baseado no usuário
                user_full_name = f"{first_name} {last_name}".strip()
                if user_full_name:
                    name = f"Empresa de {user_full_name}"
                else:
                    # Fallback: usar email
                    name = f"Empresa de {email.split('@')[0]}"

            # Gerar slug único
            slug = self._generate_unique_slug(name)

            # Criar Company
            company = Company.objects.create(
                name=name,
                slug=slug,
                is_active=True,
                email=email,  # Email de contato inicial
            )

        # Criar usuário com email
        user = User.objects.create_user(
            email=email,
            company=company,  # Sempre terá uma company agora
            password=password,
            **validated_data
        )

        # Registrar aceitação de termos e política de privacidade
        request = self.context.get("request")
        ip_address = None
        user_agent = None
        if request:
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(",")[0].strip()
            else:
                ip_address = request.META.get("REMOTE_ADDR")
            user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

        # Registrar aceitação de Termos e Condições
        if accepted_terms:
            terms_doc = get_active_legal_document("terms")
            if terms_doc:
                LegalDocumentAcceptance.objects.create(
                    user=user,
                    document=terms_doc,
                    company=company,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                log_audit(
                    instance=user,
                    action="create",
                    field_name="accepted_terms",
                    new_value=f"Versão {terms_doc.version} aceita em {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}",
                    request=request,
                )

        # Registrar aceitação de Política de Privacidade
        if accepted_privacy:
            privacy_doc = get_active_legal_document("privacy")
            if privacy_doc:
                LegalDocumentAcceptance.objects.create(
                    user=user,
                    document=privacy_doc,
                    company=company,
                    ip_address=ip_address,
                    user_agent=user_agent,
                )
                log_audit(
                    instance=user,
                    action="create",
                    field_name="accepted_privacy",
                    new_value=f"Versão {privacy_doc.version} aceita em {timezone.now().strftime('%d/%m/%Y %H:%M:%S')}",
                    request=request,
                )

        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer para modelo User (leitura e atualização)."""

    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_active",
            "company",
            "company_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email",  # Email não pode ser alterado após criação
            "is_staff",
            "created_at",
            "updated_at",
        ]

    def validate_company_id(self, value: int) -> int:
        """Valida se a company existe e está ativa."""
        if value:
            try:
                company = Company.objects.filter(is_active=True).get(pk=value)
            except Company.DoesNotExist:
                raise serializers.ValidationError("Empresa não encontrada ou inativa.")
        return value

    def update(self, instance: User, validated_data: dict) -> User:
        """Atualiza o usuário."""
        company_id = validated_data.pop("company_id", None)
        if company_id is not None:
            company = Company.objects.filter(is_active=True).get(pk=company_id)
            instance.company = company

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer simplificado para perfil do usuário atual."""

    company = CompanySerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "company",
            "created_at",
        ]
        read_only_fields = ["id", "email", "created_at"]

