'use client';

import { useState, useEffect } from 'react';
import { EditableSection } from '@/components/strategic-map/EditableSection';
import { MetricsOverviewSection } from '@/components/strategic-map/MetricsOverviewSection';
import { MarketAnalysisSection } from '@/components/strategic-map/MarketAnalysisSection';
import { BusinessDiagnosisSection } from '@/components/strategic-map/BusinessDiagnosisSection';
import { SWOTSection } from '@/components/strategic-map/SWOTSection';
import { ProductAnalysisSection } from '@/components/strategic-map/ProductAnalysisSection';
import { ICPPersonasSection } from '@/components/strategic-map/ICPPersonasSection';
import { KPITableSection } from '@/components/strategic-map/KPITableSection';
import { ObjectivesSection } from '@/components/strategic-map/ObjectivesSection';
import { getCurrentQuarter, generateQuarters, formatQuarter } from '@/lib/utils/quarters';
import { useAuthStore } from '@/store/authStore';
import type { GetStrategicMapResponse, StrategicMapSection } from '@/types/strategic-map';

export default function MapaPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter().value);
  const [map, setMap] = useState<GetStrategicMapResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const quarters = generateQuarters();

  useEffect(() => {
    if (isAuthenticated && user?.business_id) {
      fetchMap();
    } else {
      setIsLoading(false);
    }
  }, [selectedQuarter, isAuthenticated, user?.business_id]);

  const fetchMap = async () => {
    if (!user?.business_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/strategic-maps?business_id=${user.business_id}&quarter=${selectedQuarter}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);

        // Check if data has strategic_map property (single map response)
        if (data.strategic_map) {
          setMap(data);
        } else {
          // No map found - show default content
          setMap({
            strategic_map: {
              id: 'default',
              business_id: user?.business_id || '',
              quarter: selectedQuarter,
              status: 'completed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            sections: []
          });
        }
      } else {
        // Show default content on error
        setMap({
          strategic_map: {
            id: 'default',
            business_id: user?.business_id || '',
            quarter: selectedQuarter,
            status: 'completed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          sections: []
        });
      }
    } catch (error) {
      console.error('Error fetching map:', error);
      // Show default content on error
      setMap({
        strategic_map: {
          id: 'default',
          business_id: user?.business_id || '',
          quarter: selectedQuarter,
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        sections: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando Mapa Estratégico...</p>
        </div>
      </div>
    );
  }

  const handleSectionUpdate = (updatedSection: StrategicMapSection) => {
    // Atualizar seção no estado local
    if (map?.sections) {
      const updatedSections = map.sections.map((s: StrategicMapSection) =>
        s.id === updatedSection.id ? updatedSection : s
      );
      setMap({
        ...map,
        sections: updatedSections,
      });
    }
  };

  const renderSection = (section: any) => {
    const sectionComponents: Record<string, React.ReactNode> = {
      metrics_overview: <MetricsOverviewSection
        socialMedia={{
          instagram: { followers: section.content.instagram?.followers || 0, engagement_rate: section.content.instagram?.growth_rate || 0, verified: false },
          facebook: { followers: section.content.facebook?.followers || 0, engagement_rate: section.content.facebook?.growth_rate || 0 },
          tiktok: { followers: section.content.tiktok?.followers || 0, engagement_rate: section.content.tiktok?.growth_rate || 0 },
        }}
        reviews={{
          google: { rating: section.content.google_reviews?.rating || 0, total_reviews: section.content.google_reviews?.total || 0 }
        }}
        opportunity={section.content.main_opportunity || ''}
        competitive_advantage={section.content.competitive_advantage || ''}
      />,
      market_analysis: <MarketAnalysisSection content={section.content} />,
      business_diagnosis: <BusinessDiagnosisSection content={section.content} />,
      swot: <SWOTSection content={section.content} />,
      product_analysis: <ProductAnalysisSection content={section.content} />,
      icp_personas: <ICPPersonasSection content={section.content} />,
      kpi_table: <KPITableSection content={section.content} />,
      objectives: <ObjectivesSection content={section.content} />,
    };

    return sectionComponents[section.section_type] || (
      <pre className="text-sm text-gray-600 overflow-auto bg-gray-50 p-4 rounded">
        {JSON.stringify(section.content, null, 2)}
      </pre>
    );
  };

  const getSectionTitle = (sectionType: string): string => {
    const titles: Record<string, string> = {
      metrics_overview: 'Visão Geral das Métricas',
      market_analysis: 'Análise de Mercado',
      business_diagnosis: 'Diagnóstico do Negócio',
      swot: 'Análise SWOT',
      product_analysis: 'Análise de Produto',
      icp_personas: 'Perfis de Clientes Ideais (ICP)',
      kpi_table: 'Indicadores de Performance',
      objectives: 'Objetivos e Plano de Ação',
    };
    return titles[sectionType] || sectionType.replace(/_/g, ' ');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="flex justify-center items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Mapa Estratégico</h1>
          <div className="flex items-center">
            <span className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: 'Onest, sans-serif' }}>
              <span className="text-gray-600" style={{ fontWeight: 300 }}>cr</span>
              <span className="text-black" style={{ fontWeight: 700 }}>IA</span>
              <span className="text-gray-600" style={{ fontWeight: 300 }}>dores</span>
            </span>
          </div>
        </div>
        <p className="text-lg text-gray-500 mt-2">
          Mapa vivo dos clientes ideais e oportunidades de crescimento
        </p>
        <div className="mt-6 flex justify-center items-center gap-4 text-sm text-gray-500">
          <span><strong>Negócio:</strong> {user?.full_name || 'Negócio'}</span>
          <span className="hidden sm:inline">|</span>
          <div className="flex items-center gap-2">
            <strong>Período:</strong>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-gray-200 border-gray-300 rounded-md text-sm p-1"
            >
              {quarters.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
          <span className="hidden sm:inline">|</span>
          <span>
            Status: {map?.strategic_map?.status === 'completed' ? '✅ Completo' : '⏳ Gerando...'}
          </span>
        </div>
      </header>

      {/* Sections */}
      <main className="space-y-12">
        {/* Render all sections including metrics_overview */}
        {map?.sections && map.sections.length > 0 ? (
          map.sections.map((section: StrategicMapSection) => (
            <section key={section.id} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {getSectionTitle(section.section_type)}
                </h2>
              </div>
              <EditableSection section={section} onUpdate={handleSectionUpdate}>
                {renderSection(section)}
              </EditableSection>
            </section>
          ))
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-700 font-medium">
              Aguardando geração das seções...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
