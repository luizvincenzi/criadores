'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Camera,
  TrendingUp,
  MessageCircle,
  User,
  X,
  Play,
  Search,
  Users,
  BarChart3,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';

// --- Types ---
interface FAQ {
  question: string;
  answer: string;
}

// --- FAQItem Component ---
const FAQItem = ({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50/50 transition-colors"
    >
      <span className="font-semibold text-[#1d1d1f] pr-4">{question}</span>
      <ChevronDown
        size={20}
        className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-gray-600 leading-relaxed">
        {answer}
      </div>
    )}
  </div>
);

// --- Main Client Component ---
export default function SocialMediaEstrategicoClient({ faqs }: { faqs: FAQ[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-onest">
      {/* ============================================ */}
      {/* S1: HEADER */}
      {/* ============================================ */}
      <header className="bg-white/80 backdrop-blur-md fixed w-full top-0 z-50 transition-all duration-300 border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-onest tracking-tight">
                <span className="text-gray-600 font-light">cr</span>
                <span className="text-[#0b3553] font-bold">IA</span>
                <span className="text-gray-600 font-light">dores</span>
              </span>
            </a>

            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Home
              </a>
              <a href="/blog" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                Blog
              </a>
              <a href="/perguntas-frequentes" className="text-sm text-gray-600 hover:text-black font-medium transition-colors duration-200">
                FAQ
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 border border-gray-300 rounded-full hover:border-gray-400"
              >
                Entrar
              </button>
              <button
                onClick={() => window.location.href = '/chatcriadores-social-media'}
                className="inline-flex items-center justify-center font-medium transition-all duration-200 btn-primary px-4 py-2 text-xs rounded-full"
              >
                Falar com Especialista
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-black focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <a href="/" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">Home</a>
                <a href="/blog" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">Blog</a>
                <a href="/perguntas-frequentes" className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-black">FAQ</a>
                <div className="px-3 py-2 space-y-2">
                  <button
                    onClick={() => window.location.href = '/chatcriadores-social-media'}
                    className="w-full inline-flex items-center justify-center font-medium btn-primary px-4 py-2 text-xs rounded-full"
                  >
                    Falar com Especialista
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ============================================ */}
      {/* S2: HERO SECTION */}
      {/* ============================================ */}
      <section className="min-h-[85vh] bg-gradient-to-br from-background via-slate-50 to-slate-200/50 relative overflow-hidden flex items-center pt-16">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-slate-400/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-zinc-400/5 rounded-full blur-[100px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none" />

        <div className="relative z-10 text-center space-y-10 max-w-5xl mx-auto px-6 py-20 lg:py-28">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 border border-slate-200/60 backdrop-blur-md shadow-xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-400/5 via-transparent to-slate-400/5 animate-pulse" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping" />
              <span className="relative z-10 text-xs font-bold text-slate-600 tracking-[0.2em] uppercase">Social Media Estratégico</span>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-ping delay-500" />
            </div>
          </motion.div>

          {/* Heading */}
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9] select-none"
            >
              <span className="block font-light text-slate-400 mb-2 text-2xl md:text-4xl lg:text-5xl tracking-tight">
                Seu estrategista de redes sociais.
              </span>
              <span className="block relative inline-block mt-2">
                <span className="bg-gradient-to-b from-slate-800 via-slate-700 to-slate-500 bg-clip-text text-transparent font-black relative z-10 pb-2">
                  Dentro da sua empresa.
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-300 via-slate-400 to-gray-500 bg-clip-text text-transparent font-black blur-2xl opacity-10 scale-105">
                  Dentro da sua empresa.
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                  className="absolute -bottom-2 md:-bottom-4 left-0 h-1 md:h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-transparent rounded-full opacity-30"
                />
              </span>
            </motion.h1>
          </div>

          {/* Subtext */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg md:text-2xl text-slate-600 leading-relaxed font-light">
              Um profissional dedicado vai ao seu negócio{" "}
              <span className="text-slate-900 font-medium relative inline-block">
                toda semana
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-400/40"></span>
              </span>
              {" "}para produzir conteúdo, gerenciar suas redes e fazer sua marca crescer.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4"
          >
            <motion.button
              onClick={() => window.location.href = '/chatcriadores-social-media'}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(100, 116, 139, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl shadow-slate-200 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Falar com Especialista</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>

            <motion.button
              onClick={() => scrollToSection('como-funciona')}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.8)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 border border-slate-300 rounded-full font-semibold text-lg text-slate-600 hover:text-slate-900 transition-colors duration-300 backdrop-blur-sm bg-white/50 cursor-pointer"
            >
              <span className="tracking-wide">Ver Como Funciona</span>
            </motion.button>
          </motion.div>

          {/* Trust bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-slate-500"
          >
            <span className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Sem fidelidade</span>
            <span className="flex items-center gap-2"><Shield size={16} className="text-blue-500" /> Garantia 30 dias</span>
            <span className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Início imediato</span>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* S3: PROBLEM SECTION */}
      {/* ============================================ */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold mb-6 text-[#1d1d1f]">
              Você já tentou de tudo.
            </h2>
            <p className="text-xl text-[#86868b] leading-relaxed max-w-2xl mx-auto">
              E nenhuma solução resolve o problema de verdade. Nós entendemos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pain 1 */}
            <div className="bg-[#f5f5f7] rounded-[30px] p-8 hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <User size={24} className="text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Fazer sozinho</h3>
              <p className="text-[#86868b] leading-relaxed text-sm">
                Exaustivo e sem estratégia. Você posta quando dá, sem constância, sem planejamento e sem resultado. Seu negócio merece mais.
              </p>
            </div>

            {/* Pain 2 */}
            <div className="bg-[#f5f5f7] rounded-[30px] p-8 hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 size={24} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Contratar agência</h3>
              <p className="text-[#86868b] leading-relaxed text-sm">
                Investimento alto, conteúdo genérico feito por quem nunca pisou no seu negócio. Zero presencialidade, zero autenticidade.
              </p>
            </div>

            {/* Pain 3 */}
            <div className="bg-[#f5f5f7] rounded-[30px] p-8 hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock size={24} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1d1d1f]">Freelancer</h3>
              <p className="text-[#86868b] leading-relaxed text-sm">
                Some, atrasa, não tem compromisso. Quando funciona, é ótimo — mas nunca dura. Você não pode depender de sorte.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-xl text-[#86868b]">
              Nós criamos o caminho do meio: <strong className="text-[#1d1d1f]">Profissional, Presencial e Constante.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* S4: ENTREGÁVEIS - BENTO GRID */}
      {/* ============================================ */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-semibold mb-4 text-center text-[#1d1d1f]">Tudo o que está incluso.</h2>
        <p className="text-center text-[#86868b] text-lg mb-12 max-w-2xl mx-auto">
          Um plano completo de social media, sem surpresas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
          {/* Card 1: Large Feature */}
          <div className="md:col-span-2 bg-white rounded-[30px] p-10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-center">
            <div className="relative z-10">
              <h3 className="text-3xl font-semibold mb-3 text-white">Visita Presencial Semanal.</h3>
              <p className="text-white/90 text-lg max-w-md leading-relaxed drop-shadow-sm">
                Um estrategista vai até sua empresa toda semana para captar fotos e vídeos profissionais. Nada de banco de imagens.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1542744095-291d1f67b221?q=80&w=2000&auto=format&fit=crop"
              alt="Estrategista de social media produzindo conteúdo presencialmente na empresa"
              className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
          </div>

          {/* Card 2: Reels */}
          <div className="bg-white rounded-[30px] p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-4xl font-bold text-[#1d1d1f] mb-2 tracking-tight">Reels Semanais</h3>
              <p className="text-[#86868b] font-medium">2 reels por semana, editados profissionalmente.</p>
            </div>
            <div className="mt-8 relative h-40 w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <Play size={40} fill="currentColor" className="opacity-50" />
              </div>
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <div className="w-6 h-6 bg-white/50 rounded-full"></div>
                <div className="w-6 h-6 bg-white/50 rounded-full"></div>
                <div className="w-6 h-6 bg-white/50 rounded-full"></div>
              </div>
            </div>
            <p className="mt-6 text-sm text-[#86868b]">Vídeos editados e orientados a vendas.</p>
          </div>

          {/* Card 3: Stories */}
          <div className="bg-white rounded-[30px] p-10 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-semibold mb-2 text-[#1d1d1f]">Stories Diários.</h3>
            <p className="text-[#86868b]">2 stories por dia para manter sua marca sempre presente na mente do cliente.</p>
            <div className="mt-6 flex gap-3">
              <div className="w-16 h-28 bg-gradient-to-b from-slate-200 to-slate-300 rounded-xl"></div>
              <div className="w-16 h-28 bg-gradient-to-b from-slate-300 to-slate-400 rounded-xl"></div>
              <div className="w-16 h-28 bg-gradient-to-b from-slate-200 to-slate-300 rounded-xl"></div>
            </div>
          </div>

          {/* Card 4: Strategy - Dark */}
          <div className="md:col-span-2 bg-[#1d1d1f] rounded-[30px] p-10 shadow-sm text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold mb-2 text-[#f5f5f7]">Estratégia de Dados.</h3>
              <p className="text-gray-400 max-w-lg mb-6">
                Não postamos por postar. Entregamos calendário editorial, roteiros e uma reunião mensal com estrategista para analisar métricas e ajustar a rota.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-medium border border-white/10">Calendário Editorial</div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-medium border border-white/10">Métricas Mensais</div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-medium border border-white/10">Reunião Estratégica</div>
              </div>
            </div>
            <TrendingUp className="absolute -bottom-6 -right-6 text-white/5 w-64 h-64" />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* S5: COMO FUNCIONA */}
      {/* ============================================ */}
      <section id="como-funciona" className="py-24 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-center mb-4 text-[#1d1d1f]">Como funciona.</h2>
          <p className="text-center text-[#86868b] text-lg mb-16 max-w-2xl mx-auto">
            Do diagnóstico ao crescimento. Simples, transparente e sem burocracia.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Diagnóstico Gratuito', desc: 'Analisamos seu negócio, entendemos seus objetivos e definimos a estratégia ideal para suas redes sociais.', icon: Search },
              { step: '02', title: 'Estrategista Designado', desc: 'Selecionamos o profissional mais adequado para seu segmento e região. Alguém que entende do seu mercado.', icon: Users },
              { step: '03', title: 'Visita Semanal', desc: 'Toda semana, no seu negócio, produzindo conteúdo real e autêntico. Fotos, vídeos e reels profissionais.', icon: Camera },
              { step: '04', title: 'Crescimento Constante', desc: 'Gestão diária das redes, análise de métricas, ajustes estratégicos e reunião mensal de resultados.', icon: TrendingUp },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-[30px] p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 group">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl font-black text-slate-200 group-hover:text-slate-400 transition-colors">{item.step}</span>
                  <item.icon size={24} className="text-[#0071e3]" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-[#1d1d1f]">{item.title}</h3>
                <p className="text-[#86868b] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* GARANTIA + CTA INTERMEDIÁRIO */}
      {/* ============================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#f5f5f7] rounded-[30px] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#1d1d1f] mb-1">Garantia de Satisfação</h3>
                <p className="text-[#86868b] text-sm">Não gostou do social media? Trocamos em até 30 dias. Sem custo adicional.</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/chatcriadores-social-media'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071e3] text-white rounded-full font-medium hover:bg-[#0077ED] transition-all shadow-lg shadow-[#0071e3]/30 hover:scale-[1.02] whitespace-nowrap"
            >
              <MessageCircle size={18} /> Falar com Especialista
            </button>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* S9: FAQ */}
      {/* ============================================ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#0b3553] text-sm font-medium mb-6">
              Perguntas Frequentes
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b3553] mb-6">Tire suas dúvidas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              As perguntas mais comuns sobre o social media estratégico.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="/perguntas-frequentes"
              className="text-[#0071e3] text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all"
            >
              Ver todas as perguntas frequentes <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL + FOOTER */}
      {/* ============================================ */}
      <section className="bg-gradient-to-b from-[#0b3553] via-[#082940] to-[#041220] py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para ter um social media estratégico?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Agende seu diagnóstico gratuito e descubra como podemos transformar suas redes sociais em uma máquina de crescimento.
            </p>

            <button
              onClick={() => window.location.href = '/chatcriadores-social-media'}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-[#0b3553] rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Agendar Diagnóstico Gratuito <ArrowRight size={20} />
            </button>

            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-blue-200">
              <span className="flex items-center gap-2"><Check size={16} /> Sem fidelidade</span>
              <span className="flex items-center gap-2"><Shield size={16} /> Garantia 30 dias</span>
              <span className="flex items-center gap-2"><Zap size={16} /> Início imediato</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#041220] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-onest tracking-tight">
                  <span className="text-gray-300 font-light">cr</span>
                  <span className="text-white font-bold">IA</span>
                  <span className="text-gray-300 font-light">dores</span>
                </span>
              </div>
              <p className="text-blue-100/70 text-sm leading-relaxed">
                Social media estratégico para empresas. Estrategistas dedicados que vão presencialmente ao seu negócio toda semana.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Links</h4>
              <div className="space-y-2">
                <a href="/" className="block text-blue-100/70 hover:text-white text-sm transition-colors">Home</a>
                <a href="/blog" className="block text-blue-100/70 hover:text-white text-sm transition-colors">Blog</a>
                <a href="/perguntas-frequentes" className="block text-blue-100/70 hover:text-white text-sm transition-colors">Perguntas Frequentes</a>
                <a href="/sou-criador" className="block text-blue-100/70 hover:text-white text-sm transition-colors">Sou Criador</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-blue-100/70">
                <a href="https://wa.me/554391936400" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <MessageCircle size={16} /> (43) 9193-6400
                </a>
                <a href="mailto:contato@criadores.app" className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  contato@criadores.app
                </a>
                <p>Segunda a Sexta: 8h - 18h</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-blue-100/50 text-xs">
              &copy; {new Date().getFullYear()} crIAdores. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
