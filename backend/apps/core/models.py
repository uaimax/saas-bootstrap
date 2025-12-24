"""Base models for the application."""

import uuid
from typing import Optional

from django.db import models

from apps.core.managers import SoftDeleteModel


class UUIDPrimaryKeyMixin(models.Model):
    """Mixin para usar UUID como primary key."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class CompanyModel(SoftDeleteModel):
    """Base model com company_id e timestamps.

    Todos os models que precisam de multi-tenancy devem herdar desta classe.
    Inclui soft delete automático.
    """

    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="%(class)s_set",
        verbose_name="Empresa",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=["company"]),
            models.Index(fields=["company", "deleted_at"]),
        ]


class BaseModel(SoftDeleteModel):
    """Base model sem company_id (para models globais).

    Use CompanyModel se o model precisa de multi-tenancy.
    Inclui soft delete automático.
    """

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")

    class Meta:
        abstract = True


class AuditLog(UUIDPrimaryKeyMixin, models.Model):
    """Log de auditoria para compliance LGPD.

    Registra TODAS as mudanças em dados pessoais:
    - QUEM fez a mudança (user_id)
    - QUANDO (timestamp)
    - O QUÊ (valores antigos e novos)
    - Model e campo alterados
    """

    ACTION_CHOICES = [
        ("create", "Criação"),
        ("update", "Atualização"),
        ("delete", "Exclusão"),
        ("view", "Visualização"),  # Para acesso a dados sensíveis
    ]

    # Identificação
    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="audit_logs",
        verbose_name="Empresa",
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="audit_logs",
        verbose_name="Usuário",
        null=True,
        blank=True,
    )

    # O que foi alterado
    action = models.CharField(
        max_length=20, choices=ACTION_CHOICES, verbose_name="Ação"
    )
    model_name = models.CharField(max_length=255, verbose_name="Model")
    object_id = models.CharField(max_length=255, verbose_name="ID do Objeto")
    field_name = models.CharField(
        max_length=255, null=True, blank=True, verbose_name="Campo"
    )

    # Valores
    old_value = models.TextField(null=True, blank=True, verbose_name="Valor Antigo")
    new_value = models.TextField(null=True, blank=True, verbose_name="Valor Novo")

    # Metadados
    ip_address = models.GenericIPAddressField(
        null=True, blank=True, verbose_name="Endereço IP"
    )
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Data/Hora", db_index=True
    )

    # Dados pessoais identificados
    is_personal_data = models.BooleanField(
        default=False, verbose_name="Dados Pessoais", db_index=True
    )
    data_subject = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Titular dos Dados",
        help_text="Email ou identificador do titular dos dados",
    )

    class Meta:
        verbose_name = "Log de Auditoria"
        verbose_name_plural = "Logs de Auditoria"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "created_at"]),
            models.Index(fields=["company", "is_personal_data", "created_at"]),
            models.Index(fields=["model_name", "object_id"]),
            models.Index(fields=["data_subject", "created_at"]),
        ]

    def __str__(self) -> str:
        """Representação string do log."""
        user_str = self.user.username if self.user else "Sistema"
        return f"{self.get_action_display()} {self.model_name}#{self.object_id} por {user_str} em {self.created_at}"

