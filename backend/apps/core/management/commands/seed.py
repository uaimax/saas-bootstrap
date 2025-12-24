"""Comando para popular dados de exemplo no banco de dados.

Este comando cria tenants, usuários e leads de exemplo para desenvolvimento
e demonstração do sistema.

Uso:
    python manage.py seed
    python manage.py seed --clear  # Limpa dados existentes antes de criar
    python manage.py seed --tenants 3  # Cria 3 tenants
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.accounts.models import Company
from apps.leads.models import Lead

User = get_user_model()


class Command(BaseCommand):
    """Comando para popular dados de exemplo."""

    help = "Popula o banco de dados com dados de exemplo (companies, users, leads)"

    def add_arguments(self, parser) -> None:
        """Adiciona argumentos ao comando."""
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Limpa dados existentes antes de criar novos",
        )
        parser.add_argument(
            "--companies",
            type=int,
            default=3,
            help="Número de companies a criar (padrão: 3)",
        )
        parser.add_argument(
            "--users-per-company",
            type=int,
            default=2,
            help="Número de usuários por company (padrão: 2)",
        )
        parser.add_argument(
            "--leads-per-company",
            type=int,
            default=5,
            help="Número de leads por company (padrão: 5)",
        )

    def handle(self, *args, **options) -> None:
        """Executa o comando de seed."""
        clear = options["clear"]
        num_companies = options.get("companies", options.get("tenants", 3))  # Compatibilidade
        users_per_company = options.get("users_per_company", options.get("users_per_tenant", 2))  # Compatibilidade
        leads_per_company = options.get("leads_per_company", options.get("leads_per_tenant", 5))  # Compatibilidade

        if clear:
            self.stdout.write(self.style.WARNING("Limpando dados existentes..."))
            Lead.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            Company.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Dados limpos com sucesso!"))

        with transaction.atomic():
            self._create_companies(num_companies, users_per_company, leads_per_company)

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✅ Seed concluído com sucesso!\n"
                f"   - {num_companies} empresa(s) criada(s)\n"
                f"   - {num_companies * users_per_company} usuário(s) criado(s)\n"
                f"   - {num_companies * leads_per_company} lead(s) criado(s)"
            )
        )

    def _create_companies(
        self, num_companies: int, users_per_company: int, leads_per_company: int
    ) -> None:
        """Cria companies com usuários e leads."""
        company_data = [
            {
                "name": "Acme Corporation",
                "slug": "acme",
            },
            {
                "name": "TechStart Solutions",
                "slug": "techstart",
            },
            {
                "name": "Global Services",
                "slug": "global",
            },
        ]

        for i in range(num_companies):
            company_info = company_data[i % len(company_data)]
            # Se pedir mais companies que temos dados, criar genéricos
            if i >= len(company_data):
                company_info = {
                    "name": f"Company {i+1}",
                    "slug": f"company-{i+1}",
                }

            company, created = Company.objects.get_or_create(
                slug=company_info["slug"],
                defaults={
                    "name": company_info["name"],
                    "is_active": True,
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"✅ Empresa criada: {company.name} ({company.slug})")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  Empresa já existe: {company.name} ({company.slug})")
                )

            # Criar usuários para a company
            self._create_users_for_company(company, users_per_company)

            # Criar leads para a company
            self._create_leads_for_company(company, leads_per_company)

    def _create_users_for_company(self, company: Company, num_users: int) -> None:
        """Cria usuários para uma company."""
        user_data = [
            {
                "email": f"admin@{company.slug}.com",
                "first_name": "Admin",
                "last_name": company.name.split()[0],
                "password": "admin123",
            },
            {
                "email": f"user@{company.slug}.com",
                "first_name": "Usuário",
                "last_name": company.name.split()[0],
                "password": "user123",
            },
        ]

        for i in range(num_users):
            user_info = user_data[i % len(user_data)]
            user, created = User.objects.get_or_create(
                email=user_info["email"],
                defaults={
                    "first_name": user_info["first_name"],
                    "last_name": user_info["last_name"],
                    "company": company,
                    "is_active": True,
                },
            )

            if created:
                user.set_password(user_info["password"])
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"   ✅ Usuário criado: {user.email} (senha: {user_info['password']})"
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"   ⚠️  Usuário já existe: {user.email}")
                )

    def _create_leads_for_company(self, company: Company, num_leads: int) -> None:
        """Cria leads para um tenant."""
        lead_data = [
            {
                "name": "João Silva",
                "email": "joao.silva@example.com",
                "phone": "+55 11 98765-4321",
                "company": "Empresa A",
                "status": "new",
                "source": "website",
            },
            {
                "name": "Maria Santos",
                "email": "maria.santos@example.com",
                "phone": "+55 11 98765-4322",
                "company": "Empresa B",
                "status": "contacted",
                "source": "referral",
            },
            {
                "name": "Pedro Oliveira",
                "email": "pedro.oliveira@example.com",
                "phone": "+55 11 98765-4323",
                "company": "Empresa C",
                "status": "qualified",
                "source": "social",
            },
            {
                "name": "Ana Costa",
                "email": "ana.costa@example.com",
                "phone": "+55 11 98765-4324",
                "company": "Empresa D",
                "status": "converted",
                "source": "website",
            },
            {
                "name": "Carlos Ferreira",
                "email": "carlos.ferreira@example.com",
                "phone": "+55 11 98765-4325",
                "company": "Empresa E",
                "status": "lost",
                "source": "email",
            },
        ]

        for i in range(num_leads):
            lead_info = lead_data[i % len(lead_data)]
            # Adicionar sufixo para evitar duplicatas
            unique_email = f"{i+1}-{lead_info['email']}"
            unique_name = f"{lead_info['name']} {i+1}"

            lead, created = Lead.objects.get_or_create(
                company=company,
                email=unique_email,
                defaults={
                    "name": unique_name,
                    "phone": lead_info["phone"],
                    "company": lead_info["company"],
                    "status": lead_info["status"],
                    "source": lead_info["source"],
                    "notes": f"Lead de exemplo criado via seed para {company.name}",
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"   ✅ Lead criado: {lead.name} ({lead.status})")
                )

