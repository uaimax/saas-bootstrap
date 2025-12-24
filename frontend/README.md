# Frontend - SaaS Bootstrap

Frontend React + Vite + TypeScript + Tailwind CSS (direto, sem shadcn/ui)

## 🚀 Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```bash
# Desenvolvimento (frontend separado)
VITE_API_URL=http://localhost:8001/api/v1

# Produção (junto)
VITE_API_URL=/api/v1

# Produção (separado)
VITE_API_URL=https://api.meusite.com/v1
```

## 📁 Estrutura (Modular)

```
frontend/
├── src/
│   ├── features/      # Módulos organizados por feature
│   │   ├── auth/     # Autenticação (Login, Register, OAuth)
│   │   ├── leads/    # Módulo de leads
│   │   ├── admin/    # Admin UI Kit
│   │   └── legal/    # Documentos legais
│   ├── components/   # Componentes compartilhados (ui, layout)
│   ├── pages/        # Páginas gerais (Home, Dashboard)
│   ├── config/       # Configurações (API, etc)
│   └── lib/          # Utilitários
├── public/           # Arquivos estáticos
└── dist/             # Build de produção
```

**Estrutura Modular**: O código está organizado por features/módulos em `src/features/`, facilitando manutenção e escalabilidade.

## 🔗 Integração com Backend

O frontend está configurado para se conectar ao backend via:

- **Cliente HTTP**: `src/config/api.ts`
- **Variável de ambiente**: `VITE_API_URL`
- **Header automático**: `X-Tenant-ID` (via localStorage)

## 📚 Documentação

- [Guia de Integração](../docs/FRONTEND_INTEGRATION.md)
- [Checklist de Integração](../docs/INTEGRATION_CHECKLIST.md)
