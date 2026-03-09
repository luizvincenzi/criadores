'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  CheckCircle2, Users, Clapperboard, Calendar,
  ExternalLink, Award, MapPin,
  ChevronRight, Play, Layout, ListChecks,
  Search, ShieldCheck, Sparkles, Instagram,
  PlayCircle, FileText, Target, TrendingUp,
  MessageSquare, Briefcase, Zap, ArrowRight,
  Info, Clock, Megaphone, ChefHat, Eye,
  BarChart3, MessageCircle, Crown, Flame, ArrowUpRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend
);

const reportData = {
  header: {
    title: "Relatorio de Atividades",
    client: "Bread King Londrina",
    period: "Nov 2025 - Mar 2026",
    date: "09 de Marco de 2026",
    preparedBy: "Equipe Criadores Digital"
  },
  instagramProfile: {
    handle: "@breadkinglondrina",
    followers: 4487,
    totalPosts: 192,
    periodPosts: 85,
    periodVideos: 56,
    periodImages: 25,
    periodCarousels: 4,
    totalViews: 80625,
    totalComments: 653,
    avgPostsPerMonth: 17,
    avgViewsPerVideo: 1439,
    avgCommentsPerPost: 7.7,
  },
  monthlyPerformance: [
    { month: "Nov/25", label: "Novembro", posts: 23, views: 2500, comments: 96, avgViews: 277, isBest: false, isPartial: false },
    { month: "Dez/25", label: "Dezembro", posts: 20, views: 14717, comments: 192, avgViews: 865, isBest: false, isPartial: false },
    { month: "Jan/26", label: "Janeiro", posts: 22, views: 55105, comments: 248, avgViews: 3936, isBest: true, isPartial: false },
    { month: "Fev/26", label: "Fevereiro", posts: 15, views: 6034, comments: 83, avgViews: 502, isBest: false, isPartial: false },
    { month: "Mar/26", label: "Marco", posts: 5, views: 2269, comments: 34, avgViews: 567, isBest: false, isPartial: true },
  ],
  topVideos: [
    { views: 40006, comments: 94, date: "24 Jan", influencer: "Fernanda Tagawa", theme: "Praticidade nas Ferias", link: "https://www.instagram.com/reel/DT5cHtskVrS/" },
    { views: 3359, comments: 10, date: "5 Jan", influencer: "Mariani Fernandes", theme: "Humor Crianca", link: "https://www.instagram.com/reel/DTJQE7GERTL/" },
    { views: 2991, comments: 48, date: "9 Jan", influencer: "ANA BUENO", theme: "Fome nas Ferias", link: "https://www.instagram.com/reel/DTTie-5Eayn/" },
    { views: 2558, comments: 1, date: "15 Dez", influencer: null, theme: "Sobremesa para Ceia", link: "https://www.instagram.com/reel/DSTHe7UE_Pa/" },
    { views: 2402, comments: 4, date: "23 Jan", influencer: "Luciana Casarin", theme: "Marketing Transformation", link: "https://www.instagram.com/reel/DT0Fir6kkQj/" },
  ],
  kpis: [
    { label: "Total de Posts", value: "85", sub: "Nov/25 a Mar/26", icon: PlayCircle },
    { label: "Visualizacoes", value: "80.6K", sub: "Total do Periodo", icon: Eye },
    { label: "Comentarios", value: "653", sub: "Engajamento Real", icon: MessageCircle },
    { label: "Vozes Ativas", value: "18", sub: "Influenciadores", icon: Users },
    { label: "Media por Video", value: "1.4K", sub: "Views por Video", icon: TrendingUp },
    { label: "Posts por Mes", value: "17", sub: "Frequencia Media", icon: Calendar },
    { label: "Direcionamento", value: "16", sub: "Temas Criativos", icon: Sparkles },
    { label: "Alinhamento", value: "05", sub: "Reunioes Estrategicas", icon: Briefcase },
  ],
  pillars: [
    { id: 1, title: "Planejamento Estrategico Mensal", desc: "Definicao de temas, calendario editorial e direcionamento criativo.", icon: Target },
    { id: 2, title: "Execucao de Social Media", desc: "Gestao completa das redes sociais com conteudo profissional.", icon: Instagram },
    { id: 3, title: "Marketing de Influencia Local", desc: "Campanhas com influenciadores que falam a lingua de Londrina.", icon: Users },
    { id: 4, title: "Mentoria Semanal", desc: "Acompanhamento proximo para alinhar estrategias e insights.", icon: Briefcase }
  ],
  evolution: [
    {
      month: "Marco 2026",
      subtitle: "Eventos Comunitarios e Autoridade",
      initiative: "Evento Dia do Doguinho + Mes da Mulher",
      stats: "5 posts | 2+ influenciadores",
      narrative: "Criamos dois eventos de alto impacto local: o Dia do Doguinho (14/03) como experiencia presencial para atrair novos publicos, e uma dinamica especial de Mes da Mulher para fortalecer a conexao emocional com a audiencia feminina.",
      details: ["Evento Doguinho (14/03)", "Dinamica Mes da Mulher", "Humor com Kelvin", "Comparativo Nutricionista"],
      metrics: { posts: 5, views: 2269, comments: 34, avgViews: 567, isPartial: true }
    },
    {
      month: "Fevereiro 2026",
      subtitle: "Volta as Aulas e Tendencias Virais",
      initiative: "4 Campanhas Tematicas Simultaneas",
      stats: "15 posts | 4 influenciadores",
      narrative: "Executamos 4 frentes criativas em paralelo: a trend viral R$ 1 vs R$ 100 para gerar alcance, o posicionamento de saudabilidade (sem conservantes), conteudo de volta as aulas para maes e a versatilidade do croissant como carro-chefe de produto.",
      details: ["Trend R$ 1 vs R$ 100", "Saudabilidade (Sem Conservantes)", "Volta as Aulas", "Versatilidade Croissant"],
      metrics: { posts: 15, views: 6034, comments: 83, avgViews: 502 }
    },
    {
      month: "Janeiro 2026",
      subtitle: "Explosao de Alcance nas Ferias",
      initiative: "Campanha Praticidade nas Ferias",
      stats: "22 posts | 4 influenciadores",
      narrative: "A grande aposta do periodo: influenciadoras maes falando sobre praticidade durante as ferias escolares. A estrategia gerou o melhor mes do perfil com 55 mil views — um unico video da Fernanda Tagawa alcancou 40 mil visualizacoes e 94 comentarios.",
      details: ["Praticidade nas Ferias", "Cafe da Manha Bread King", "Video Viral 40K Views"],
      metrics: { posts: 22, views: 55105, comments: 248, avgViews: 3936, highlight: "Melhor Mes" }
    },
    {
      month: "Dezembro 2025",
      subtitle: "Natal, Kits e Confraternizacoes",
      initiative: "Kit Natal Corporativo + Bolsa Termica",
      stats: "20 posts | 4 influenciadores",
      narrative: "Desenvolvemos o Kit Natal como produto estrategico para empresas e o Kit Natal com Bolsa Termica para pessoa fisica. Criamos conteudo de humor natalino e focamos em sobremesas como driver de vendas para ceias e confraternizacoes.",
      details: ["Kit Natal Corporativo", "Kit Natal + Bolsa Termica", "Videos de Humor Natalino", "Foco em Sobremesas para Ceias"],
      metrics: { posts: 20, views: 14717, comments: 192, avgViews: 865 }
    },
    {
      month: "Novembro 2025",
      subtitle: "Inicio da Operacao e Black November",
      initiative: "Lancamento Digital + Black November",
      stats: "23 posts | 4 influenciadores",
      narrative: "O mes zero da parceria. Estruturamos toda a presenca digital da Bread King em Londrina do zero: identidade de conteudo, primeiros influenciadores ativados e a campanha Black November com 40% OFF para gerar volume de vendas e awareness inicial.",
      details: ["Black November (40% OFF)", "Kit Empresarial", "Institucional Loja", "Primeiros Influenciadores"],
      metrics: { posts: 23, views: 2500, comments: 96, avgViews: 277 }
    }
  ],
  influencers: [
    { id: 1, name: "Andressa Bieco", campaign: "Nov/25 - Black November", link: "https://www.instagram.com/reel/DSais7wj3lB/", views: 485, comments: 12 },
    { id: 2, name: "Pietra Mantovani", campaign: "Nov/25 - Kit Empresarial", link: "https://www.instagram.com/reel/DRx2UR1janB/", views: 2198, comments: 34 },
    { id: 3, name: "Giro Londrina", campaign: "Nov/25 - Bread King Loja", link: "https://www.instagram.com/reel/DRhhqe_jarE/", views: 673, comments: 20 },
    { id: 4, name: "Ana Nunes", campaign: "Nov/25 - Bread King Loja", link: "https://www.instagram.com/reel/DSDd6PHkq7O/", views: 481, comments: 33 },
    { id: 5, name: "Isabella", campaign: "Dez/25 - Confra/Kit Natal", link: "https://www.instagram.com/reel/DSVq26Ygdc-/", views: 481, comments: 40 },
    { id: 6, name: "ANA BUENO", campaign: "Dez/25 - Video Engracado", link: "https://www.instagram.com/reel/DTTie-5Eayn/", views: 2991, comments: 48 },
    { id: 7, name: "Eliza", campaign: "Dez/25 - Kit Natal", link: "https://www.instagram.com/reel/DSh53SKAKLH/", views: 1551, comments: 17 },
    { id: 8, name: "Mariani Fernandes", campaign: "Dez/25 - Sobremesa", link: "https://www.instagram.com/reel/DTJQE7GERTL/", views: 3359, comments: 10 },
    { id: 9, name: "Thays", campaign: "Jan/26", link: "https://www.instagram.com/reel/DUwJJtNiYhk/", views: 391, comments: 3 },
    { id: 10, name: "Fernanda Tagawa", campaign: "Jan/26", link: "https://www.instagram.com/reel/DT5cHtskVrS/", views: 40006, comments: 94 },
    { id: 11, name: "Andreia Gavetti", campaign: "Jan/26", link: "https://www.instagram.com/reel/DU8WWGcjbZN/", views: 612, comments: 14 },
    { id: 12, name: "Luciana Casarin", campaign: "Jan/26", link: "https://www.instagram.com/reel/DT0Fir6kkQj/", views: 2402, comments: 4 },
    { id: 13, name: "Lara Agostini", campaign: "Fev/26 - Trends", link: "#", status: "Em producao" },
    { id: 14, name: "Stefany Bigas", campaign: "Fev/26 - Saudavel", link: "https://www.instagram.com/reel/DVb6KS2AI-_/", views: 1380, comments: 12 },
    { id: 15, name: "Catarina", campaign: "Fev/26 - Volta as Aulas", link: "https://www.instagram.com/reel/DVCXIJ9D2Lc/" },
    { id: 16, name: "Isabela Fernandes", campaign: "Fev/26 - Croissant", link: "https://www.instagram.com/reel/DVMfCmvkhM1/" },
    { id: 17, name: "Alice Nunes", campaign: "Mar/26 - Evento Doguinho", link: "https://www.instagram.com/reel/DVgpn91k0YK/", views: 335, comments: 8 },
    { id: 18, name: "Karol Silva", campaign: "Mar/26 - Mes da Mulher", link: "#", status: "Em producao" }
  ]
};

