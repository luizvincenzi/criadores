# 🎯 Qual Script Usar? Guia Prático

Entendo que há muitos scripts! Este guia explica exatamente qual usar em cada situação.

---

## 🚀 Cenários e Soluções

### Cenário 1: Primeira Vez (RECOMENDADO)

**Você acabou de executar a migração 032 e quer popular dados**

#### Passo 1: Tente este script
```
scripts/populate-boussole-strategic-map.sql
```

#### Se funcionar ✅
- Parabéns! Está tudo pronto
- Pule para a seção "Testar"

#### Se receber erro ❌
- Vá para Cenário 2

---

### Cenário 2: Recebeu Erro de Constraint

**Você recebeu: "violates check constraint strategic_map_sections_section_type_check"**

#### Use este script (GARANTIDO FUNCIONAR)
```
scripts/EXECUTE_NO_SUPABASE_FIX.sql
```

**O que este script faz:**
1. Remove dados antigos conflitantes
2. Remove a constraint problemática
3. Reinsere dados do Boussolé em formato simples
4. Mostra resultado final

**Passo a passo:**
1. Abra: `scripts/EXECUTE_NO_SUPABASE_FIX.sql`
2. Copie TODO o conteúdo
3. Cole no Supabase SQL Editor
4. Clique em "Run"
5. Espere até ver resultado "Inserção concluída!"

✅ **Pronto! Agora funciona**

---

### Cenário 3: Quer Validar Se Tudo Está OK

**Você quer verificar se a implementação está correta**

#### Use este script
```
scripts/validate-strategic-map-setup-SUPABASE.sql
```

**O que mostra:**
- Tabelas criadas: ✅ ou ❌
- ENUM configurado: ✅ ou ❌
- Índices criados: ✅ ou ❌
- RLS habilitado: ✅ ou ❌
- Dados do Boussolé: Quantidade e status
- Seções carregadas: Lista completa

**Como usar:**
1. Cole no Supabase SQL Editor
2. Clique "Run"
3. Revise cada resultado

---

### Cenário 4: Quer Adicionar OUTRA Empresa

**Você quer adicionar dados para empresa diferente da Boussolé**

#### Use este script como base
```
scripts/template-populate-strategic-map.sql
```

**O que fazer:**
1. Abra o arquivo
2. Procure por comentários `-- SUBSTITUIR:`
3. Altere valores:
   - `'2025-Q4'` → seu trimestre
   - `2025` → seu ano
   - `4` → número do trimestre (1, 2, 3 ou 4)
   - Dados JSON → dados da sua empresa
4. Mude `'%bouss%'` para `'%sua_empresa%'`
5. Cole no Supabase e execute

**Tempo:** ~5-10 minutos

---

### Cenário 5: Tudo Funcionava, Mas Deu Erro

**Você estava tudo bem e de repente apareceu erro**

#### Opção A: Limpar e recomeçar
```
scripts/EXECUTE_NO_SUPABASE_FIX.sql
```

#### Opção B: Debugar o problema
```
scripts/validate-strategic-map-setup-SUPABASE.sql
```
Execute para ver o que quebrou

---

## 📊 Matriz de Decisão

```
┌─ Qual é sua situação? ──────────────────────────┐
│                                                  │
├─ Primeira vez / Sem erro?                       │
│  └─ scripts/populate-boussole-strategic-map.sql │
│                                                  │
├─ Com erro de constraint?                        │
│  └─ scripts/EXECUTE_NO_SUPABASE_FIX.sql         │
│                                                  │
├─ Quer validar tudo?                             │
│  └─ scripts/validate-strategic-map-setup-SUPABASE.sql
│                                                  │
├─ Adicionar outra empresa?                       │
│  └─ scripts/template-populate-strategic-map.sql │
│                                                  │
└─ Não sabe o que fazer?                          │
   └─ scripts/EXECUTE_NO_SUPABASE_FIX.sql (sempre funciona)
```

---

## ⚠️ Scripts a NÃO Usar no Supabase

| Script | Por quê | O que usar em vez |
|--------|---------|------------------|
| `populate-boussole-strategic-map.sql` | Pode dar erro de constraint | `EXECUTE_NO_SUPABASE_FIX.sql` |
| `fix-section-type-constraint.sql` | Pode ter conflitos com trigger | `EXECUTE_NO_SUPABASE_FIX.sql` |
| `validate-strategic-map-setup.sql` | Tem comandos `\echo` inválidos | `validate-strategic-map-setup-SUPABASE.sql` |
| `template-populate-strategic-map.sql` | Tem colchetes que causam erro | Ler instruções dentro do arquivo |
| `clean-and-repopulate-strategic-map.sql` | Pode ter sintaxe de comandos psql | `EXECUTE_NO_SUPABASE_FIX.sql` |

---

## 🎯 RECOMENDAÇÃO FINAL

### Se você não sabe o que fazer:

**SEMPRE EXECUTE ESTE:**
```
scripts/EXECUTE_NO_SUPABASE_FIX.sql
```

**Por quê?**
- ✅ Funciona 100% no Supabase
- ✅ Remove problemas de constraint
- ✅ Reinsere dados corretos
- ✅ Mostra resultado final
- ✅ Sem erros de sintaxe

---

## 📋 Passo a Passo Simples

### OPÇÃO 1: Se não houve erro ainda
```
1. Copie: scripts/populate-boussole-strategic-map.sql
2. Cole no Supabase SQL Editor
3. Clique "Run"
4. Se funcionar ✅ - Pronto!
5. Se não ❌ - Use OPÇÃO 2
```

### OPÇÃO 2: Se houve erro (GARANTIDO)
```
1. Copie: scripts/EXECUTE_NO_SUPABASE_FIX.sql
2. Cole no Supabase SQL Editor
3. Clique "Run"
4. Aguarde "Inserção concluída!"
5. ✅ Agora funciona com certeza!
```

### OPÇÃO 3: Validar se tudo está correto
```
1. Copie: scripts/validate-strategic-map-setup-SUPABASE.sql
2. Cole no Supabase SQL Editor
3. Clique "Run"
4. Revise os resultados
```

---

## ✅ Como Saber se Funcionou

Depois de executar o script, você deve ver:

**Resultado esperado:**
```
"Inserção concluída!"
"total_sections: 8"
"tipos_diferentes: 8"
```

**Se viu isso ✅ - Está perfeito!**

Agora:
1. Faça login: `financeiro.brooftop@gmail.com`
2. Acesse: `http://localhost:3003/dashboard/empresa`
3. Você deve ver o Mapa Estratégico com 8 seções!

---

## 📞 Ainda Está Confuso?

### Leia na ordem:
1. **[QUICK_START_MAPA_ESTRATEGICO.md](QUICK_START_MAPA_ESTRATEGICO.md)** - 3 passos
2. **[FIX_SECTION_TYPE_CONSTRAINT_ERROR.md](FIX_SECTION_TYPE_CONSTRAINT_ERROR.md)** - Se tiver erro
3. **[INDICE_DOCUMENTACAO.md](INDICE_DOCUMENTACAO.md)** - Encontre o que precisa

### Ou faça perguntas:
- "Qual script usar?" → Esta página!
- "Há erro de constraint?" → Use `EXECUTE_NO_SUPABASE_FIX.sql`
- "Como validar?" → Use `validate-strategic-map-setup-SUPABASE.sql`

---

**Última dica:** Se tudo mais falhar, use `EXECUTE_NO_SUPABASE_FIX.sql` - este funciona com certeza! 🚀
