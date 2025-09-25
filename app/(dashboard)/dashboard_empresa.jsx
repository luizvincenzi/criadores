import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MapPin, Users, TrendingUp, Target, Calendar, Star, Zap, Users2, Megaphone, ThumbsUp, CheckCircle, Trophy, Sparkles, Building, Briefcase, Gem, Flame, Bike, Shield, HandHeart, Handshake, Clapperboard, Share2, BarChart4, ClipboardCheck, MicVocal, AlertTriangle, XCircle, CircleDollarSign, Package, Tag, History, LineChart, Globe2 } from 'lucide-react';

// =============================
// DASHBOARD ESTRATÉGICO (NEUTRO) — COM HISTÓRICO TRIMESTRAL
// =============================
// Diretrizes visuais: cores neutras, sem gradientes, cards brancos com borda cinza
// Fundo: #f5f5f5 (usar Tailwind com cor arbitrária)

const neutralFills = ['#e5e7eb', '#d1d5db', '#9ca3af']; // cinzas para gráficos

const reportData = {
  company: {
    name: "Pantanos — Restaurante da Família (Jd. Igapó)",
    logoIcon: Flame,
    address: "R. Bélgica, 1221 - Jardim Igapó, Londrina - PR, 86046-280",
    googleRating: { score: "4.5", reviews: "216+" }, // fallback
    reputation: { status: "O Restaurante da Família na Zona Sul", icon: HandHeart, color: 'text-gray-600' },
    tags: ["Restaurante Familiar", "Música ao Vivo", "Playground", "Comida Caseira", "Jardim Igapó"],
  },

  // Grandes Números (Presença Digital) — a UI lerá os valores do snapshot selecionado
  digitalPresence: {
    title: 'Presença Digital',
    metrics: [
      { key: 'google', name: 'Google Reviews', icon: Star, fmt: (v)=> v ? `${v.rating.toFixed(1)}/5` : '—', subfmt: (v)=> v ? `${v.reviews} avaliações` : '—' },
      { key: 'tripadvisor', name: 'Tripadvisor', icon: Globe2, fmt: (v)=> v ? `${v.rating.toFixed(1)}/5` : '—', subfmt: (v)=> v?.rank ? `Top ${v.rank} na região` : '—' },
      { key: 'instagram', name: 'Instagram', icon: Users2, fmt: (v)=> v ? v.toLocaleString('pt-BR') : '—', subfmt: ()=>'seguidores' },
      { key: 'facebook', name: 'Facebook', icon: Users, fmt: (v)=> v ? v.toLocaleString('pt-BR') : '—', subfmt: ()=>'seguidores' },
      { key: 'tiktok', name: 'TikTok', icon: Users, fmt: (v)=> v ? v.toLocaleString('pt-BR') : '—', subfmt: (v)=> v? 'seguidores' : 'não habilitado' },
    ],
  },

  marketDiagnosis: {
    title: "Diagnóstico de Mercado 360°",
    focusSegmentation: {
      title: "Segmentação de Foco Estratégico",
      methodology: "Análise baseada no novo posicionamento, priorizando as frentes de maior valor para a marca.",
      data: [
        { name: 'Experiência Fim de Semana (Música & Família)', value: 50, fill: neutralFills[0] },
        { name: 'Rituais de Meio de Semana', value: 40, fill: neutralFills[1] },
        { name: 'Delivery & Takeaway Tático', value: 10, fill: neutralFills[2] },
      ],
    },
    sentiment: {
      title: "Análise de Sentimento e Reputação",
      validation: "Avaliações elogiam ambiente, música e atendimento — valor percebido está na experiência completa.",
      challenge: "Comunicar claramente os rituais semanais e consolidar a imagem de 'restaurante de destino' da Zona Sul."
    },
    productPortfolio: {
      title: "Portfólio de Produtos",
      strongPoints: "Cardápio abrangente ('para todos'); porções grandes ideais para compartilhar.",
      opportunities: "Elevar heróis por ritual (ex.: Baguete na quarta); combos com foco em ticket e frequência."
    }
  },

  analysis: {
    mainTarget: "Famílias da Zona Sul que buscam conveniência, música ao vivo (sex/sáb) e almoço de semana honesto em ambiente com playground.",
    positioningStatement: "O restaurante da família da Zona Sul, com música ao vivo nas sextas e sábados, playground para as crianças e comida boa para todos os gostos.",
    competitiveAdvantage: {
      title: "Tríade de Diferenciação",
      points: [
        { icon: HandHeart, title: "Família Primeiro", description: "Playground e cardápio para todas as idades." },
        { icon: MicVocal, title: "Música ao Vivo Curada", description: "Dono-artista como host, agenda de qualidade." },
        { icon: MapPin, title: "Proximidade de Bairro", description: "Preferido da Zona Sul; evita deslocamentos." }
      ]
    },
    tacticalFronts: {
      title: "3 Frentes Táticas de Crescimento",
      points: [
        { icon: TrendingUp, title: "Consolidar o Pico (Sex/Sáb)", description: "Agenda pública + cover simbólico (R$3–R$7)." },
        { icon: Calendar, title: "Rituais de Semana", description: "Terça da Família / Quarta do Baguete / Quinta do Playground." },
        { icon: Bike, title: "Delivery Inteligente", description: "Campanhas hiperlocais focadas em campeões de venda." }
      ]
    }
  },

  okrs: {
    title: "OKRs Trimestrais",
    validation: {
      title: "Indicadores de Validação",
      metrics: [
        "NPS por turno/dia",
        "Ocupação em sex/sáb",
        "Ticket médio por mesa",
        "Itens mais vendidos por categoria"
      ]
    },
    objectives: [
      { icon: Target, title: "Foco", description: "1 posicionamento claro + 3 rituais semanais." },
      { icon: Shield, title: "Vizinhança", description: "0 ocorrências mensais de ruído." },
      { icon: BarChart4, title: "Música Sustentável", description: "Ponto de equilíbrio (≥0 no P&L) via cover + margem." }
    ]
  },

  productStrategy: {
    title: "Cardápio & Heróis de Produto",
    points: [
      { icon: Users, title: "Família & Porções", description: "Dar visibilidade à seção com maior margem." },
      { icon: Trophy, title: "Herói de Quarta: Baguete", description: "Storytelling + preço-âncora." },
      { icon: Sparkles, title: "Combo Kids Friendly", description: "Mini porção + suco como decisão fácil." },
    ]
  },

  contentStrategy: {
    title: "Programa de Conteúdo",
    weekendScript: {
      title: "Roteiro (Sex/Sáb)",
      steps: [
        "Recepção do proprietário à família",
        "Cortes da música + pratos chegando",
        "Playground e clima do salão",
        "CTA: 'Vem com a família — música ao vivo na Zona Sul'"
      ]
    },
    midweekStrategy: {
      title: "Midweek",
      description: "Vídeos curtos divulgando rituais (seg–qui) com criadores locais."
    }
  },

  riskManagement: {
    title: "Gestão de Risco (Vizinhança & Som)",
    plans: [
      { icon: Zap, title: "Plano Técnico", description: "Posição das caixas, medição de dB, limite 22h, 'som ambiente'." },
      { icon: Handshake, title: "Plano Relacional", description: "Visitar vizinhos, criar 'telefone de paz' em noites de show." },
      { icon: Gem, title: "Plano de Receita", description: "Cover simbólico + precificação de porções para zerar custo." },
    ],
    metric: "Meta: 0 chamados/reclamações por mês."
  },

  // Sumário, 4Ps, Porter, KPIs, Matriz de Ações, Calendário (mantidos)
  executiveSummary: {
    title: "Sumário Executivo",
    green: ["Experiência família + música validada", "Atendimento e ambiente elogiados", "Cardápio amplo e aderente"],
    yellow: ["Rituais ainda pouco comunicados", "Delivery com baixo share", "Margens por categoria irregulares"],
    red: ["Sem política clara de preços", "Calendário público incompleto", "Dependência de poucos heróis"]
  },

  fourPs: {
    title: "4 Ps do Marketing",
    items: [
      { key: 'produto', p: 'Produto', icon: Package, status: 'green', strengths: ["Cardápio família", "Porções para compartilhar", "Playground"], quickWins: ["Destacar 3 heróis por ritual", "Padronizar ficha técnica + foto"] },
      { key: 'preco', p: 'Preço', icon: CircleDollarSign, status: 'yellow', strengths: ["Boa percepção nas porções"], quickWins: ["Preço-âncora por categoria", "Combo família + cover incluso"] },
      { key: 'praca', p: 'Praça', icon: MapPin, status: 'green', strengths: ["Densidade familiar Zona Sul", "Acesso fácil"], quickWins: ["Raio 2 km para mídia", "Placas com QR do cardápio"] },
      { key: 'promocao', p: 'Promoção', icon: Megaphone, status: 'yellow', strengths: ["Música gera conteúdo"], quickWins: ["Calendário mensal com CTAs", "Parcerias com criadores do bairro"] },
    ]
  },

  portersForces: {
    title: "5 Forças de Porter",
    forces: [
      { key: 'rivalidade', name: 'Rivalidade', status: 'yellow', score: 6, note: 'Vários concorrentes com música ao vivo.' },
      { key: 'entrantes', name: 'Novos entrantes', status: 'yellow', score: 5, note: 'Barreiras moderadas; ponto e acústica importam.' },
      { key: 'fornecedores', name: 'Fornecedores', status: 'green', score: 4, note: 'Mix local diversificado.' },
      { key: 'clientes', name: 'Clientes', status: 'yellow', score: 6, note: 'Sensíveis a preço em dias sem música.' },
      { key: 'substitutos', name: 'Substitutos', status: 'red', score: 7, note: 'Delivery/streaming competem por atenção.' },
    ]
  },

  kpis: {
    title: 'KPIs Críticos',
    list: [
      { key: 'ocupacao', name: 'Ocupação Sex/Sáb', unit: '%', target: '≥ 75%' },
      { key: 'ticket', name: 'Ticket Médio', unit: 'R$', target: 'R$ 68' },
      { key: 'margemPorcoes', name: 'Margem Porções', unit: '%', target: '≥ 65%' },
      { key: 'nps', name: 'NPS Mensal', unit: '', target: '≥ 75' },
      { key: 'ruido', name: 'Reclamações de Ruído', unit: '/mês', target: '0/mês' },
    ]
  },

  actionMatrix: {
    title: 'Matriz de Ações — 90 Dias',
    columns: [
      { name: 'Agora (0–30d)', items: [ 'Calendário musical mensal', '3 combos família (porção + bebida + kids)', 'NPS por QR em cada mesa' ]},
      { name: 'Próximas (30–60d)', items: [ 'A/B de preço-âncora', '5 microinfluenciadores Zona Sul', 'Mapear custo/margem por prato' ]},
      { name: 'Explorar (60–90d)', items: [ 'Clube da família (piloto)', 'Parcerias escolares kids', 'Soluções acústicas adicionais' ]},
    ]
  },

  promoCalendar: {
    title: 'Calendário Promocional (8 Semanas)',
    weeks: [
      { week: 'Semana 1', theme: 'Abertura do mês + Agenda', cta: 'Salve o calendário' },
      { week: 'Semana 2', theme: 'Terça da Família', cta: 'Combo família — leve 3, pague 2' },
      { week: 'Semana 3', theme: 'Quarta do Baguete', cta: 'Baguete herói + refri' },
      { week: 'Semana 4', theme: 'Quinta do Playground', cta: 'Criança por R$ 1' },
      { week: 'Semana 5', theme: 'Festival de Porções', cta: '2 porções + 1 kids' },
      { week: 'Semana 6', theme: 'Noite do Dono-Host', cta: 'Foto + sorteio' },
      { week: 'Semana 7', theme: 'Vizinhança Amiga', cta: 'Desconto raio 2 km' },
      { week: 'Semana 8', theme: 'Família no Domingo', cta: 'Almoço + sobremesa cortesia' },
    ]
  },

  // HISTÓRICO TRIMESTRAL — todos os cards passam a ler daqui
  history: {
    title: 'Histórico do Diagnóstico',
    snapshots: [
      {
        id: '2025-Q2', label: '2º Tri/2025',
        digital: { google: { rating: 4.4, reviews: 180 }, tripadvisor: { rating: 4.2, rank: 28 }, instagram: 7200, facebook: 4900, tiktok: 0 },
        kpis: { ocupacao: 58, ticket: 55, margemPorcoes: 59, nps: 76, ruido: 2 },
        fourPs: { produto: 'yellow', preco: 'yellow', praca: 'green', promocao: 'yellow' },
        porter: { rivalidade: { score: 7, status: 'yellow' }, entrantes:{ score:6, status:'yellow' }, fornecedores:{ score:4, status:'green' }, clientes:{ score:7, status:'yellow' }, substitutos:{ score:7, status:'red' } },
        notes: 'Pré-rituais'
      },
      {
        id: '2025-Q3', label: '3º Tri/2025',
        digital: { google: { rating: 4.5, reviews: 216 }, tripadvisor: { rating: 4.3, rank: 20 }, instagram: 8120, facebook: 5430, tiktok: 0 },
        kpis: { ocupacao: 66, ticket: 59, margemPorcoes: 61, nps: 79, ruido: 1 },
        fourPs: { produto: 'green', preco: 'yellow', praca: 'green', promocao: 'yellow' },
        porter: { rivalidade: { score: 6, status: 'yellow' }, entrantes:{ score:5, status:'yellow' }, fornecedores:{ score:4, status:'green' }, clientes:{ score:6, status:'yellow' }, substitutos:{ score:7, status:'red' } },
        notes: 'Roteiro de conteúdo'
      },
      {
        id: '2025-Q4', label: '4º Tri/2025',
        digital: { google: { rating: 4.6, reviews: 260 }, tripadvisor: { rating: 4.4, rank: 15 }, instagram: 9150, facebook: 5850, tiktok: 1200 },
        kpis: { ocupacao: 72, ticket: 63, margemPorcoes: 64, nps: 82, ruido: 0 },
        fourPs: { produto: 'green', preco: 'yellow', praca: 'green', promocao: 'green' },
        porter: { rivalidade: { score: 6, status: 'yellow' }, entrantes:{ score:5, status:'yellow' }, fornecedores:{ score:4, status:'green' }, clientes:{ score:5, status:'yellow' }, substitutos:{ score:6, status:'yellow' } },
        notes: 'Cover simbólico + agenda pública'
      }
    ]
  },

  reportDate: new Date('2025-09-25').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
};

