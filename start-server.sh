#!/bin/bash

# Script para iniciar o servidor Next.js
echo "🚀 Iniciando servidor Next.js..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado no diretório atual"
    echo "📁 Diretório atual: $(pwd)"
    echo "📋 Arquivos disponíveis:"
    ls -la
    exit 1
fi

echo "✅ package.json encontrado"
echo "📁 Diretório: $(pwd)"

# Matar qualquer processo na porta 3000
echo "🔄 Liberando porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar o servidor
echo "🌟 Iniciando servidor de desenvolvimento..."
npm run dev
