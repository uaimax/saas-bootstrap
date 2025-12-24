# Erros Comuns e Soluções - Gerais

Este arquivo documenta **erros gerais já enfrentados** e suas soluções para evitar repetição.

---

---
date: 2024-12-23
category: devops
tags: [tmux, scripts, desenvolvimento, automação]
severity: medium
---

## tmux: Janelas Separadas vs Split (Dividido)

### Contexto
Script `dev-start.sh` criando duas janelas separadas quando o usuário queria uma janela dividida ao meio.

### Problema
- Script usava `tmux new-window` criando janela 1 separada
- Usuário queria ver backend e frontend simultaneamente na mesma tela
- Duas janelas separadas dificultam visualização simultânea

### Solução
**Usar `split-window` em vez de `new-window`:**

```bash
# Criar sessão com backend
tmux new-session -d -s "$TMUX_SESSION" -n "dev" \
    -c "$BACKEND_DIR" \
    "source venv/bin/activate && python manage.py runserver 0.0.0.0:$PORT"

# Dividir janela horizontalmente (split)
tmux split-window -h -t "$TMUX_SESSION:0" -c "$FRONTEND_DIR" \
    "npm run dev -- --host 0.0.0.0 --port $FRONTEND_PORT"

# Selecionar painel esquerdo por padrão
tmux select-pane -t "$TMUX_SESSION:0.0"
```

**Comandos atualizados:**
- `Ctrl+B + ←/→` - Alternar entre painéis (não mais `Ctrl+B + 0/1`)
- `Ctrl+B + Q` - Mostrar números dos painéis

### Lições Aprendidas
- `split-window -h` divide horizontalmente (lado a lado)
- `split-window -v` divide verticalmente (um em cima do outro)
- Painéis são referenciados como `sessão:janela.painel` (ex: `0.0`, `0.1`)
- Split é melhor para visualização simultânea de serviços relacionados

### Referências
- Arquivos: `dev-start.sh`
- Docs: `docs/DEV_START.md`

---
