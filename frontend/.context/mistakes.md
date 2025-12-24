# Erros Comuns e Soluções - Frontend

Este arquivo documenta **erros específicos do frontend** já enfrentados e suas soluções.

---

---
date: 2024-12-23
category: frontend
tags: [tailwindcss, shadcn-ui, compatibilidade, postcss]
severity: high
---

## Tailwind CSS 4.x Incompatível com shadcn/ui

### Contexto
Projeto usando Tailwind CSS 4.1.18 com shadcn/ui. CSS não estava carregando corretamente, design aparecendo sem estilos.

### Problema
- Tailwind CSS 4.x tem sintaxe e configuração completamente diferentes da v3
- shadcn/ui foi desenvolvido para Tailwind CSS 3.x
- `@tailwindcss/postcss` é necessário na v4, mas shadcn/ui não suporta
- `@apply` com classes customizadas não funciona da mesma forma na v4
- CSS gerado estava incompleto (4.55 kB vs 10.60 kB esperado)

### Solução
**Downgrade para Tailwind CSS 3.4.1:**

```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3.4.1 postcss@^8.4.35 autoprefixer@^10.4.18
npm install -D tailwindcss-animate
```

**Atualizar `postcss.config.js`:**
```js
export default {
  plugins: {
    tailwindcss: {},  // Não usar @tailwindcss/postcss
    autoprefixer: {},
  },
}
```

**Configurar `tailwind.config.js` completo para shadcn/ui:**
- Adicionar plugin `tailwindcss-animate`
- Configurar todas as cores do tema shadcn/ui
- Configurar keyframes e animações

### Lições Aprendidas
- **SEMPRE verificar compatibilidade de versões** antes de instalar
- shadcn/ui requer Tailwind CSS 3.x (não 4.x)
- Quando usar bibliotecas que dependem de versões específicas, verificar documentação oficial
- CSS gerado menor que esperado pode indicar problema de configuração

### Referências
- Arquivos: `frontend/tailwind.config.js`, `frontend/postcss.config.js`
- Docs: [shadcn/ui installation](https://ui.shadcn.com/docs/installation)

---

---
date: 2024-12-23
category: frontend
tags: [typescript, jsdoc, comentários, build]
severity: medium
---

## Comentários JSDoc Mal Formatados Quebram Build

### Contexto
Build do frontend falhando com erro "Expected */ to terminate multi-line comment".

### Problema
Comentários JSDoc usando sintaxe incorreta:
```typescript
/**Contexto de autenticação para gerenciar estado do usuário."""
```

O problema é o `"""` no final - isso não é sintaxe válida para comentários JSDoc em TypeScript/JavaScript.

### Solução
**Formato correto:**
```typescript
/** Contexto de autenticação para gerenciar estado do usuário. */
```

**Regras:**
- Usar `/**` para iniciar (com espaço após `/**`)
- Usar `*/` para fechar
- NUNCA usar `"""` (isso é Python, não TypeScript)
- Espaço após `/**` é recomendado para melhor formatação

### Lições Aprendidas
- Comentários JSDoc devem seguir sintaxe TypeScript/JavaScript
- Não misturar sintaxe de diferentes linguagens
- Erros de build podem ser causados por comentários mal formatados
- Sempre validar sintaxe antes de commit

### Referências
- Arquivos: `frontend/src/**/*.tsx`, `frontend/src/**/*.ts`

---
