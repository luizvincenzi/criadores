'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CreatorData } from '@/app/actions/sheetsActions';

interface CreatorModalProps {
  creator: CreatorData | null;
  isOpen: boolean;
  onClose: () => void;
  onCreatorUpdated?: (updatedCreator: any) => void;
}

interface CreatorFormData {
  name: string;
  cidade: string;
  whatsapp: string;
  instagram: string;
  seguidores: number;
  biografia: string;
  categoria: string;
  status: string;
  tiktok: string;
  seguidoresTiktok: number;
  notes: string;
}

export default function CreatorModalNew({ creator, isOpen, onClose, onCreatorUpdated }: CreatorModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState<CreatorFormData>({
    name: '',
    cidade: '',
    whatsapp: '',
    instagram: '',
    seguidores: 0,
    biografia: '',
    categoria: '',
    status: '',
    tiktok: '',
    seguidoresTiktok: 0,
    notes: ''
  });

  // Inicializar dados quando creator mudar
  useEffect(() => {
    if (creator) {
      setFormData({
        name: creator.nome || '',
        cidade: creator.cidade || '',
        whatsapp: creator.whatsapp || '',
        instagram: creator.instagram || '',
        seguidores: creator.seguidores || 0,
        biografia: creator.biografia || '',
        categoria: creator.categoria || '',
        status: creator.status || '',
        tiktok: creator.tiktok || '',
        seguidoresTiktok: creator.seguidoresTiktok || 0,
        notes: creator.notes || ''
      });
    }
  }, [creator]);

  const handleInputChange = (field: keyof CreatorFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      if (!creator?.id) {
        alert('Erro: ID do criador não encontrado');
        return;
      }

      const updateData = {
        id: creator.id,
        name: formData.name,
        contact_info: {
          whatsapp: formData.whatsapp
        },
        profile_info: {
          biography: formData.biografia,
          category: formData.categoria,
          location: {
            city: formData.cidade
          }
        },
        social_media: {
          instagram: {
            username: formData.instagram,
            followers: formData.seguidores
          },
          tiktok: {
            username: formData.tiktok,
            followers: formData.seguidoresTiktok
          }
        },
        status: formData.status,
        notes: formData.notes
      };

      const response = await fetch('/api/supabase/creators', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao salvar dados');
      }

      setSaveSuccess(true);
      
      if (onCreatorUpdated && result.data) {
        onCreatorUpdated(result.data);
      }
      
      setTimeout(() => {
        setIsEditMode(false);
        setSaveSuccess(false);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert(`❌ Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !creator) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden flex flex-col">
          
          {/* Header com cor laranja */}
          <div className="relative bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-4xl font-bold bg-white border border-orange-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      creator.nome
                    )}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 rounded-full text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200">
                      {isEditMode ? (
                        <select
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="bg-transparent border-none outline-none text-sm font-medium"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Não parceiro">Não parceiro</option>
                          <option value="Precisa engajar">Precisa engajar</option>
                        </select>
                      ) : (
                        creator.status
                      )}
                    </span>
                    <span className="text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.cidade}
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          className="bg-white border border-orange-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Cidade"
                        />
                      ) : (
                        creator.cidade
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center space-x-3">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-6 py-3 text-white rounded-lg transition-colors flex items-center ${
                        saveSuccess 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : isSaving 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Salvo com Sucesso!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                          </svg>
                          Salvar Alterações
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Fechar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Conteúdo do Modal */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">

              {/* Seção de Informações Pessoais */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{creator.nome}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: São Paulo, SP"
                      />
                    ) : (
                      <p className="text-gray-900">{creator.cidade || 'Não informado'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    {isEditMode ? (
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Não parceiro">Não parceiro</option>
                        <option value="Precisa engajar">Precisa engajar</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        creator.status === 'Ativo'
                          ? 'bg-green-100 text-green-800'
                          : creator.status === 'Precisa engajar'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {creator.status}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.categoria}
                        onChange={(e) => handleInputChange('categoria', e.target.value)}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Lifestyle, Moda, Tech"
                      />
                    ) : (
                      <p className="text-gray-900">{creator.categoria || 'Não informado'}</p>
                    )}
                  </div>
                </div>

                {/* Biografia */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biografia</label>
                  {isEditMode ? (
                    <textarea
                      value={formData.biografia}
                      onChange={(e) => handleInputChange('biografia', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Descreva o perfil do criador..."
                    />
                  ) : (
                    <p className="text-gray-900">{creator.biografia || 'Nenhuma biografia disponível'}</p>
                  )}
                </div>
              </div>

              {/* Seção de Redes Sociais */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                  Redes Sociais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <div className="flex items-center space-x-3">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange('instagram', e.target.value)}
                          className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="@username"
                        />
                      ) : (
                        <p className="flex-1 text-gray-900 font-medium">{creator.instagram || 'Não informado'}</p>
                      )}
                      {creator.instagram && !isEditMode && (
                        <button
                          onClick={() => {
                            const username = creator.instagram.replace('@', '');
                            window.open(`https://instagram.com/${username}`, '_blank');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          <span>Abrir</span>
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Seguidores Instagram</label>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={formData.seguidores}
                          onChange={(e) => handleInputChange('seguidores', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          placeholder="0"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 font-medium">
                          {creator.seguidores ? creator.seguidores.toLocaleString() : '0'} seguidores
                        </p>
                      )}
                    </div>
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                    <div className="flex items-center space-x-3">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.tiktok}
                          onChange={(e) => handleInputChange('tiktok', e.target.value)}
                          className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="@username"
                        />
                      ) : (
                        <p className="flex-1 text-gray-900 font-medium">{creator.tiktok || 'Não informado'}</p>
                      )}
                      {creator.tiktok && !isEditMode && (
                        <button
                          onClick={() => {
                            const username = creator.tiktok.replace('@', '');
                            window.open(`https://tiktok.com/@${username}`, '_blank');
                          }}
                          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                          <span>Abrir</span>
                        </button>
                      )}
                    </div>
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 mb-1">Seguidores TikTok</label>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={formData.seguidoresTiktok}
                          onChange={(e) => handleInputChange('seguidoresTiktok', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-1 text-sm border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                          placeholder="0"
                        />
                      ) : (
                        <p className="text-sm text-gray-700 font-medium">
                          {creator.seguidoresTiktok ? creator.seguidoresTiktok.toLocaleString() : '0'} seguidores
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção de Contato */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.16 11.37a11.045 11.045 0 005.516 5.516l1.983-4.064a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <div className="flex items-center space-x-3">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                          className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="(11) 99999-9999"
                        />
                      ) : (
                        <p className="flex-1 text-gray-900 font-medium">{creator.whatsapp || 'Não informado'}</p>
                      )}
                      {creator.whatsapp && !isEditMode && (
                        <button
                          onClick={() => {
                            const cleanNumber = creator.whatsapp.replace(/[^\d]/g, '');
                            window.open(`https://wa.me/55${cleanNumber}`, '_blank');
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    {isEditMode ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Observações sobre o criador..."
                      />
                    ) : (
                      <p className="text-gray-900">{creator.notes || 'Nenhuma observação'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção de Campanhas */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Campanhas Participadas
                </h3>
                <CampaignsList creatorName={creator.nome} />
              </div>

              {/* Seção de Estatísticas */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Estatísticas
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {creator.seguidores ? (creator.seguidores / 1000).toFixed(1) + 'K' : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Instagram</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-black">
                      {creator.seguidoresTiktok ? (creator.seguidoresTiktok / 1000).toFixed(1) + 'K' : '0'}
                    </div>
                    <div className="text-sm text-gray-600">TikTok</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {/* Aqui será calculado o número de campanhas */}
                      <CampaignCount creatorName={creator.nome} />
                    </div>
                    <div className="text-sm text-gray-600">Campanhas</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {creator.status === 'Ativo' ? '✓' : '○'}
                    </div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para listar campanhas do criador
function CampaignsList({ creatorName }: { creatorName: string }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/creator-campaigns?name=${encodeURIComponent(creatorName)}`);
        const result = await response.json();

        if (result.success) {
          setCampaigns(result.data || []);
        }
      } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (creatorName) {
      fetchCampaigns();
    }
  }, [creatorName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Carregando campanhas...</span>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-gray-500">Nenhuma campanha encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign, index) => (
        <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{campaign.business || 'Negócio não informado'}</h4>
              <p className="text-sm text-gray-600">{campaign.campanha || 'Campanha não informada'}</p>
              <p className="text-xs text-gray-500">{campaign.mes || 'Mês não informado'}</p>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                campaign.status === 'Finalizado'
                  ? 'bg-green-100 text-green-800'
                  : campaign.status === 'Em andamento'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {campaign.status || 'Status não informado'}
              </span>
              {campaign.linkTrabalho && (
                <div className="mt-2">
                  <a
                    href={campaign.linkTrabalho}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Ver trabalho
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para contar campanhas
function CampaignCount({ creatorName }: { creatorName: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`/api/creator-campaigns?name=${encodeURIComponent(creatorName)}`);
        const result = await response.json();

        if (result.success) {
          setCount(result.data?.length || 0);
        }
      } catch (error) {
        console.error('Erro ao contar campanhas:', error);
      }
    };

    if (creatorName) {
      fetchCount();
    }
  }, [creatorName]);

  return <span>{count}</span>;
}
