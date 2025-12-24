"""Models for accounts app - Company and User."""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import UUIDPrimaryKeyMixin


class UserManager(BaseUserManager):
    """Manager customizado para User com email como USERNAME_FIELD."""

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        """Cria e salva um usuário com email e senha."""
        if not email:
            raise ValueError("O email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        """Cria e salva um superusuário com email e senha."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser deve ter is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser deve ter is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

    def _create_user(self, email: str, password: str | None = None, **extra_fields):
        """Método privado para criar usuário (compatibilidade com BaseUserManager)."""
        if not email:
            raise ValueError("O email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class Company(UUIDPrimaryKeyMixin, models.Model):
    """Modelo de empresa para multi-tenancy."""

    # Campos básicos
    name = models.CharField(max_length=255, verbose_name=_("Nome"))
    slug = models.SlugField(unique=True, verbose_name=_("Slug"))
    is_active = models.BooleanField(default=True, verbose_name=_("Ativo"))

    # Dados da empresa
    legal_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Razão Social"),
        help_text=_("Nome completo/razão social da empresa"),
    )
    cnpj = models.CharField(
        max_length=18,
        unique=True,
        blank=True,
        null=True,
        verbose_name=_("CNPJ"),
    )
    address = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Endereço Completo"),
    )
    city = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Cidade"),
    )
    state = models.CharField(
        max_length=2,
        blank=True,
        null=True,
        verbose_name=_("Estado (UF)"),
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Telefone"),
    )
    email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("E-mail de Contato"),
    )
    website = models.URLField(
        blank=True,
        null=True,
        verbose_name=_("Site"),
    )

    # DPO (Encarregado de Proteção de Dados)
    dpo_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_("Nome do DPO"),
    )
    dpo_email = models.EmailField(
        blank=True,
        null=True,
        verbose_name=_("E-mail do DPO"),
    )
    dpo_phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name=_("Telefone do DPO"),
    )
    dpo_address = models.TextField(
        blank=True,
        null=True,
        verbose_name=_("Endereço do DPO"),
    )

    # Horário de atendimento
    support_hours = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name=_("Horário de Atendimento"),
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Criado em"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Atualizado em"))

    class Meta:
        verbose_name = _("Empresa")
        verbose_name_plural = _("Empresas")
        ordering = ["name"]

    def __str__(self) -> str:
        """Representação string da empresa."""
        return self.name


class User(UUIDPrimaryKeyMixin, AbstractUser):
    """User customizado com company_id e autenticação por email."""

    # Email é obrigatório e único
    email = models.EmailField(_("email address"), unique=True, blank=False, null=False)

    # Tornar username nullable e não único
    username = models.CharField(
        _("username"),
        max_length=150,
        blank=True,
        null=True,
        unique=False,
        help_text=_("Opcional. 150 caracteres ou menos. Letras, dígitos e @/./+/-/_ apenas."),
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True,
        verbose_name=_("Empresa"),
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Criado em"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Atualizado em"))

    # Usar email como campo de autenticação
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # username removido dos required

    objects = UserManager()

    class Meta:
        verbose_name = _("Usuário")
        verbose_name_plural = _("Usuários")
        ordering = ["email"]

    def __str__(self) -> str:
        """Representação string do usuário."""
        return f"{self.email} ({self.company.name if self.company else 'Sem empresa'})"


class LegalDocument(models.Model):
    """Modelo para documentos legais editáveis globais do SaaS (Termos e Política de Privacidade).

    Todos os documentos legais são globais do sistema, não específicos por empresa.
    """

    DOCUMENT_TYPES = [
        ("terms", _("Termos e Condições")),
        ("privacy", _("Política de Privacidade")),
    ]

    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPES,
        verbose_name=_("Tipo de Documento"),
    )
    content = models.TextField(
        verbose_name=_("Conteúdo"),
        help_text=_("Template com variáveis [VARIAVEL] ou {{variavel}} que serão substituídas por valores do SaaS."),
    )
    version = models.IntegerField(
        default=1,
        verbose_name=_("Versão"),
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name=_("Ativo"),
    )
    last_updated = models.DateTimeField(
        auto_now=True,
        verbose_name=_("Última Atualização"),
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Criado em"),
    )

    class Meta:
        verbose_name = _("Documento Legal")
        verbose_name_plural = _("Documentos Legais")
        unique_together = [["document_type", "version"]]
        ordering = ["-version", "-created_at"]
        indexes = [
            models.Index(fields=["document_type", "is_active"]),
        ]

    def __str__(self) -> str:
        """Representação string do documento."""
        return f"{self.get_document_type_display()} (v{self.version})"


class LegalDocumentAcceptance(models.Model):
    """Rastreamento de aceitação de documentos legais por usuários.

    Armazena qual versão de cada documento legal foi aceita por cada usuário,
    incluindo data/hora, IP e User-Agent para compliance LGPD/GDPR.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="legal_acceptances",
        verbose_name=_("Usuário"),
    )
    document = models.ForeignKey(
        LegalDocument,
        on_delete=models.CASCADE,
        related_name="acceptances",
        verbose_name=_("Documento"),
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="legal_acceptances",
        verbose_name=_("Empresa"),
        null=True,
        blank=True,
        help_text=_("Empresa do usuário (pode ser None se usuário não tiver company ou documento for global)."),
    )
    accepted_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_("Aceito em"),
        db_index=True,
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_("Endereço IP"),
    )
    user_agent = models.TextField(
        null=True,
        blank=True,
        verbose_name=_("User Agent"),
        max_length=500,
    )

    class Meta:
        verbose_name = _("Aceitação de Documento Legal")
        verbose_name_plural = _("Aceitações de Documentos Legais")
        ordering = ["-accepted_at"]
        indexes = [
            models.Index(fields=["user", "accepted_at"]),
            models.Index(fields=["company", "accepted_at"]),
            models.Index(fields=["document", "accepted_at"]),
        ]
        # Um usuário pode aceitar múltiplas versões do mesmo documento
        # (quando há atualizações), mas não pode aceitar a mesma versão duas vezes
        unique_together = [["user", "document"]]

    def __str__(self) -> str:
        """Representação string da aceitação."""
        return f"{self.user.email} aceitou {self.document.get_document_type_display()} v{self.document.version} em {self.accepted_at.strftime('%d/%m/%Y %H:%M')}"

