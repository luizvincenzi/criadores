'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  BarChart4, LineChart, Target, Star, Users, Users2, Globe2, 
  MapPin, Building, History, CheckCircle, AlertTriangle, XCircle,
  Package, CircleDollarSign, Megaphone, Tag, Briefcase, Gem,
  TrendingUp, Calendar, Shield, Sparkles, Clapperboard, ClipboardCheck
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

        {/* Continuar implementação... */}
        <div className="text-center py-8">
          <p className="text-gray-500">Dashboard em desenvolvimento...</p>
          <p className="text-sm text-gray-400 mt-2">
            Mais seções serão adicionadas em breve
          </p>
        </div>
      </main>
    </div>
  );
}
