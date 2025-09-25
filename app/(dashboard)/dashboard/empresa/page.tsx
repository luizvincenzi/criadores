'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import {
  BarChart4, LineChart, Target, Star, Users, Users2, Globe2,
  MapPin, Building, History, CheckCircle, AlertTriangle, XCircle,
  Package, CircleDollarSign, Megaphone, Tag, Briefcase, Gem,
  TrendingUp, Calendar, Shield, Sparkles, Clapperboard, ClipboardCheck,
  Truck, Zap
} from 'lucide-react';

// Types
interface QuarterlySnapshot {
  id: string;
  business_id: string;
  quarter: string;
  year: number;
  quarter_number: number;
  digital_presence: {
    google: { rating: number; reviews: number };
    instagram: number;
    facebook: number;
    tiktok: number;
    tripadvisor?: { rating: number; rank: number };
  };
  kpis: {
    ocupacao: number;
    ticket: number;
    margemPorcoes: number;
    nps: number;
    ruido: number;
  };
  four_ps_status: {
    produto: 'green' | 'yellow' | 'red';
    preco: 'green' | 'yellow' | 'red';
    praca: 'green' | 'yellow' | 'red';
    promocao: 'green' | 'yellow' | 'red';
  };
  porter_forces: {
    [key: string]: { score: number; status: string };
  };
  executive_summary: {
    green: string[];
    yellow: string[];
    red: string[];
  };
  notes: string;
  created_at: string;
  updated_at: string;
}

interface BusinessInfo {
  id: string;
  name: string;
  address?: string;
  tags?: string[];
}

// Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Section = ({ 
  title, 
  icon: Icon, 
  children, 
  actions 
}: { 
  title: string; 
  icon: React.ComponentType<any>; 
  children: React.ReactNode; 
  actions?: React.ReactNode;
}) => (
  <Card>
    <div className="border-b px-6 py-4 bg-gray-50 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-gray-700 flex items-center">
        <Icon className="h-4 w-4 text-gray-500 mr-2" />
        {title}
      </h2>
      {actions}
    </div>
    <div className="p-6">{children}</div>
  </Card>
);

