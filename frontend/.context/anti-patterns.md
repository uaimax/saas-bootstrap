# Anti-Padrões - Frontend

Este arquivo documenta **padrões do frontend que devem ser evitados**.

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, tailwind, css, código-desnecessário]
severity: high
---

## ❌ Criar CSS Customizado Quando shadcn/ui Já Tem Componente

### Anti-Padrão
```typescript
// ❌ ERRADO - Criando estilos customizados
<div className="p-4 border rounded-lg shadow-md">
  <input className="w-full px-3 py-2 border rounded" />
  <button className="px-4 py-2 bg-blue-500 text-white rounded">
    Submit
  </button>
</div>
```

### Problema
- Duplicação de código (shadcn/ui já tem Card, Input, Button)
- Inconsistência visual (não segue design system)
- Mais código para manter
- Perde acessibilidade built-in do shadcn/ui

### Padrão Correto
```typescript
// ✅ CORRETO - Usando componentes shadcn/ui
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<Card>
  <CardContent>
    <Input />
    <Button>Submit</Button>
  </CardContent>
</Card>
```

### Lições Aprendidas
- **SEMPRE verificar se shadcn/ui tem componente antes de criar CSS**
- Usar componentes shadcn/ui ao invés de Tailwind puro
- Apenas customizar quando realmente necessário (via props/variants)
- Manter consistência com design system

### Referências
- Arquivos: `frontend/src/components/ui/`
- Docs: [shadcn/ui components](https://ui.shadcn.com/docs/components)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, formulários, validação, código-desnecessário]
severity: high
---

## ❌ Usar Input/Label Nativos ao Invés de Form Components do shadcn/ui

### Anti-Padrão
```typescript
// ❌ ERRADO - Input/Label nativos
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {error && <div className="text-red-500">{error}</div>}
</form>
```

### Problema
- Sem validação integrada
- Sem mensagens de erro acessíveis
- Mais código boilerplate
- Perde integração com React Hook Form
- Não segue padrão do shadcn/ui

### Padrão Correto
```typescript
// ✅ CORRETO - Form components do shadcn/ui
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

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
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### Lições Aprendidas
- **SEMPRE usar Form components do shadcn/ui para formulários**
- `FormMessage` já é acessível e mostra erros automaticamente
- Integração com React Hook Form é automática
- Menos código, mais funcionalidade

### Referências
- Arquivos: `frontend/src/components/forms/login-form.tsx`
- Docs: [shadcn/ui form](https://ui.shadcn.com/docs/components/form)

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, estrutura, organização, código-desnecessário]
severity: medium
---

## ❌ Colocar Lógica de Formulário Direto na Página

### Anti-Padrão
```typescript
// ❌ ERRADO - Toda lógica na página
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    // ... toda lógica aqui
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* ... */}
      </form>
    </div>
  );
}
```

### Problema
- Página fica muito grande
- Lógica não é reutilizável
- Dificulta testes
- Não segue padrão do shadcn/ui (blocks)

### Padrão Correto
```typescript
// ✅ CORRETO - Componente separado
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

// components/forms/login-form.tsx
export function LoginForm() {
  // Toda lógica aqui
}
```

### Lições Aprendidas
- **Páginas devem apenas renderizar componentes**
- Lógica sempre em componentes separados
- Facilita reutilização e testes
- Segue padrão dos blocks do shadcn/ui

### Referências
- Arquivos: `frontend/src/pages/Login.tsx`, `frontend/src/components/forms/login-form.tsx`

---

---
date: 2024-12-23
category: frontend
tags: [shadcn-ui, tailwind, css, customização]
severity: medium
---

## ❌ Criar Classes Tailwind Customizadas Quando shadcn/ui Já Tem Variants

### Anti-Padrão
```typescript
// ❌ ERRADO - Criando classes customizadas
<button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
  Primary Button
</button>
```

### Problema
- shadcn/ui Button já tem variants (default, destructive, outline, etc.)
- Perde consistência do design system
- Mais código para manter
- Não aproveita sistema de variants do shadcn/ui

### Padrão Correto
```typescript
// ✅ CORRETO - Usando variants do shadcn/ui
import { Button } from "@/components/ui/button";

<Button variant="default">Primary Button</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

### Lições Aprendidas
- **SEMPRE usar variants do shadcn/ui antes de criar classes customizadas**
- Customizar apenas quando realmente necessário (via `cn()` e classes adicionais)
- Manter consistência com design system
- Aproveitar sistema de variants built-in

### Referências
- Arquivos: `frontend/src/components/ui/button.tsx`
- Docs: [shadcn/ui button](https://ui.shadcn.com/docs/components/button)

---
