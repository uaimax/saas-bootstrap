"""Serviços para o app accounts."""

from django.conf import settings
from django.utils import timezone

from .models import LegalDocument


def render_legal_document(document: LegalDocument) -> str:
    """Substitui variáveis no template usando configurações globais do SaaS.

    Todos os documentos legais são globais do sistema e usam configurações do SaaS
    definidas em settings (SAAS_COMPANY_*, PROJECT_NAME, etc.).

    Suporta tanto sintaxe {{variavel}} quanto [VARIAVEL] para compatibilidade.

    Args:
        document: Documento legal com template

    Returns:
        Conteúdo renderizado com variáveis substituídas
    """
    # Usar configurações globais do SaaS (settings)
    context = {
        "company_name": getattr(settings, "SAAS_COMPANY_NAME", getattr(settings, "PROJECT_NAME", "SaaS Bootstrap")),
        "company_legal_name": getattr(settings, "SAAS_COMPANY_LEGAL_NAME", getattr(settings, "SAAS_COMPANY_NAME", getattr(settings, "PROJECT_NAME", "SaaS Bootstrap"))),
        "company_cnpj": getattr(settings, "SAAS_COMPANY_CNPJ", ""),
        "company_address": getattr(settings, "SAAS_COMPANY_ADDRESS", ""),
        "company_phone": getattr(settings, "SAAS_COMPANY_PHONE", ""),
        "company_email": getattr(settings, "SAAS_COMPANY_EMAIL", "contato@saasbootstrap.com"),
        "company_website": getattr(settings, "SAAS_COMPANY_WEBSITE", ""),
        "company_city": getattr(settings, "SAAS_COMPANY_CITY", ""),
        "company_state": getattr(settings, "SAAS_COMPANY_STATE", ""),
        "dpo_name": getattr(settings, "SAAS_DPO_NAME", ""),
        "dpo_email": getattr(settings, "SAAS_DPO_EMAIL", ""),
        "dpo_phone": getattr(settings, "SAAS_DPO_PHONE", ""),
        "dpo_address": getattr(settings, "SAAS_DPO_ADDRESS", ""),
        "support_hours": getattr(settings, "SAAS_SUPPORT_HOURS", ""),
    }

    # Adicionar variáveis comuns
    context["current_date"] = timezone.now().strftime("%d/%m/%Y")
    context["system_name"] = getattr(settings, "PROJECT_NAME", "SaaS Bootstrap")

    # Montar endereço completo se tiver componentes
    if not context.get("company_address") and (context.get("company_city") or context.get("company_state")):
        address_parts = []
        if context.get("company_city"):
            address_parts.append(context["company_city"])
        if context.get("company_state"):
            address_parts.append(context["company_state"])
        context["company_address"] = ", ".join(address_parts)

    content = document.content

    # Mapeamento de placeholders do template para variáveis do context
    # Template usa [VARIAVEL] e também suporta {{variavel}}
    replacements = {
        # Placeholders do template [VARIAVEL] -> valores do context
        "[DATA]": context["current_date"],
        "[NOME DO SISTEMA]": context["system_name"],
        "[NOME DA EMPRESA]": context["company_name"],
        "[NOME COMPLETO DA EMPRESA]": context["company_legal_name"],
        "[CNPJ]": context["company_cnpj"],
        "[ENDEREÇO COMPLETO]": context["company_address"],
        "[TELEFONE]": context["company_phone"],
        "[E-MAIL DE CONTATO]": context["company_email"],
        "[URL DO SITE]": context["company_website"],
        "[CIDADE]": context["company_city"],
        "[ESTADO]": context["company_state"],
        "[HORÁRIO]": context["support_hours"],
        "[LINK PARA POLÍTICA DE PRIVACIDADE]": "#politica-privacidade",  # Link relativo ou pode ser configurável
    }

    # Substituir placeholders do template [VARIAVEL]
    for placeholder, value in replacements.items():
        content = content.replace(placeholder, str(value))

    # Também substituir formato {{variavel}} para compatibilidade
    for key, value in context.items():
        content = content.replace(f"{{{{{key}}}}}", str(value))
        # Formato [VARIAVEL] em maiúsculas com espaços
        formatted_key = key.upper().replace("_", " ")
        if f"[{formatted_key}]" not in replacements:  # Evitar duplicação
            content = content.replace(f"[{formatted_key}]", str(value))

    return content


def get_active_legal_document(document_type: str = "terms") -> LegalDocument | None:
    """Retorna o documento legal ativo mais recente.

    Todos os documentos legais são globais do sistema.

    Args:
        document_type: Tipo de documento ('terms' ou 'privacy')

    Returns:
        Documento legal ativo ou None se não existir
    """
    return (
        LegalDocument.objects.filter(
            document_type=document_type,
            is_active=True,
        )
        .order_by("-version", "-created_at")
        .first()
    )

