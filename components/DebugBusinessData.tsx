'use client';

import React, { useState, useEffect } from 'react';
import { getBusinessesData } from '@/app/actions/sheetsActions';

export default function DebugBusinessData() {
  const [businessData, setBusinessData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getBusinessesData();
      setBusinessData(data);
      console.log('📊 Dados dos negócios:', data);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Debug - Dados dos Negócios
        </h3>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      <div className="space-y-4">
        {businessData.map((business, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold text-gray-900 mb-2">{business.nome}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>ID:</strong> {business.id}</div>
              <div><strong>Categoria:</strong> {business.categoria}</div>
              <div><strong>Plano Atual:</strong> {business.planoAtual}</div>
              <div><strong>Comercial:</strong> {business.comercial}</div>
              <div><strong>Nome Responsável:</strong> {business.nomeResponsavel}</div>
              <div><strong>Cidade:</strong> {business.cidade}</div>
              <div><strong>WhatsApp Responsável:</strong> {business.whatsappResponsavel}</div>
              <div><strong>Prospecção:</strong> {business.prospeccao}</div>
              <div><strong>Responsável:</strong> {business.responsavel}</div>
              <div><strong>Instagram:</strong> {business.instagram}</div>
              <div><strong>Grupo WhatsApp:</strong> {business.grupoWhatsappCriado}</div>
              <div><strong>Contrato Assinado:</strong> {business.contratoAssinadoEnviado}</div>
              <div><strong>Data Assinatura:</strong> {business.dataAssinaturaContrato}</div>
              <div><strong>Contrato Válido Até:</strong> {business.contratoValidoAte}</div>
              <div><strong>Related Files:</strong> {business.relatedFiles}</div>
              <div><strong>Notes:</strong> {business.notes}</div>
            </div>
          </div>
        ))}
      </div>

      {businessData.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center py-8">
          Nenhum dado encontrado
        </p>
      )}
    </div>
  );
}
