#!/bin/bash

# Script para executar a migration do Relatório 360º via psql

set -e

echo "🚀 Deploying Relatório 360º Landing Page..."
echo ""

# Verificar se psql está disponível
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado. Instale o PostgreSQL client."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

# Extrair dados de conexão do Supabase
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Variável SUPABASE_DB_URL não definida"
    echo "   Defina com: export SUPABASE_DB_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Executar migration
echo "📝 Executando migration..."
psql "$SUPABASE_DB_URL" -f database/migrations/002_seed_relatorio360.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration executada com sucesso!"
    echo ""
    echo "📍 Próximos passos:"
    echo "   1. Verifique em: https://criadores.app/relatorio360"
    echo "   2. Teste o formulário de contato"
    echo "   3. Configure redirecionamento pós-envio"
else
    echo "❌ Erro ao executar migration"
    exit 1
fi
