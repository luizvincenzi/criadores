# 📦 REFERÊNCIA DE PRODUCT IDs

Este arquivo documenta os IDs dos produtos usados nas Landing Pages.

---

## 🎯 PRODUTOS EXISTENTES NO BANCO

| Product ID | Nome | Slug | Preço Padrão |
|------------|------|------|--------------|
| `48835b46-53e6-4062-b763-841ced3bc0d9` | **Mentoria** | mentoria | R$ 1.500,00 |
| `e4601bac-eb02-4116-a6ad-6a79a85f628b` | **Estrategista de Marketing** | estrategista | R$ 1.800,00 |
| `f7c78360-990e-4482-b73d-b748696ce450` | **Marketing de Influência** | marketing-influencia | R$ 1.300,00 |
| `ce079f6f-d885-4cc5-987d-8ed81b1ce9a6` | **UGC** | ugc | R$ 1.500,00 |

---

## 🔗 MAPEAMENTO LP → PRODUTOS

### LP 1: /empresas (Combo)
**Produtos:** 3
- `48835b46-53e6-4062-b763-841ced3bc0d9` - Mentoria
- `e4601bac-eb02-4116-a6ad-6a79a85f628b` - Estrategista de Marketing
- `f7c78360-990e-4482-b73d-b748696ce450` - Marketing de Influência

### LP 2: /empresas/mentoria
**Produtos:** 1
- `48835b46-53e6-4062-b763-841ced3bc0d9` - Mentoria

### LP 3: /empresas/social-media
**Produtos:** 1
- `e4601bac-eb02-4116-a6ad-6a79a85f628b` - Estrategista de Marketing

### LP 4: /empresas/criadores
**Produtos:** 1
- `f7c78360-990e-4482-b73d-b748696ce450` - Marketing de Influência

### LP 5: /empresas/social-media-medicos
**Produtos:** 1
- `e4601bac-eb02-4116-a6ad-6a79a85f628b` - Estrategista de Marketing

### LP 6: /empresas/social-media-advogados
**Produtos:** 1
- `e4601bac-eb02-4116-a6ad-6a79a85f628b` - Estrategista de Marketing

---

## 📝 NOTAS

### Preços nas LPs vs Preços no Banco

Os preços exibidos nas LPs são **hardcoded no JSONB `variables`** e podem ser diferentes dos preços padrão no banco:

| LP | Produto | Preço na LP (Mensal) | Preço na LP (Semestral) | Preço no Banco |
|----|---------|---------------------|------------------------|----------------|
| Mentoria | Mentoria | R$ 2.500 | R$ 1.500 | R$ 1.500 |
| Social Media | Estrategista | R$ 2.500 | R$ 1.500 | R$ 1.800 |
| Criadores | Marketing Influência | R$ 2.500 | R$ 1.500 | R$ 1.300 |
| Médicos | Estrategista | R$ 2.500 | R$ 1.500 | R$ 1.800 |
| Advogados | Estrategista | R$ 2.500 | R$ 1.500 | R$ 1.800 |

**Recomendação:** Decidir se os preços devem vir do banco ou do JSONB da LP.

---

## 🔄 ATUALIZAÇÃO FUTURA

Se você adicionar novos produtos, atualize este arquivo e os seeds correspondentes.

### Como Buscar Product IDs

```sql
SELECT id, name, slug, default_price 
FROM products 
ORDER BY created_at;
```

### Como Atualizar um Produto em uma LP

```sql
-- Exemplo: Trocar produto da LP /empresas/mentoria
UPDATE lp_products
SET product_id = 'NOVO_PRODUCT_ID'
WHERE lp_id = '20000000-0000-0000-0000-000000000002'
  AND product_id = 'ANTIGO_PRODUCT_ID';
```

---

## ✅ STATUS

- [x] IDs corrigidos em todos os seeds
- [x] Mapeamento documentado
- [ ] Decidir estratégia de preços (banco vs LP)

---

**Última atualização:** 2025-10-13

