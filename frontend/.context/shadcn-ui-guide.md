# Guia Rápido: shadcn/ui no SaaS Bootstrap

Este guia consolida todos os aprendizados sobre uso correto do shadcn/ui no projeto.

## 🎯 Princípio Fundamental

**SEMPRE usar componentes shadcn/ui ao invés de criar CSS/Tailwind customizado.**

## 📋 Checklist Antes de Criar CSS

Antes de escrever qualquer classe Tailwind ou CSS customizado:

1. ✅ **Verificar se shadcn/ui tem componente equivalente**
   - Button, Input, Card, Alert, Table, etc.
   - Consultar: https://ui.shadcn.com/docs/components

2. ✅ **Usar componente shadcn/ui se existir**
   - Instalar: `npx shadcn@latest add [component-name]`
   - Importar e usar diretamente

3. ✅ **Apenas customizar via props/variants se necessário**
   - Usar `variant`, `size`, etc.
   - Combinar com `cn()` quando necessário

4. ✅ **NUNCA criar classes Tailwind para coisas que shadcn/ui já cobre**

## 🏗️ Estrutura de Componentes

### Padrão: Forms Separados das Páginas

```
frontend/src/
├── components/
│   ├── forms/              # Componentes de formulário reutilizáveis
│   │   ├── login-form.tsx  # Toda lógica aqui
│   │   └── register-form.tsx
│   └── ui/                 # Componentes base do shadcn/ui
│       ├── button.tsx
│       ├── input.tsx
│       └── form.tsx
└── pages/                  # Páginas apenas renderizam
    ├── Login.tsx           # Apenas importa LoginForm
    └── Register.tsx        # Apenas importa RegisterForm
```

**Regra:** Páginas devem ter < 20 linhas, apenas layout e import.

## 📦 Instalação de Blocks

**Comando:**
```bash
npx shadcn@latest add [block-name]
```

**Exemplos:**
```bash
npx shadcn@latest add login-05
npx shadcn@latest add signup-01  # Se existir
```

**Processo após instalação:**
1. Mover arquivos de `@/components/` para `src/components/forms/`
2. Adaptar para nosso contexto:
   - Integrar com AuthContext
   - Adicionar React Hook Form + Zod
   - Conectar com endpoints do backend
3. Manter estrutura visual do block

## 🔧 Formulários com React Hook Form + Zod

**Padrão obrigatório para todos os formulários:**

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

// 1. Definir schema Zod
const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

// 2. Usar useForm com zodResolver
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { email: "", password: "" },
});

// 3. Usar Form components do shadcn/ui
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />  {/* Sempre incluir para erros */}
        </FormItem>
      )}
    />
  </form>
</Form>
```

**NUNCA usar Input/Label nativos em formulários!**

## 🎨 Dark Mode

**Stack:**
- `next-themes` para gerenciar tema
- CSS variables do shadcn/ui (já configuradas)
- Zero CSS customizado necessário

**Setup:**
```typescript
// App.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {/* app */}
</ThemeProvider>

// Layout.tsx
<ThemeToggle />  // Sempre no header
```

**NUNCA criar CSS customizado para dark mode!**

## ❌ Anti-Padrões (NUNCA Fazer)

### 1. Criar CSS quando shadcn/ui tem componente
```typescript
// ❌ ERRADO
<div className="p-4 border rounded-lg">
  <input className="w-full px-3 py-2 border" />
</div>

// ✅ CORRETO
<Card>
  <CardContent>
    <Input />
  </CardContent>
</Card>
```

### 2. Usar Input/Label nativos em formulários
```typescript
// ❌ ERRADO
<label>Email</label>
<input type="email" />

// ✅ CORRETO
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3. Colocar lógica de formulário na página
```typescript
// ❌ ERRADO - Toda lógica na página
export default function Login() {
  const [email, setEmail] = useState("");
  // ... toda lógica aqui
}

// ✅ CORRETO - Componente separado
export default function Login() {
  return <LoginForm />;
}
```

### 4. Criar classes Tailwind quando shadcn/ui tem variant
```typescript
// ❌ ERRADO
<button className="px-4 py-2 bg-blue-500">Submit</button>

// ✅ CORRETO
<Button variant="default">Submit</Button>
```

## ✅ Padrões (SEMPRE Fazer)

1. **Verificar shadcn/ui antes de criar CSS**
2. **Usar componentes shadcn/ui ao invés de Tailwind puro**
3. **Formulários sempre com React Hook Form + Zod**
4. **Form components do shadcn/ui (não Input/Label nativos)**
5. **Componentes de formulário em `components/forms/`**
6. **Páginas apenas renderizam componentes**
7. **ThemeProvider para dark mode (sem CSS customizado)**

## 📚 Referências

- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [shadcn/ui Blocks](https://ui.shadcn.com/blocks)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## 🔍 Componentes Essenciais Instalados

- ✅ button
- ✅ input
- ✅ card
- ✅ form
- ✅ label
- ✅ select
- ✅ table
- ✅ alert
- ✅ separator
- ✅ badge
- ✅ dropdown-menu

**Para instalar mais:**
```bash
npx shadcn@latest add [component-name]
```

## 💡 Dica Final

**Quando em dúvida, verifique:**
1. Existe componente shadcn/ui para isso?
2. Existe block shadcn/ui que posso adaptar?
3. Posso usar variant ao invés de criar CSS?

**Se a resposta for "sim" para qualquer uma, use shadcn/ui!**


