"""Admin configuration for leads app."""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from apps.leads.models import Lead


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin para modelo Lead."""

    list_display = ["name", "email", "company", "client_company", "status", "source", "created_at"]
    list_filter = ["status", "source", "company", "created_at"]
    search_fields = ["name", "email", "client_company", "phone"]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "created_at"

    fieldsets = (
        (_("Informações Básicas"), {"fields": ("company", "name", "email", "phone", "client_company")}),
        (_("Status e Origem"), {"fields": ("status", "source")}),
        (_("Observações"), {"fields": ("notes",)}),
        (_("Datas"), {"fields": ("created_at", "updated_at")}),
    )

    def get_queryset(self, request):
        """Filtra leads por company se não for superuser."""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        if hasattr(request.user, "company") and request.user.company:
            return qs.filter(company=request.user.company)
        return qs.none()