// Helper
function formatNumber(num: number): string {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
  return num.toString();
}

function AppleCard({ children, className = "", noPadding = false }: { children: React.ReactNode; className?: string; noPadding?: boolean }) {
  return (
    <div className={`bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/50 ${className}`}>
      <div className={noPadding ? "" : "p-8 md:p-10"}>{children}</div>
    </div>
  );
}

function SectionTitle({ title, icon: Icon }: { title: string; icon: React.ComponentType<{ size?: number }> }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-50 text-red-600">
        <Icon size={24} />
      </div>
      <h2 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">{title}</h2>
    </div>
  );
}

function WhyMatters({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-red-50/40 rounded-3xl p-6 border border-red-100/30 mb-8">
      <div className="flex gap-4">
        <div className="mt-1 text-red-600 flex-shrink-0"><Info size={20} /></div>
        <div>
          <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Por que isso e importante?</h4>
          <p className="text-sm text-red-900/70 leading-relaxed font-medium italic">{children}</p>
        </div>
      </div>
    </div>
  );
}

// Chart config
const chartData = {
  labels: reportData.monthlyPerformance.map(m => m.month + (m.isPartial ? '*' : '')),
  datasets: [{
    label: 'Visualizacoes',
    data: reportData.monthlyPerformance.map(m => m.views),
    backgroundColor: reportData.monthlyPerformance.map(m =>
      m.isBest ? 'rgba(220, 38, 38, 0.85)' : 'rgba(220, 38, 38, 0.25)'
    ),
    borderColor: reportData.monthlyPerformance.map(m =>
      m.isBest ? 'rgb(220, 38, 38)' : 'rgba(220, 38, 38, 0.4)'
    ),
    borderWidth: 2,
    borderRadius: 12,
    borderSkipped: false as const,
  }],
};

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleFont: { family: 'Onest, sans-serif', size: 13, weight: 'bold' },
      bodyFont: { family: 'Onest, sans-serif', size: 12 },
      padding: 16,
      cornerRadius: 12,
      callbacks: {
        label: (ctx) => {
          const month = reportData.monthlyPerformance[ctx.dataIndex];
          return [
            ` ${month.views.toLocaleString('pt-BR')} views`,
            ` ${month.comments} comentarios`,
            ` Media: ${month.avgViews.toLocaleString('pt-BR')} views/video`,
          ];
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.04)' },
      border: { display: false },
      ticks: {
        font: { family: 'Onest, sans-serif', size: 11 },
        callback: (val) => {
          const n = Number(val);
          return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : val;
        },
      },
    },
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { family: 'Onest, sans-serif', size: 11, weight: 'bold' as const },
      },
    },
  },
};

