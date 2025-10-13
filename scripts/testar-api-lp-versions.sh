#!/bin/bash

# ============================================================================
# SCRIPT DE TESTE - API de Versionamento de LPs
# ============================================================================
# Este script testa a nova API de versionamento
# ============================================================================

echo "🧪 Testando API de Versionamento de Landing Pages"
echo "=================================================="
echo ""

# Configuração
BASE_URL="http://localhost:3007"
LP_ID="SEU_LP_ID_AQUI" # ← SUBSTITUIR pelo ID real da LP de advogados

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# TESTE 1: Buscar histórico de versões
# ============================================================================
echo -e "${YELLOW}TESTE 1: Buscar histórico de versões${NC}"
echo "GET $BASE_URL/api/landing-pages/$LP_ID/versions"
echo ""

curl -X GET "$BASE_URL/api/landing-pages/$LP_ID/versions" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "=================================================="
echo ""

# ============================================================================
# TESTE 2: Criar nova versão
# ============================================================================
echo -e "${YELLOW}TESTE 2: Criar nova versão${NC}"
echo "POST $BASE_URL/api/landing-pages/$LP_ID/versions"
echo ""

curl -X POST "$BASE_URL/api/landing-pages/$LP_ID/versions" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "hero": {
        "headline": "TESTE - Novo Headline via API",
        "subheadline": "Este é um teste da API de versionamento",
        "cta_text": "Falar com Especialista",
        "background_color": "#1a1a2e"
      },
      "problema": {
        "titulo": "Por Que Advogados Precisam de Marketing Digital?",
        "descricao": "O cliente moderno pesquisa online antes de contratar."
      }
    },
    "config": {
      "theme": "dark",
      "layout": "default"
    },
    "seo": {
      "title": "Social Media para Advogados | crIAdores",
      "description": "Gestão de redes sociais especializada para advogados"
    },
    "change_description": "Teste de criação via API",
    "created_by": "admin"
  }' \
  | jq '.'

echo ""
echo "=================================================="
echo ""

# ============================================================================
# TESTE 3: Verificar se nova versão foi criada
# ============================================================================
echo -e "${YELLOW}TESTE 3: Verificar nova versão${NC}"
echo "GET $BASE_URL/api/landing-pages/$LP_ID/versions"
echo ""

curl -X GET "$BASE_URL/api/landing-pages/$LP_ID/versions" \
  -H "Content-Type: application/json" \
  | jq '.data.versions[0]'

echo ""
echo "=================================================="
echo ""

echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Verifique se a nova versão aparece no histórico"
echo "2. Acesse a LP no navegador para ver se mudou"
echo "3. Se funcionou, use esta API para editar LPs"
echo ""