const statusColor = (status: string) => {
  switch (status) {
    case 'green': return 'text-green-700 bg-green-50 border-green-200';
    case 'yellow': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'red': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

const statusDot = (status: string) => {
  const base = 'h-2.5 w-2.5 rounded-full mr-2';
  const color = status === 'green' ? 'bg-green-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-red-500';
  return <span className={`${base} ${color}`} />;
};

const DeltaBadge = ({ value }: { value: number | null }) => {
  if (value === null || value === undefined) return <span className="text-xs text-gray-400">—</span>;
  if (value === 0) return <span className="text-xs text-gray-500">0</span>;
  const positive = value > 0;
  return (
    <span className={`text-xs ${positive ? 'text-green-700' : 'text-red-700'}`}>
      {positive ? '+' : ''}{value}
    </span>
  );
};

export default function DashboardEmpresa() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [snapshots, setSnapshots] = useState<QuarterlySnapshot[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar acesso
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!['business_owner', 'manager', 'admin'].includes(user.role)) {
      router.push('/dashboard/unauthorized');
      return;
    }
  }, [user, router]);

  // Carregar dados
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.business_id) return;

      try {
        setLoading(true);
        
        // Carregar snapshots trimestrais
        const snapshotsResponse = await fetch(`/api/dashboard/empresa/snapshots?businessId=${user.business_id}`);
        if (snapshotsResponse.ok) {
          const snapshotsData = await snapshotsResponse.json();
          setSnapshots(snapshotsData);
          
          // Selecionar o trimestre mais recente por padrão
          if (snapshotsData.length > 0) {
            setSelectedQuarter(snapshotsData[snapshotsData.length - 1].quarter);
          }
        }

        // Carregar informações do negócio
        const businessResponse = await fetch(`/api/businesses/${user.business_id}`);
        if (businessResponse.ok) {
          const businessData = await businessResponse.json();
          setBusinessInfo(businessData);
        }

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.business_id]);

  // Dados calculados
  const selectedSnapshot = useMemo(() => 
    snapshots.find(s => s.quarter === selectedQuarter), 
    [snapshots, selectedQuarter]
  );

  const previousSnapshot = useMemo(() => {
    if (!selectedSnapshot) return null;
    const currentIndex = snapshots.findIndex(s => s.quarter === selectedQuarter);
    return currentIndex > 0 ? snapshots[currentIndex - 1] : null;
  }, [snapshots, selectedQuarter, selectedSnapshot]);

  const deltaNumber = (curr: number | null, old: number | null) => {
    if (curr == null || old == null) return null;
    const d = curr - old;
    return d === 0 ? 0 : Number(d.toFixed(1));
  };

  // Métricas de presença digital
  const digitalPresenceMetrics = [
    { 
      key: 'google', 
      name: 'Google Reviews', 
      icon: Star, 
      fmt: (v: any) => v ? `${v.rating.toFixed(1)}/5` : '—', 
      subfmt: (v: any) => v ? `${v.reviews} avaliações` : '—' 
    },
    { 
      key: 'tripadvisor', 
      name: 'Tripadvisor', 
      icon: Globe2, 
      fmt: (v: any) => v ? `${v.rating.toFixed(1)}/5` : '—', 
      subfmt: (v: any) => v?.rank ? `Top ${v.rank} na região` : '—' 
    },
    { 
      key: 'instagram', 
      name: 'Instagram', 
      icon: Users2, 
      fmt: (v: number) => v ? v.toLocaleString('pt-BR') : '—', 
      subfmt: () => 'seguidores' 
    },
    { 
      key: 'facebook', 
      name: 'Facebook', 
      icon: Users, 
      fmt: (v: number) => v ? v.toLocaleString('pt-BR') : '—', 
      subfmt: () => 'seguidores' 
    },
    { 
      key: 'tiktok', 
      name: 'TikTok', 
      icon: Users, 
      fmt: (v: number) => v ? v.toLocaleString('pt-BR') : '—', 
      subfmt: (v: number) => v ? 'seguidores' : 'não habilitado' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!selectedSnapshot) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Nenhum dado trimestral encontrado</p>
          <p className="text-sm text-gray-500 mt-2">
            Entre em contato com o suporte para configurar seu dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <Building className="h-5 w-5 text-gray-700" />
            </div>
            <h1 className="text-base font-semibold text-gray-800">Dashboard Empresarial</h1>
            <span className="hidden sm:inline text-xs text-gray-500">
              {businessInfo?.name || 'Carregando...'}
            </span>
          </div>
          
          {/* Seletor de Período */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Período:</label>
            <select 
              value={selectedQuarter} 
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
            >
              {snapshots.map(s => (
                <option key={s.id} value={s.quarter}>
                  {s.quarter.replace('-Q', ' - ')}º Trimestre
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        {/* Hero Compacto */}
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg border border-gray-200 p-2">
                  <Building className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {businessInfo?.name || 'Empresa'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {businessInfo?.address || 'Endereço não informado'}
                  </div>
                </div>
              </div>
              
              {/* Google rating do snapshot atual */}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-1" />
                  <b>{selectedSnapshot.digital_presence.google?.rating?.toFixed(1) || '—'}</b>
                  <span className="text-gray-500 ml-1">
                    ({selectedSnapshot.digital_presence.google?.reviews || '—'})
                  </span>
                </div>
                <div className="hidden md:flex flex-wrap gap-1">
                  {businessInfo?.tags?.slice(0, 4).map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-600 border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Presença Digital */}
        <Section title="Presença Digital" icon={LineChart}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {digitalPresenceMetrics.map((metric, i) => {
              const Icon = metric.icon;
              const currentVal = selectedSnapshot.digital_presence[metric.key as keyof typeof selectedSnapshot.digital_presence];
              const prevVal = previousSnapshot?.digital_presence[metric.key as keyof typeof previousSnapshot.digital_presence];
              
              const toNumber = (v: any) => {
                if (!v) return null;
                if (typeof v === 'number') return v;
                if (typeof v === 'object' && 'rating' in v) return v.rating;
                return null;
              };
              
              const delta = deltaNumber(toNumber(currentVal), toNumber(prevVal));
              
              return (
                <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white">
                  <div className="flex items-center text-gray-600 text-xs mb-1">
                    <Icon className="h-3.5 w-3.5 mr-1" />
                    {metric.name}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-800">
                        {metric.fmt(currentVal)}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {metric.subfmt(currentVal)}
                      </div>
                    </div>
                    <DeltaBadge value={delta} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Executive Summary */}
        <Section title="Sumário Executivo" icon={BarChart4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`border rounded-lg p-4 ${statusColor('green')}`}>
              <div className="flex items-center text-green-700 font-semibold mb-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verde
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {selectedSnapshot.executive_summary.green.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={`border rounded-lg p-4 ${statusColor('yellow')}`}>
              <div className="flex items-center text-amber-700 font-semibold mb-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Amarelo
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {selectedSnapshot.executive_summary.yellow.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className={`border rounded-lg p-4 ${statusColor('red')}`}>
              <div className="flex items-center text-red-700 font-semibold mb-2">
                <XCircle className="h-4 w-4 mr-2" />
                Vermelho
              </div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {selectedSnapshot.executive_summary.red.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            Revisão trimestral — use o seletor de período no topo para comparar evoluções.
          </p>
        </Section>

        {/* KPIs Críticos */}
        <Section title="KPIs Críticos" icon={Target}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(selectedSnapshot.kpis).map(([key, value]) => {
              const prevValue = previousSnapshot?.kpis[key as keyof typeof previousSnapshot.kpis] ?? null;
              const delta = deltaNumber(value, prevValue);

              // Status automático baseado no KPI
              const getKPIStatus = (kpiKey: string, val: number) => {
                if (val == null) return 'gray';
                switch (kpiKey) {
                  case 'ruido': return val <= 0 ? 'green' : val <= 1 ? 'yellow' : 'red';
                  case 'nps': return val >= 75 ? 'green' : val >= 60 ? 'yellow' : 'red';
                  case 'margemPorcoes': return val >= 65 ? 'green' : val >= 55 ? 'yellow' : 'red';
                  case 'ticket': return val >= 68 ? 'green' : val >= 60 ? 'yellow' : 'red';
                  case 'ocupacao': return val >= 75 ? 'green' : val >= 60 ? 'yellow' : 'red';
                  default: return 'gray';
                }
              };

              const getKPILabel = (kpiKey: string) => {
                switch (kpiKey) {
                  case 'ocupacao': return 'Ocupação Sex/Sáb';
                  case 'ticket': return 'Ticket Médio';
                  case 'margemPorcoes': return 'Margem Porções';
                  case 'nps': return 'NPS Mensal';
                  case 'ruido': return 'Reclamações Ruído';
                  default: return kpiKey;
                }
              };

              const getKPITarget = (kpiKey: string) => {
                switch (kpiKey) {
                  case 'ocupacao': return '≥ 75%';
                  case 'ticket': return 'R$ 68';
                  case 'margemPorcoes': return '≥ 65%';
                  case 'nps': return '≥ 75';
                  case 'ruido': return '0/mês';
                  default: return '—';
                }
              };

              const getKPIFormat = (kpiKey: string, val: number) => {
                switch (kpiKey) {
                  case 'ocupacao': return `${val}%`;
                  case 'ticket': return `R$ ${val}`;
                  case 'margemPorcoes': return `${val}%`;
                  case 'nps': return `${val}`;
                  case 'ruido': return `${val}/mês`;
                  default: return `${val}`;
                }
              };

              const status = getKPIStatus(key, value);

              return (
                <div key={key} className={`rounded-xl border p-4 ${statusColor(status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-800">
                      {getKPILabel(key)}
                    </h4>
                    {status === 'green' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : status === 'yellow' ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">
                    Meta: <b>{getKPITarget(key)}</b>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-xs text-gray-600">
                      Atual: <b>{getKPIFormat(key, value)}</b>
                    </div>
                    <DeltaBadge value={delta} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 4 Ps do Marketing */}
        <Section title="4 Ps do Marketing" icon={Tag}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(selectedSnapshot.four_ps_status).map(([key, status]) => {
              const prevStatus = previousSnapshot?.four_ps_status[key as keyof typeof previousSnapshot.four_ps_status] || null;
              const changed = prevStatus && prevStatus !== status;

              const getPLabel = (pKey: string) => {
                switch (pKey) {
                  case 'produto': return 'Produto';
                  case 'preco': return 'Preço';
                  case 'praca': return 'Praça';
                  case 'promocao': return 'Promoção';
                  default: return pKey;
                }
              };

              const getPIcon = (pKey: string) => {
                switch (pKey) {
                  case 'produto': return Package;
                  case 'preco': return CircleDollarSign;
                  case 'praca': return MapPin;
                  case 'promocao': return Megaphone;
                  default: return Tag;
                }
              };

              const Icon = getPIcon(key);

              return (
                <div key={key} className={`border rounded-lg p-4 ${statusColor(status)}`}>
                  <div className="flex items-center mb-2">
                    {statusDot(status)}
                    <Icon className="h-4 w-4 mr-2 text-gray-600" />
                    <h4 className="font-semibold text-gray-800">{getPLabel(key)}</h4>
                    {changed && (
                      <span className="ml-auto text-[11px] text-gray-600">
                        {prevStatus} → <b>{status}</b>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1">Status atual</p>
                    <p className="capitalize">{status === 'green' ? 'Excelente' : status === 'yellow' ? 'Atenção' : 'Crítico'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* 5 Forças de Porter */}
        <Section title="5 Forças de Porter" icon={Briefcase}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(selectedSnapshot.porter_forces).map(([key, force]) => {
              const prevForce = previousSnapshot?.porter_forces[key] || null;
              const delta = prevForce ? deltaNumber(force.score, prevForce.score) : null;

              const getForceLabel = (forceKey: string) => {
                switch (forceKey) {
                  case 'rivalidade': return 'Rivalidade';
                  case 'entrantes': return 'Novos Entrantes';
                  case 'fornecedores': return 'Fornecedores';
                  case 'clientes': return 'Clientes';
                  case 'substitutos': return 'Substitutos';
                  default: return forceKey;
                }
              };

              return (
                <div key={key} className={`border rounded-lg p-4 ${statusColor(force.status)}`}>
                  <div className="flex items-center mb-1">
                    {statusDot(force.status)}
                    <h4 className="font-semibold text-sm text-gray-800">
                      {getForceLabel(key)}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div>Nota: <b>{force.score}/10</b></div>
                    <DeltaBadge value={delta} />
                  </div>
                  <div className="text-xs text-gray-600 mt-1 capitalize">
                    {force.status === 'green' ? 'Favorável' : force.status === 'yellow' ? 'Moderado' : 'Desfavorável'}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Frentes Táticas */}
        <Section title="3 Frentes Táticas de Crescimento" icon={TrendingUp}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-blue-800">Consolidar o Pico (Sex/Sáb)</h4>
              </div>
              <p className="text-sm text-blue-700">
                Agenda pública + cover simbólico (R$3–R$7).
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-green-800">Rituais de Semana</h4>
              </div>
              <p className="text-sm text-green-700">
                Terça da Família / Quarta do Baguete / Quinta do Playground.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Truck className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-purple-800">Delivery Inteligente</h4>
              </div>
              <p className="text-sm text-purple-700">
                Campanhas hiperlocais focadas em campeões de venda.
              </p>
            </div>
          </div>
        </Section>

        {/* OKRs Trimestrais */}
        <Section title="OKRs Trimestrais" icon={Target}>
          <div className="space-y-6">
            {/* Indicadores de Validação */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Indicadores de Validação</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500 mb-1">NPS por turno/dia</div>
                  <div className="font-semibold text-gray-800">Monitorar</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500 mb-1">Ocupação em sex/sáb</div>
                  <div className="font-semibold text-gray-800">≥ 75%</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500 mb-1">Ticket médio por mesa</div>
                  <div className="font-semibold text-gray-800">R$ 68</div>
                </div>
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500 mb-1">Itens mais vendidos</div>
                  <div className="font-semibold text-gray-800">Por categoria</div>
                </div>
              </div>
            </div>

            {/* Objetivos */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">🎯 Objetivos Principais</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <h5 className="font-semibold text-gray-800">Foco</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    1 posicionamento claro + 3 rituais semanais.
                  </p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    <h5 className="font-semibold text-gray-800">Vizinhança</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    0 ocorrências mensais de ruído.
                  </p>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <BarChart4 className="h-5 w-5 text-purple-600 mr-2" />
                    <h5 className="font-semibold text-gray-800">Música Sustentável</h5>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ponto de equilíbrio (≥0 no P&L) via cover + margem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Estratégia de Produto */}
        <Section title="Cardápio & Heróis de Produto" icon={Package}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-orange-600 mr-2" />
                <h4 className="font-semibold text-orange-800">Família & Porções</h4>
              </div>
              <p className="text-sm text-orange-700">
                Dar visibilidade à seção com maior margem.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-semibold text-yellow-800">Heróis por Ritual</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Baguete na quarta, pratos executivos na semana.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Zap className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-green-800">Combos Estratégicos</h4>
              </div>
              <p className="text-sm text-green-700">
                Foco em ticket médio e frequência de retorno.
              </p>
            </div>
          </div>
        </Section>

        {/* Histórico Resumido */}
        <Section title="Histórico Trimestral" icon={History}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">Ocupação Sex/Sáb</div>
              <div className="text-xl font-semibold text-gray-800">
                {selectedSnapshot.kpis.ocupacao}%
                <span className="text-xs text-gray-500 ml-2">
                  ({previousSnapshot ?
                    `${deltaNumber(selectedSnapshot.kpis.ocupacao, previousSnapshot.kpis.ocupacao) >= 0 ? '+' : ''}${deltaNumber(selectedSnapshot.kpis.ocupacao, previousSnapshot.kpis.ocupacao)}`
                    : '—'})
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">Ticket Médio</div>
              <div className="text-xl font-semibold text-gray-800">
                R$ {selectedSnapshot.kpis.ticket}
                <span className="text-xs text-gray-500 ml-2">
                  ({previousSnapshot ?
                    `${deltaNumber(selectedSnapshot.kpis.ticket, previousSnapshot.kpis.ticket) >= 0 ? '+' : ''}${deltaNumber(selectedSnapshot.kpis.ticket, previousSnapshot.kpis.ticket)}`
                    : '—'})
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">NPS</div>
              <div className="text-xl font-semibold text-gray-800">
                {selectedSnapshot.kpis.nps}
                <span className="text-xs text-gray-500 ml-2">
                  ({previousSnapshot ?
                    `${deltaNumber(selectedSnapshot.kpis.nps, previousSnapshot.kpis.nps) >= 0 ? '+' : ''}${deltaNumber(selectedSnapshot.kpis.nps, previousSnapshot.kpis.nps)}`
                    : '—'})
                </span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
            <span>Período:</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700"
            >
              {snapshots.map(s => (
                <option key={s.id} value={s.quarter}>
                  {s.quarter.replace('-Q', ' - ')}º Trimestre
                </option>
              ))}
            </select>
            <span className="ml-2">Notas: {selectedSnapshot.notes}</span>
          </div>
        </Section>
      </main>
    </div>
  );
}