// ----------------
// HELPERS
// ----------------
const statusColor = (status) => {
  switch (status) {
    case 'green': return 'text-green-700 bg-green-50 border-green-200';
    case 'yellow': return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'red': return 'text-red-700 bg-red-50 border-red-200';
    default: return 'text-gray-700 bg-gray-50 border-gray-200';
  }
};

const statusDot = (status) => {
  const base = 'h-2.5 w-2.5 rounded-full mr-2';
  const color = status === 'green' ? 'bg-green-500' : status === 'yellow' ? 'bg-amber-500' : 'bg-red-500';
  return <span className={`${base} ${color}`}/>;
};

const Card = ({ children }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200">{children}</div>
);

const Section = ({ title, icon: Icon, children, actions }) => (
  <Card>
    <div className="border-b px-6 py-4 bg-gray-50 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-gray-700 flex items-center"><Icon className="h-4 w-4 text-gray-500 mr-2" />{title}</h2>
      {actions}
    </div>
    <div className="p-6">{children}</div>
  </Card>
);

// ----------------
// COMPONENTE
// ----------------
function GenericMarketingReport({ data }) {
  const { company, digitalPresence, marketDiagnosis, analysis, okrs, productStrategy, contentStrategy, riskManagement, executiveSummary, fourPs, portersForces, kpis, actionMatrix, promoCalendar, history, reportDate } = data;
  const CompanyLogo = company.logoIcon || Building;
  const ReputationIcon = company.reputation.icon || Building;

  // Histórico trimestral: seleção e deltas globais
  const [snapshotId, setSnapshotId] = useState(history.snapshots[history.snapshots.length - 1].id);
  const selected = useMemo(() => history.snapshots.find(s => s.id === snapshotId), [history.snapshots, snapshotId]);
  const prev = useMemo(() => {
    const idx = history.snapshots.findIndex(s => s.id === snapshotId);
    return idx > 0 ? history.snapshots[idx - 1] : null;
  }, [history.snapshots, snapshotId]);

  const deltaNumber = (curr, old) => {
    if (curr == null || old == null) return null;
    const d = curr - old; if (d === 0) return 0; return Number(d.toFixed(1));
  };
  const DeltaBadge = ({ value }) => {
    if (value === null || value === undefined) return <span className="text-xs text-gray-400">—</span>;
    if (value === 0) return <span className="text-xs text-gray-500">0</span>;
    const positive = value > 0;
    return (
      <span className={`text-xs ${positive ? 'text-green-700' : 'text-red-700'}`}>{positive? '+' : ''}{value}</span>
    );
  };

  // 4Ps status current from snapshot
  const fourPsStatusByKey = (key) => selected?.fourPs?.[key] || 'gray';
  // Porter from snapshot
  const porterCurrent = (key) => selected?.porter?.[key] || { score: 0, status: 'gray' };

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      {/* Topbar minimal integrado ao Dashboard existente */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg border border-gray-200"><CompanyLogo className="h-5 w-5 text-gray-700" /></div>
            <h1 className="text-base font-semibold text-gray-800">Dashboard</h1>
            <span className="hidden sm:inline text-xs text-gray-500">{company.name}</span>
          </div>
          {/* Seletor de Período Global */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Período:</label>
            <select value={snapshotId} onChange={(e)=>setSnapshotId(e.target.value)} className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700">
              {history.snapshots.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        {/* HERO COMPACTO */}
        <Card>
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg border border-gray-200 p-2"><ReputationIcon className={`h-5 w-5 text-gray-700`} /></div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{company.name}</div>
                  <div className="text-xs text-gray-500 flex items-center"><MapPin className="h-3.5 w-3.5 mr-1"/>{company.address}</div>
                </div>
              </div>
              {/* Google rating do snapshot atual */}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-1"/>
                  <b>{selected?.digital?.google?.rating?.toFixed(1) ?? company.googleRating.score}</b>
                  <span className="text-gray-500 ml-1">({selected?.digital?.google?.reviews ?? company.googleRating.reviews})</span>
                </div>
                <div className="hidden md:flex flex-wrap gap-1">
                  {company.tags.slice(0,4).map((t,i)=>(<span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-gray-100 text-gray-600 border border-gray-200">{t}</span>))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* GRANDES NÚMEROS (agora com histórico trimestral e delta) */}
        <Section title={digitalPresence.title} icon={LineChart}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {digitalPresence.metrics.map((m, i) => {
              const Icon = m.icon || Users;
              const currentVal = selected?.digital?.[m.key];
              const prevVal = prev?.digital?.[m.key];
              const toNumber = (v) => {
                if (!v) return null;
                if (typeof v === 'number') return v;
                if (typeof v === 'object' && 'rating' in v) return v.rating;
                return null;
              };
              const d = deltaNumber(toNumber(currentVal), toNumber(prevVal));
              return (
                <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white">
                  <div className="flex items-center text-gray-600 text-xs mb-1"><Icon className="h-3.5 w-3.5 mr-1"/>{m.name}</div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{m.fmt(currentVal)}</div>
                      <div className="text-[11px] text-gray-500">{m.subfmt(currentVal)}</div>
                    </div>
                    <DeltaBadge value={d}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* EXECUTIVE SUMMARY (NEUTRO) */}
        <Section title={executiveSummary.title} icon={BarChart4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`border rounded-lg p-4 ${statusColor('green')}`}>
              <div className={`flex items-center text-green-700 font-semibold mb-2`}><CheckCircle className="h-4 w-4 mr-2"/>Verde</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">{executiveSummary.green.map((i,idx)=> <li key={idx}>{i}</li>)}</ul>
            </div>
            <div className={`border rounded-lg p-4 ${statusColor('yellow')}`}>
              <div className={`flex items-center text-amber-700 font-semibold mb-2`}><AlertTriangle className="h-4 w-4 mr-2"/>Amarelo</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">{executiveSummary.yellow.map((i,idx)=> <li key={idx}>{i}</li>)}</ul>
            </div>
            <div className={`border rounded-lg p-4 ${statusColor('red')}`}>
              <div className={`flex items-center text-red-700 font-semibold mb-2`}><XCircle className="h-4 w-4 mr-2"/>Vermelho</div>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">{executiveSummary.red.map((i,idx)=> <li key={idx}>{i}</li>)}</ul>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">Revisão trimestral — use o seletor de período no topo para comparar evoluções.</p>
        </Section>

        {/* DIAGNÓSTICO DE MERCADO (GRÁFICO NEUTRO) */}
        <Section title={marketDiagnosis.title} icon={BarChart4}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center"><Target className="h-4 w-4 text-gray-500 mr-2" />{marketDiagnosis.focusSegmentation.title}</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={marketDiagnosis.focusSegmentation.data} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {marketDiagnosis.focusSegmentation.data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center"><b>Metodologia:</b> {marketDiagnosis.focusSegmentation.methodology}</p>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <h4 className="font-semibold text-sm text-gray-800 mb-1">Pontos Fortes (Validação)</h4>
                <p className="text-gray-600 text-sm">{marketDiagnosis.sentiment.validation}</p>
              </div>
              <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <h4 className="font-semibold text-sm text-gray-800 mb-1">Desafio Estratégico</h4>
                <p className="text-gray-600 text-sm">{marketDiagnosis.sentiment.challenge}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center"><Sparkles className="h-4 w-4 text-gray-500 mr-2" />{marketDiagnosis.productPortfolio.title}</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li><b>Pontos Fortes:</b> {marketDiagnosis.productPortfolio.strongPoints}</li>
              <li><b>Oportunidades:</b> {marketDiagnosis.productPortfolio.opportunities}</li>
            </ul>
          </div>
        </Section>

        {/* 4 Ps — lê status do snapshot e exibe delta textual */}
        <Section title={fourPs.title} icon={Tag}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fourPs.items.map((item, idx) => {
              const Icon = item.icon || Tag;
              const curr = fourPsStatusByKey(item.key);
              const prevStatus = prev?.fourPs?.[item.key] || null;
              const changed = prevStatus && prevStatus !== curr;
              return (
                <div key={idx} className={`border rounded-lg p-4 ${statusColor(curr)}`}>
                  <div className="flex items-center mb-2">
                    {statusDot(curr)}
                    <Icon className="h-4 w-4 mr-2 text-gray-600"/>
                    <h4 className="font-semibold text-gray-800">{item.p}</h4>
                    {changed && <span className="ml-auto text-[11px] text-gray-600">{prevStatus} → <b>{curr}</b></span>}
                  </div>
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1">Pontos fortes</p>
                    <ul className="list-disc list-inside space-y-1">{item.strengths.map((s,i)=> <li key={i}>{s}</li>)}</ul>
                    <p className="font-semibold mt-3 mb-1">Quick wins</p>
                    <ul className="list-disc list-inside space-y-1">{item.quickWins.map((s,i)=> <li key={i}>{s}</li>)}</ul>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* POSICIONAMENTO */}
        <Section title="Posicionamento e Vantagem Competitiva" icon={Gem}>
          <div className="mb-6 rounded-lg p-4 border border-gray-200 bg-white">
            <h3 className="font-medium text-center text-gray-800">"{analysis.positioningStatement}"</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {analysis.competitiveAdvantage.points.map((item, index) => {
              const Icon = item.icon || Gem;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2"><Icon className="h-5 w-5 text-gray-600 mr-2" /><h4 className="font-semibold text-gray-800">{item.title}</h4></div>
                  <p className="text-sm text-gray-600 pl-7">{item.description}</p>
                </div>
              )
            })}
          </div>
        </Section>

        {/* 5 FORÇAS DE PORTER — valores do snapshot com delta */}
        <Section title={portersForces.title} icon={Briefcase}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {portersForces.forces.map((f, i) => {
              const curr = porterCurrent(f.key);
              const prevVals = prev?.porter?.[f.key] || null;
              const d = prevVals ? deltaNumber(curr.score, prevVals.score) : null;
              return (
                <div key={i} className={`border rounded-lg p-4 ${statusColor(curr.status)}`}>
                  <div className="flex items-center mb-1">{statusDot(curr.status)}<h4 className="font-semibold text-sm text-gray-800">{f.name}</h4></div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div>Nota: <b>{curr.score}/10</b></div>
                    <DeltaBadge value={d}/>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{f.note}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* TÁTICAS */}
        <Section title={analysis.tacticalFronts.title} icon={Share2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analysis.tacticalFronts.points.map((item, index) => {
              const Icon = item.icon || Gem;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2"><Icon className="h-5 w-5 text-gray-600 mr-2" /><h4 className="font-semibold text-gray-800">{item.title}</h4></div>
                  <p className="text-sm text-gray-600 pl-7">{item.description}</p>
                </div>
              )
            })}
          </div>
        </Section>

        {/* KPIs — ler do snapshot e exibir delta */}
        <Section title={kpis.title} icon={BarChart4}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {kpis.list.map((k, i) => {
              const curr = selected?.kpis?.[k.key];
              const old = prev?.kpis?.[k.key] ?? null;
              const d = deltaNumber(curr, old);
              // status automático simples
              const status = (key, value) => {
                if (value == null) return 'gray';
                if (key === 'ruido') return value <= 0 ? 'green' : value <= 1 ? 'yellow' : 'red';
                if (key === 'nps') return value >= 75 ? 'green' : value >= 60 ? 'yellow' : 'red';
                if (key === 'margemPorcoes') return value >= 65 ? 'green' : value >= 55 ? 'yellow' : 'red';
                if (key === 'ticket') return value >= 68 ? 'green' : value >= 60 ? 'yellow' : 'red';
                if (key === 'ocupacao') return value >= 75 ? 'green' : value >= 60 ? 'yellow' : 'red';
                return 'gray';
              };
              const st = status(k.key, curr);
              return (
                <div key={i} className={`rounded-xl border p-4 ${statusColor(st)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-800">{k.name}</h4>
                    {st === 'green' ? <CheckCircle className="h-4 w-4 text-green-600"/> : st === 'yellow' ? <AlertTriangle className="h-4 w-4 text-amber-600"/> : <XCircle className="h-4 w-4 text-red-600"/>}
                  </div>
                  <div className="text-xs text-gray-600">Meta: <b>{k.target}</b></div>
                  <div className="flex items-end justify-between">
                    <div className="text-xs text-gray-600">Atual: <b>{k.unit === 'R$' ? `R$ ${curr ?? '—'}` : curr ?? '—'}{k.unit && k.unit !== 'R$' ? k.unit : ''}</b></div>
                    <DeltaBadge value={d}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* HISTÓRICO AGREGADO (resumo do período) */}
        <Section title={history.title} icon={History}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">Ocupação Sex/Sáb</div>
              <div className="text-xl font-semibold text-gray-800">{selected.kpis.ocupacao}% <span className="text-xs text-gray-500">({prev ? `${deltaNumber(selected.kpis.ocupacao, prev.kpis.ocupacao) >= 0 ? '+' : ''}${deltaNumber(selected.kpis.ocupacao, prev.kpis.ocupacao)}` : '—'})</span></div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">Ticket Médio</div>
              <div className="text-xl font-semibold text-gray-800">R$ {selected.kpis.ticket} <span className="text-xs text-gray-500">({prev ? `${deltaNumber(selected.kpis.ticket, prev.kpis.ticket) >= 0 ? '+' : ''}${deltaNumber(selected.kpis.ticket, prev.kpis.ticket)}` : '—'})</span></div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500 mb-1">NPS</div>
              <div className="text-xl font-semibold text-gray-800">{selected.kpis.nps} <span className="text-xs text-gray-500">({prev ? `${deltaNumber(selected.kpis.nps, prev.kpis.nps) >= 0 ? '+' : ''}${deltaNumber(selected.kpis.nps, prev.kpis.nps)}` : '—'})</span></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-3 flex items-center gap-2">
            <span>Período:</span>
            <select value={snapshotId} onChange={(e)=>setSnapshotId(e.target.value)} className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700">
              {history.snapshots.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <span className="ml-2">Notas: {selected.notes}</span>
          </div>
        </Section>

        {/* CONTEÚDO & PRODUTO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Section title={contentStrategy.title} icon={Clapperboard}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">{contentStrategy.weekendScript.title}</h4>
                  <ul className="list-decimal list-inside text-sm space-y-1 text-gray-600">
                    {contentStrategy.weekendScript.steps.map((s,i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800">{contentStrategy.midweekStrategy.title}</h4>
                  <p className="text-sm text-gray-600">{contentStrategy.midweekStrategy.description}</p>
                </div>
              </div>
            </Section>
          </div>
          <div>
            <Section title={productStrategy.title} icon={Sparkles}>
              <div className="space-y-4">
                {productStrategy.points.map((item, i) => {
                  const Icon = item.icon || Sparkles;
                  return (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-1"><Icon className="h-5 w-5 text-gray-600 mr-2" /><h4 className="font-semibold text-sm text-gray-800">{item.title}</h4></div>
                      <p className="text-xs text-gray-600 pl-7">{item.description}</p>
                    </div>
                  )
                })}
              </div>
            </Section>
          </div>
        </div>

        {/* MATRIZ DE AÇÕES 90 DIAS */}
        <Section title={actionMatrix.title} icon={ClipboardCheck}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionMatrix.columns.map((col, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white border-gray-200">
                <h4 className="font-semibold mb-2 text-gray-800">{col.name}</h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {col.items.map((it, idx) => <li key={idx}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-3">Revisão a cada 90 dias — use snapshots para comparar execução e resultados.</p>
        </Section>

        {/* CALENDÁRIO PROMOCIONAL */}
        <Section title={promoCalendar.title} icon={Calendar}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {promoCalendar.weeks.map((w, i) => (
              <div key={i} className="border rounded-lg p-4 bg-white border-gray-200">
                <div className="flex items-center mb-1"><Calendar className="h-4 w-4 mr-2 text-gray-600"/><h4 className="font-semibold text-sm text-gray-800">{w.week}</h4></div>
                <div className="text-xs text-gray-600">Tema: <b>{w.theme}</b></div>
                <div className="text-xs text-gray-600">CTA: {w.cta}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* RISCO */}
        <Section title={riskManagement.title} icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {riskManagement.plans.map((item, index) => {
              const Icon = item.icon || Shield;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2"><Icon className="h-5 w-5 text-gray-600 mr-2" /><h4 className="font-semibold text-gray-800">{item.title}</h4></div>
                  <p className="text-sm text-gray-600 pl-7">{item.description}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="font-semibold text-gray-800">{riskManagement.metric}</p>
          </div>
        </Section>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return <GenericMarketingReport data={reportData} />;
}
