"""Models for leads app."""

from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import CompanyModel


class Lead(CompanyModel):
    """Modelo de Lead (exemplo de módulo com multi-tenancy)."""

    STATUS_CHOICES = [
        ("new", _("Novo")),
        ("contacted", _("Contactado")),
        ("qualified", _("Qualificado")),
        ("converted", _("Convertido")),
        ("lost", _("Perdido")),
    ]

    name = models.CharField(max_length=255, verbose_name=_("Nome"))
    email = models.EmailField(verbose_name=_("Email"))
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_("Telefone"))
    client_company = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Empresa do Cliente"))
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="new",
        verbose_name=_("Status"),
    )
    notes = models.TextField(blank=True, null=True, verbose_name=_("Observações"))
    source = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Origem"))

    class Meta:
        verbose_name = _("Lead")
        verbose_name_plural = _("Leads")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["company", "status"]),  # company vem de CompanyModel
            models.Index(fields=["company", "created_at"]),  # company vem de CompanyModel
        ]

    def __str__(self) -> str:
        """Representação string do lead."""
        return f"{self.name} ({self.email})"

