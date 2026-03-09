'use client';

import React from 'react';
import {
  CheckCircle2, Users, Clapperboard, Calendar,
  ExternalLink, Award, MapPin,
  ChevronRight, Play, Layout, ListChecks,
  Search, ShieldCheck, Sparkles, Instagram,
  PlayCircle, FileText, Target, TrendingUp,
  MessageSquare, Briefcase, Zap, ArrowRight,
  Info, Clock, Megaphone, ChefHat, Eye
} from 'lucide-react';

const reportData = {
  header: {
    title: "Relatorio de Atividades",
    client: "Bread King Londrina",
    period: "Nov 2025 - Mar 2026",
    date: "09 de Marco de 2026",
    preparedBy: "Equipe Criadores Digital"
  },
  kpis: [
    { label: "Frequencia Feed", value: "3 Reels", sub: "Por semana", icon: PlayCircle },
    { label: "Frequencia Stories", value: "2 Stories", sub: "Por dia", icon: Layout },
    { label: "Acompanhamento", value: "Semanal", sub: "Visitas Estrategista", icon: MapPin },
    { label: "Vozes Ativas", value: "18", sub: "Influenciadores", icon: Users },
    { label: "Direcionamento", value: "16", sub: "Temas Criativos", icon: Sparkles },
    { label: "Links Oficiais", value: "16", sub: "Posts Registrados", icon: ExternalLink }
  ],
  pillars: [
    { id: 1, title: "Planejamento Estrategico Mensal", desc: "Definicao de temas, calendario editorial e direcionamento criativo.", icon: Target },
    { id: 2, title: "Execucao de Social Media", desc: "Gestao completa das redes sociais com conteudo profissional.", icon: Instagram },
    { id: 3, title: "Marketing de Influencia Local", desc: "Campanhas com influenciadores que falam a lingua de Londrina.", icon: Users },
    { id: 4, title: "Mentoria Semanal", desc: "Acompanhamento proximo para alinhar estrategias e insights.", icon: Briefcase }
  ],
  evolution: [
    {
      month: "Novembro 2025",
      subtitle: "Lancamento e Black November",
      stats: "3 temas | 4 influenciadores",
      focus: "Estabelecer presenca digital e aproveitar sazonalidade agressiva.",
      details: ["Black November (40% OFF)", "Kit Empresarial", "Institucional Loja"]
    },
    {
      month: "Dezembro 2025",
      subtitle: "Natal e Confraternizacoes",
      stats: "4 temas | 4 influenciadores",
      focus: "Foco em celebracoes, presentes e aumento de ticket medio.",
      details: ["Confra Empresa", "Kit Natal + Bolsa Termica", "Videos de Humor", "Foco em Sobremesas"]
    },
    {
      month: "Janeiro 2026",
      subtitle: "Retomada Pos-Ferias",
      stats: "1 tema expandido | 4 influenciadores",
      focus: "Manutencao de engajamento durante o periodo de recesso.",
      details: ["Praticidade nas Ferias", "Cafe da Manha Bread King"]
    },
    {
      month: "Fevereiro 2026",
      subtitle: "Volta as Aulas e Trends",
      stats: "4 temas | 4 influenciadores",
      focus: "Tendencias virais e conexao com o publico jovem/familiar.",
      details: ["Trend R$ 1 vs R$ 100", "Saudabilidade (Sem Conservantes)", "Volta as Aulas", "Versatilidade Croissant"]
    },
    {
      month: "Marco 2026",
      subtitle: "Mes da Mulher e Eventos",
      stats: "4 temas | 2+ influenciadores",
      focus: "Eventos comunitarios e autoridade nutricional.",
      details: ["Evento Doguinho", "Dinamica Mes da Mulher", "Humor com Kelvin", "Comparativo Nutricionista"]
    }
  ],
  influencers: [
    { id: 1, name: "Andressa Bieco", campaign: "Nov/25 - Black November", link: "https://www.instagram.com/reel/DSais7wj3lB/" },
    { id: 2, name: "Pietra Mantovani", campaign: "Nov/25 - Kit Empresarial", link: "https://www.instagram.com/reel/DRx2UR1janB/" },
    { id: 3, name: "Giro Londrina", campaign: "Nov/25 - Bread King Loja", link: "https://www.instagram.com/reel/DRhhqe_jarE/" },
    { id: 4, name: "Ana Nunes", campaign: "Nov/25 - Bread King Loja", link: "https://www.instagram.com/reel/DSDd6PHkq7O/" },
    { id: 5, name: "Isabella", campaign: "Dez/25 - Confra/Kit Natal", link: "https://www.instagram.com/reel/DSVq26Ygdc-/" },
    { id: 6, name: "ANA BUENO", campaign: "Dez/25 - Video Engracado", link: "https://www.instagram.com/reel/DTTie-5Eayn/" },
    { id: 7, name: "Eliza", campaign: "Dez/25 - Kit Natal", link: "https://www.instagram.com/reel/DSh53SKAKLH/" },
    { id: 8, name: "Mariani Fernandes", campaign: "Dez/25 - Sobremesa", link: "https://www.instagram.com/reel/DTJQE7GERTL/" },
    { id: 9, name: "Thays", campaign: "Jan/26", link: "https://www.instagram.com/reel/DUwJJtNiYhk/" },
    { id: 10, name: "Fernanda Tagawa", campaign: "Jan/26", link: "https://www.instagram.com/reel/DT5cHtskVrS/" },
    { id: 11, name: "Andreia Gavetti", campaign: "Jan/26", link: "https://www.instagram.com/reel/DU8WWGcjbZN/" },
    { id: 12, name: "Luciana Casarin", campaign: "Jan/26", link: "https://www.instagram.com/reel/DT0Fir6kkQj/" },
    { id: 13, name: "Lara Agostini", campaign: "Fev/26 - Trends", link: "#", status: "Em producao" },
    { id: 14, name: "Stefany Bigas", campaign: "Fev/26 - Saudavel", link: "https://www.instagram.com/reel/DVb6KS2AI-_/" },
    { id: 15, name: "Catarina", campaign: "Fev/26 - Volta as Aulas", link: "https://www.instagram.com/reel/DVCXIJ9D2Lc/" },
    { id: 16, name: "Isabela Fernandes", campaign: "Fev/26 - Croissant", link: "https://www.instagram.com/reel/DVMfCmvkhM1/" },
    { id: 17, name: "Alice Nunes", campaign: "Mar/26 - Evento Doguinho", link: "https://www.instagram.com/reel/DVgpn91k0YK/" },
    { id: 18, name: "Karol Silva", campaign: "Mar/26 - Mes da Mulher", link: "#", status: "Em producao" }
  ]
};

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
              Plano de marketing integrado 360&deg; desenvolvido para a franqueadora como prova de excelencia e conformidade regional.
            </p>
          </div>
          <div className="bg-white/40 backdrop-blur-xl border border-white p-8 rounded-[40px] shadow-sm min-w-[280px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status da Unidade</span>
            </div>
            <p className="text-4xl font-black text-gray-900">100%</p>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1 italic">Conformidade Total</p>
          </div>
        </section>

        {/* OS GRANDES NUMEROS */}
        <section>
          <SectionTitle title="Os Grandes Numeros" icon={TrendingUp} />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* PLANEJAMENTO E EVOLUCAO */}
        <section>
          <SectionTitle title="Planejamento Estrategico" icon={Target} />
          <WhyMatters>
            E a <strong>espinha dorsal</strong> da operacao. Sem ele, as acoes seriam reativas. Com o planejamento, cada mes tem um <strong>direcionamento claro</strong>, temas que conversam com a sazonalidade de Londrina e uma narrativa consistente que fortalece a marca.
          </WhyMatters>
          <div className="space-y-6">
            {reportData.evolution.map((ev, i) => (
              <AppleCard key={i} className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/4">
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{ev.month}</p>
                  <h4 className="text-xl font-black text-gray-900 mb-2">{ev.subtitle}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{ev.stats}</p>
                </div>
                <div className="md:w-3/4 border-l border-gray-50 md:pl-10 flex flex-col justify-center">
                  <p className="text-sm text-gray-600 font-medium italic mb-6">&ldquo;{ev.focus}&rdquo;</p>
                  <div className="flex flex-wrap gap-2">
                    {ev.details.map((d, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-50 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-100">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </AppleCard>
            ))}
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
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reels/Mes</p>
                  <p className="text-4xl font-black text-white">12</p>
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-2">Visibilidade Feed</p>
                </AppleCard>
                <AppleCard className="!bg-slate-900 !text-white !border-none !shadow-xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stories/Mes</p>
                  <p className="text-4xl font-black text-white">60</p>
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-2">Conexao Diaria</p>
                </AppleCard>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-white p-10 rounded-[48px] border border-gray-100">
              <h4 className="text-xl font-bold mb-4 tracking-tight">Presenca Ininterrupta</h4>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                O volume contratado de <strong>12 Reels mensais</strong> garante presenca constante no Explore do Instagram, enquanto os <strong>2 Stories por dia</strong> mantem a marca sempre no topo da timeline dos seguidores, gerando desejo de consumo imediato.
              </p>
              <div className="mt-8 flex gap-3">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Clapperboard size={20} /></div>
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><Play size={20} /></div>
              </div>
            </div>
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
                    <th className="px-8 py-5">Campanha / Acao</th>
                    <th className="px-8 py-5 text-right">Rastreabilidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData.influencers.map((inf) => (
                    <tr key={inf.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6 font-black text-gray-900">{inf.name}</td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{inf.campaign}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
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
                <ShieldCheck size={48} className="text-red-600 mb-6" />
                <h4 className="text-xl font-bold mb-4">Relatorio Homologado</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Este documento atesta que a unidade Londrina mantem um alto padrao de marketing, alinhado as diretrizes globais da franqueadora, com entrega de volume e qualidade tecnica.
                </p>
                <div className="mt-8 flex items-center justify-between pt-8 border-t border-white/10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Auditoria Unidade Londrina</span>
                  <span className="text-xs font-black text-green-500 italic">APROVADO</span>
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
