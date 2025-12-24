# Padrões Identificados - Frontend

Este arquivo documenta **padrões do frontend que funcionam bem** e devem ser seguidos.

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, componentes, estrutura, reutilização]
severity: high
---

## Estrutura de Componentes shadcn/ui: Forms Separados das Páginas

### Contexto
Padrão recomendado pelo shadcn/ui para organização de componentes de formulário.

### Padrão
**Estrutura de pastas:**
```
frontend/src/
├── components/
│   ├── forms/          # Componentes de formulário reutilizáveis
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   └── ui/            # Componentes base do shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       └── form.tsx
└── pages/              # Páginas que apenas renderizam componentes
    ├── Login.tsx       # Apenas importa e renderiza LoginForm
    └── Register.tsx    # Apenas importa e renderiza RegisterForm
```

**Exemplo de página:**
```typescript
// pages/Login.tsx
import { LoginForm } from "@/components/forms/login-form";

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
```

**Exemplo de componente de formulário:**
```typescript
// components/forms/login-form.tsx
export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  // Toda a lógica do formulário aqui
  // React Hook Form + Zod
  // Integração com AuthContext
  // Tratamento de erros
}
```

### Benefícios
- **Separação de responsabilidades**: Páginas apenas renderizam, componentes contêm lógica
- **Reutilização**: `LoginForm` pode ser usado em outros lugares (modals, dialogs)
- **Manutenção**: Lógica centralizada em um único componente
- **Testabilidade**: Componentes podem ser testados isoladamente

### Padrão a Replicar
- SEMPRE criar componentes de formulário em `components/forms/`
- Páginas devem apenas importar e renderizar componentes
- Componentes devem ser auto-contidos (lógica + UI)
- Usar `React.ComponentPropsWithoutRef<"div">` para props do container

### Referências
- Arquivos: `frontend/src/pages/Login.tsx`, `frontend/src/components/forms/login-form.tsx`
- Docs: [shadcn/ui blocks](https://ui.shadcn.com/blocks)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, blocks, cli, instalação]
severity: high
---

## Instalação de Blocks do shadcn/ui via CLI

### Contexto
shadcn/ui oferece "blocks" (exemplos completos) que podem ser instalados via CLI.

### Padrão
**Comando para instalar blocks:**
```bash
npx shadcn@latest add [block-name]
```

**Exemplos:**
```bash
npx shadcn@latest add login-05    # Instala login-05 block
npx shadcn@latest add signup-01   # Instala signup-01 block (se existir)
```

**O que acontece:**
1. CLI baixa o block do registry
2. Cria arquivos em `@/components/` (ou caminho configurado)
3. Instala dependências necessárias automaticamente
4. Move arquivos para `src/components/` (ajustar manualmente)

**Processo após instalação:**
1. Mover arquivos de `@/components/` para `src/components/forms/`
2. Adaptar para nosso contexto (AuthContext, endpoints, etc.)
3. Manter estrutura do block, apenas integrar com backend

### Padrão a Replicar
- Usar `npx shadcn@latest add [block-name]` para instalar blocks
- Sempre adaptar blocks para nosso contexto (não usar "as is")
- Manter estrutura visual do block, integrar lógica de negócio
- Documentar qual block foi usado como base

### Referências
- Comando: `npx shadcn@latest add login-05`
- Docs: [shadcn/ui blocks](https://ui.shadcn.com/blocks)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, react-hook-form, zod, validação]
severity: high
---

## Integração React Hook Form + Zod com shadcn/ui Form

### Contexto
Padrão recomendado pelo shadcn/ui para formulários com validação.

### Padrão
**Estrutura completa de formulário:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    // Lógica de submit
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Benefícios
- **Validação em tempo real**: Zod valida enquanto usuário digita
- **Type safety**: TypeScript infere tipos do schema
- **Mensagens de erro automáticas**: `FormMessage` exibe erros automaticamente
- **Acessibilidade**: shadcn/ui Form já é acessível por padrão

### Padrão a Replicar
- SEMPRE usar React Hook Form + Zod para formulários
- SEMPRE usar componentes `Form*` do shadcn/ui (não Input/Label diretos)
- Definir schemas Zod antes do componente
- Usar `z.infer<typeof schema>` para tipos TypeScript
- `FormMessage` sempre presente para feedback de validação

### Referências
- Arquivos: `frontend/src/components/forms/login-form.tsx`
- Docs: [shadcn/ui form](https://ui.shadcn.com/docs/components/form)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, theming, dark-mode, next-themes]
severity: high
---

## Implementação de Dark Mode com shadcn/ui e next-themes

### Contexto
shadcn/ui já tem suporte a dark mode via CSS variables, precisa apenas de um provider.

### Padrão
**Instalação:**
```bash
npm install next-themes
```

**ThemeProvider:**
```typescript
// components/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**App.tsx:**
```typescript
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* resto da app */}
    </ThemeProvider>
  );
}
```

**ThemeToggle:**
```typescript
// components/theme-toggle.tsx
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  // ... implementação
}
```

### Benefícios
- **Zero CSS customizado**: shadcn/ui já tem todas as variáveis CSS
- **Suporte a system theme**: Detecta preferência do sistema automaticamente
- **Transições suaves**: Mudança de tema é instantânea
- **Persistência**: next-themes salva preferência no localStorage

### Padrão a Replicar
- Usar `next-themes` para gerenciar tema
- Configurar `attribute="class"` (shadcn/ui usa classes)
- `defaultTheme="system"` para melhor UX
- ThemeToggle sempre no Layout/Header
- NUNCA criar CSS customizado para dark mode (usar variáveis CSS do shadcn/ui)

### Referências
- Arquivos: `frontend/src/components/theme-provider.tsx`, `frontend/src/components/theme-toggle.tsx`
- Docs: [next-themes](https://github.com/pacocoursey/next-themes)

---