export default function BreadKingReport() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-800 font-sans pb-32">
      {/* HEADER EXECUTIVO */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50 h-24">
        <div className="max-w-6xl mx-auto px-8 h-full flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none">BREAD KING</h1>
            <span className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">Londrina &bull; PR</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relatorio Consolidado</p>
              <p className="text-xs font-bold text-gray-900 italic">{reportData.header.period}</p>
            </div>
            <div className="h-10 w-px bg-gray-100"></div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-light text-gray-400">by</span>
              <span className="text-sm font-black tracking-tighter">cr<span className="text-red-600">IA</span>dores</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 pt-20 space-y-24">
        {/* HERO */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-red-600 mb-6">
              <Award size={12} /> Dossie de Atividades Digitais
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">
              Estrategia &amp;<br />
              <span className="text-gray-300">Entrega.</span>
            </h2>
            <p className="mt-10 text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
              Plano de marketing integrado 360&deg; desenvolvido para a Bread King Londrina.
            </p>
          </div>
        </section>

        {/* OS GRANDES NUMEROS */}
        <section>
          <SectionTitle title="Os Grandes Numeros" icon={TrendingUp} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {reportData.kpis.map((kpi, i) => (
              <AppleCard key={i} className="group">
                <div className="flex items-center gap-4 text-gray-300 group-hover:text-red-600 transition-colors mb-4">
                  <kpi.icon size={20} />
                  <div className="h-px bg-gray-100 flex-grow"></div>
                </div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1">{kpi.value}</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase italic">{kpi.sub}</p>
              </AppleCard>
            ))}
          </div>
        </section>

        {/* PILARES */}
        <section>
          <SectionTitle title="Pilares Estrategicos" icon={Zap} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportData.pillars.map(p => (
              <AppleCard key={p.id} className="relative group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <p.icon size={100} />
                </div>
                <h3 className="text-xs font-black text-gray-300 mb-6 uppercase tracking-widest">Pilar 0{p.id}</h3>
                <h4 className="text-sm font-bold text-gray-900 mb-3">{p.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{p.desc}</p>
              </AppleCard>
            ))}
          </div>
        </section>

        {/* GRANDES INICIATIVAS — TIMELINE */}
        <section>
          <SectionTitle title="Grandes Iniciativas" icon={Target} />
          <WhyMatters>
            Cada mes e uma <strong>operacao estrategica completa</strong>: definicao de temas, briefing de influenciadores, producao de conteudo, acompanhamento de metricas e ajustes em tempo real. Aqui estao as 5 grandes iniciativas executadas para a Bread King Londrina.
          </WhyMatters>

          {/* Timeline vertical */}
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gray-200 hidden md:block"></div>

            <div className="space-y-8">
              {reportData.evolution.map((ev, i) => {
                const num = reportData.evolution.length - i;
                return (
                  <div key={i} className="relative">
                    {/* Dot na timeline */}
                    <div className={`absolute left-4 md:left-6 top-10 w-4 h-4 rounded-full border-2 hidden md:flex items-center justify-center z-10 ${
                      ev.metrics?.highlight ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'
                    }`}>
                      {ev.metrics?.highlight && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                    </div>

                    <div className="md:ml-16">
                      <AppleCard>
                        {/* Header da iniciativa */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${
                                ev.metrics?.highlight ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {String(num).padStart(2, '0')}
                              </span>
                              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{ev.month}</p>
                              {ev.metrics?.highlight && (
                                <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase border border-red-100">
                                  {ev.metrics.highlight}
                                </span>
                              )}
                              {ev.metrics?.isPartial && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase border border-amber-100">
                                  Em andamento
                                </span>
                              )}
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-1">{ev.subtitle}</h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{ev.initiative}</p>
                          </div>
                          {/* Mini metrics no canto */}
                          {ev.metrics && (
                            <div className="flex gap-4 md:gap-6 shrink-0">
                              <div className="text-center">
                                <p className="text-lg font-black text-gray-900">{formatNumber(ev.metrics.views)}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Views</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-black text-gray-900">{ev.metrics.comments}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Comments</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-black text-gray-900">{ev.metrics.posts}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Posts</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Narrativa */}
                        <p className="text-sm text-gray-600 leading-relaxed font-medium mb-6">{ev.narrative}</p>

                        {/* Tags + stats */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                          {ev.details.map((d, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-100">
                              {d}
                            </span>
                          ))}
                          <span className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-400 border border-gray-100 italic">
                            {ev.stats}
                          </span>
                        </div>
                      </AppleCard>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SOCIAL MEDIA EXECUTION */}
        <section>
          <SectionTitle title="Execucao de Social Media" icon={PlayCircle} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <WhyMatters>
                A gestao profissional transforma a presenca digital. Para a Bread King, isso significa consistencia de marca, identidade visual alinhada e um calendario baseado em dados para awareness e conversao.
              </WhyMatters>
              <div className="grid grid-cols-2 gap-4">
                <AppleCard className="!bg-slate-900 !text-white !border-none !shadow-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total de Posts</p>
                  <p className="text-4xl font-black text-white">85</p>
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-2">56 Videos &bull; 25 Fotos &bull; 4 Carrosseis</p>
                </AppleCard>
                <AppleCard className="!bg-slate-900 !text-white !border-none !shadow-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Views Totais</p>
                  <p className="text-4xl font-black text-white">80.6K</p>
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-2">Media 1.4K por Video</p>
                </AppleCard>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-white p-10 rounded-[48px] border border-gray-100">
              <h4 className="text-xl font-bold mb-4 tracking-tight">Presenca Ininterrupta</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Com <strong>85 publicacoes em 5 meses</strong>, a Bread King manteve uma media de 17 posts/mes. Os <strong>56 Reels</strong> geraram mais de 80 mil visualizacoes organicas, comprovando que a estrategia de video e o principal motor de alcance da marca.
              </p>
              <div className="mt-8 flex gap-3">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Clapperboard size={20} /></div>
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Play size={20} /></div>
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Eye size={20} /></div>
              </div>
            </div>
          </div>
        </section>

        {/* PERFORMANCE INSTAGRAM — BAR CHART */}
        <section>
          <SectionTitle title="Performance Instagram" icon={BarChart3} />
          <WhyMatters>
            Dados reais de performance comprovam o <strong>retorno do investimento</strong>. Com 80.625 visualizacoes organicas em 5 meses, o perfil da Bread King saiu de 277 views/video para um pico de 3.936 views/video em janeiro — um crescimento de mais de 1.300%.
          </WhyMatters>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Chart */}
            <div className="lg:col-span-3">
              <AppleCard>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
                  Visualizacoes Mensais
                </p>
                <div className="h-80">
                  <Bar data={chartData} options={chartOptions} />
                </div>
                <p className="text-[10px] text-gray-300 mt-4 italic">
                  * Marco 2026: dados parciais (ate 09/03)
                </p>
              </AppleCard>
            </div>
            {/* Stat Cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <AppleCard className="!bg-slate-900 !border-none !shadow-xl flex-1">
                <div className="flex items-center gap-3 text-red-500 mb-3">
                  <Flame size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Melhor Mes</span>
                </div>
                <p className="text-4xl font-black text-white">55.1K</p>
                <p className="text-xs font-bold text-red-500 mt-1">Janeiro 2026</p>
                <p className="text-[10px] text-slate-500 mt-2">22 posts &bull; 248 comentarios</p>
              </AppleCard>
              <AppleCard className="flex-1">
                <div className="flex items-center gap-3 text-green-600 mb-3">
                  <ArrowUpRight size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Crescimento</span>
                </div>
                <p className="text-4xl font-black text-gray-900">+1.321%</p>
                <p className="text-xs font-bold text-green-600 mt-1">Nov &rarr; Jan (views/video)</p>
              </AppleCard>
              <AppleCard className="flex-1">
                <div className="flex items-center gap-3 text-red-600 mb-3">
                  <MessageCircle size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Engajamento</span>
                </div>
                <p className="text-4xl font-black text-gray-900">7.7</p>
                <p className="text-xs font-bold text-gray-400 mt-1">Comentarios / Post</p>
              </AppleCard>
            </div>
          </div>
        </section>

        {/* DESTAQUES DE CONTEUDO — TOP VIDEOS */}
        <section>
          <SectionTitle title="Destaques de Conteudo" icon={Crown} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* HERO card — Top 1 */}
            <AppleCard className="md:col-span-2 lg:col-span-1 !bg-slate-900 !border-none !shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-30 -mr-8 -mt-8"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Crown size={16} className="text-red-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Top 1 Performance</span>
                </div>
                <p className="text-5xl font-black text-white leading-none">40K</p>
                <p className="text-xs font-bold text-red-500 mt-2 uppercase">Visualizacoes</p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-sm font-bold text-white">{reportData.topVideos[0].influencer}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{reportData.topVideos[0].theme} &bull; {reportData.topVideos[0].date}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{reportData.topVideos[0].comments} comentarios</p>
                </div>
                <a href={reportData.topVideos[0].link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-all border border-white/10">
                  Ver no Instagram <ExternalLink size={12} />
                </a>
              </div>
            </AppleCard>

            {/* Cards #2-5 */}
            {reportData.topVideos.slice(1, 5).map((video, i) => (
              <AppleCard key={i}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    #{i + 2}
                  </span>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Eye size={14} />
                    <span className="text-xs font-bold">{formatNumber(video.views)}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{video.theme}</h4>
                {video.influencer && (
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">{video.influencer}</p>
                )}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-gray-400">
                    <MessageCircle size={12} />
                    <span className="text-[10px] font-bold">{video.comments}</span>
                  </div>
                  <span className="text-[10px] text-gray-300">{video.date}</span>
                  <a href={video.link} target="_blank" rel="noreferrer" className="ml-auto text-red-600 hover:text-red-700 transition-colors">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </AppleCard>
            ))}
          </div>
        </section>

        {/* MARKETING DE INFLUENCIA */}
        <section>
          <SectionTitle title="Marketing de Influencia" icon={Users} />
          <WhyMatters>
            E o diferencial competitivo mais poderoso. <strong>Autenticidade local:</strong> os criadores conhecem os habitos de Londrina e falam a mesma lingua do publico, gerando identificacao real e alcance organico qualificado.
          </WhyMatters>
          <AppleCard noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                    <th className="px-8 py-5">Influenciador</th>
                    <th className="px-6 py-5">Campanha / Acao</th>
                    <th className="px-6 py-5 text-right">Views</th>
                    <th className="px-6 py-5 text-right">Comentarios</th>
                    <th className="px-8 py-5 text-right">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData.influencers.map((inf) => (
                    <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 font-black text-gray-900 whitespace-nowrap">
                        {inf.name}
                        {inf.views && inf.views >= 2000 && (
                          <Flame size={12} className="inline ml-1.5 text-red-500 -mt-0.5" />
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{inf.campaign}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {inf.views ? (
                          <span className={`text-sm font-black ${inf.views >= 2000 ? 'text-gray-900' : 'text-gray-600'}`}>
                            {formatNumber(inf.views)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {inf.comments !== undefined ? (
                          <span className="text-sm font-bold text-gray-500">{inf.comments}</span>
                        ) : (
                          <span className="text-[10px] text-gray-300">&mdash;</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {inf.status ? (
                          <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase border border-amber-100">{inf.status}</span>
                        ) : (
                          <a href={inf.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all border border-red-100">
                            LINK <ExternalLink size={12} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-100">
                    <td className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest" colSpan={2}>
                      Total (14 influenciadores com dados)
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-gray-900">56.9K</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-bold text-gray-600">342</span>
                    </td>
                    <td className="px-8 py-5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </AppleCard>
        </section>

        {/* VALOR INTEGRADO */}
        <section className="bg-slate-900 rounded-[64px] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full blur-[150px] opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h3 className="text-4xl font-black italic tracking-tight mb-8">O Ciclo Virtuoso <br /><span className="text-red-600 font-light">Criadores Digital</span></h3>
              <p className="text-slate-400 font-medium leading-relaxed text-sm mb-12">
                O diferencial nao e apenas a execucao individual, mas a <strong className="text-white">integracao estrategica</strong>. Cada real investido tem o maior retorno possivel porque a acao e planejada, executada e otimizada continuamente.
              </p>
              <div className="space-y-6">
                {['Planejamento -> Define Temas', 'Social Media -> Executa o Diario', 'Influencia -> Amplifica o Alcance', 'Mentoria -> Ajusta o Caminho'].map((text, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-red-600 border border-white/10 group-hover:scale-110 transition-all text-sm font-bold">{i + 1}</div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-200">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="p-10 bg-white/5 backdrop-blur-md rounded-[48px] border border-white/10">
                <TrendingUp size={48} className="text-red-600 mb-6" />
                <h4 className="text-xl font-bold mb-4">Resultados em Numeros</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Em 5 meses de operacao integrada, a Bread King Londrina alcancou mais de 80 mil visualizacoes organicas, ativou 18 influenciadores locais e publicou 85 conteudos estrategicos — tudo com gestao profissional e acompanhamento semanal.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                  <div>
                    <p className="text-2xl font-black text-white">80.6K</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">18</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Creators</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">85</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Posts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center space-y-4 pt-10">
          <div className="flex justify-center items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">Fim do Relatorio &bull; crIAdores Digital &copy; 2026</p>
        </footer>
      </main>
    </div>
  );
}
