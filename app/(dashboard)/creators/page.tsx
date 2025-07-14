'use client';

import React, { useState, useEffect } from 'react';
import { getCreatorsData, CreatorData } from '@/app/actions/sheetsActions';
import CreatorModalNew from '@/components/CreatorModalNew';
import AddCreatorModal from '@/components/AddCreatorModal';
import Button from '@/components/ui/Button';

export default function CreatorsPage() {
  const [creators, setCreators] = useState<CreatorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCreator, setSelectedCreator] = useState<CreatorData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityFilter, setCityFilter] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ranking, setRanking] = useState<any[]>([]);


  useEffect(() => {
    loadCreators();
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      const response = await fetch('/api/creators-ranking');
      const data = await response.json();
      if (data.success) {
        setRanking(data.ranking);
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    }
  };

  const loadCreators = async () => {
    setIsLoading(true);
    try {
      const data = await getCreatorsData();
      // Ordenar alfabeticamente por nome
      const sortedCreators = data.sort((a: CreatorData, b: CreatorData) =>
        a.nome.localeCompare(b.nome)
      );
      setCreators(sortedCreators);

      // Extrair cidades únicas para o filtro
      const cities = [...new Set(data.map((c: CreatorData) => c.cidade).filter(Boolean))].sort();
      setAvailableCities(cities);
    } catch (error) {
      console.error('Erro ao carregar criadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };



  const openModal = (creator: CreatorData) => {
    setSelectedCreator(creator);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCreator(null);
    setIsModalOpen(false);
  };

  // Filtrar criadores - APENAS ATIVO e PRECISA ENGAJAR
  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.instagram.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creator.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrar apenas criadores ATIVO e PRECISA ENGAJAR
    const allowedStatuses = ['ativo', 'precisa engajar'];
    const matchesStatus = allowedStatuses.includes(creator.status.toLowerCase());

    // Filtrar por cidade se selecionada
    const matchesCity = !cityFilter || creator.cidade.toLowerCase().includes(cityFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCity;
  });

  // Estatísticas - apenas dados relevantes
  const allowedStatuses = ['ativo', 'precisa engajar'];
  const activeCreators = creators.filter(c => allowedStatuses.includes(c.status.toLowerCase()));

  const stats = {
    total: activeCreators.length,
    ativos: creators.filter(c => c.status.toLowerCase() === 'ativo').length,
    totalSeguidores: activeCreators.reduce((acc, c) => acc + c.seguidores, 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Carregando criadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Criadores</h1>
          <p className="text-sm text-gray-600">
            {filteredCreators.length} criadores encontrados
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Update button hidden in production */}
          <Button
            variant="outlined"
            size="sm"
            icon="🔄"
            onClick={loadCreators}
            className="hidden"
          >
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Sync</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="hidden sm:inline">Novo Criador</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Criadores</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.total}</p>
              <p className="text-xs text-secondary mt-1">Cadastrados</p>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
        </div>



        <div className="card-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total Seguidores</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{formatFollowers(stats.totalSeguidores)}</p>
              <p className="text-xs text-primary mt-1">Alcance total</p>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Ranking - {new Date().toLocaleDateString('pt-BR', { month: 'long' }).charAt(0).toUpperCase() + new Date().toLocaleDateString('pt-BR', { month: 'long' }).slice(1)}</p>
              <p className="text-xs text-secondary mt-1">Top criadores</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-600">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            {ranking.length > 0 ? (
              ranking.map((creator, index) => (
                <div key={creator.nome} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{creator.nome}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{creator.trabalhos}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum trabalho este mês</p>
            )}
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card-elevated p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, Instagram ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Todas as cidades</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Criadores */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criador
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seguidores
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instagram
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCreators.map((creator) => (
                <tr key={creator.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                          {creator.nome.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{creator.nome}</div>
                        <div className="text-xs text-gray-500">{creator.categoria || 'Sem categoria'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {creator.cidade || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                    {formatFollowers(creator.seguidores)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {creator.instagram ? (
                      <a
                        href={creator.instagram.startsWith('http') ? creator.instagram : `https://instagram.com/${creator.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                        title={creator.instagram}
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        {(() => {
                          // Extrair apenas o nome do usuário do Instagram
                          let username = creator.instagram;
                          if (username.includes('instagram.com/')) {
                            username = username.split('instagram.com/')[1].split('?')[0].split('/')[0];
                          }
                          username = username.replace('@', '');
                          return `@${username}`;
                        })()}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {creator.whatsapp ? (
                      <a
                        href={`https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        {creator.whatsapp}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(creator)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCreators.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {creators.length === 0 ? 'Nenhum criador encontrado' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-500">
              {creators.length === 0
                ? 'Configure o Google Sheets para ver os dados dos criadores.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <CreatorModalNew
        creator={selectedCreator}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Modal de Adicionar Criador */}
      <AddCreatorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadCreators(); // Recarrega a lista após adicionar
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}
