'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronRight,
  Layout,
  Users,
  Target,
  FileText,
  PlayCircle,
  Smartphone,
  Layers,
  Image as ImageIcon,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Video,
  Instagram,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Calendar,
  MapPin,
  Megaphone,
  ClipboardList,
  ExternalLink,
  Hash,
  Mic,
  Film,
  Sparkles,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Creator {
  id: string;
  nome: string;
  instagram: string;
  seguidores: number;
  cidade: string;
  whatsapp: string;
  role: string;
  status: string;
  fee: number;
  video_instagram_link?: string;
  video_tiktok_link?: string;
  deliverables: {
    briefing_complete: string;
    visit_datetime: string | null;
    guest_quantity: number;
    visit_confirmed: string;
    post_datetime: string | null;
    video_approved: string;
    video_posted: string;
    content_links: string[];
    total_views?: number;
    post_views?: number;
    story_views?: number;
    reel_views?: number;
    engagement_rate?: string;
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  };
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  month: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent_amount: number;
  status: string;
  objectives: {
    primary: string;
    secondary: string[];
    kpis: { reach: number; engagement: number; conversions: number };
  };
  deliverables: {
    posts: number;
    stories: number;
    reels: number;
    events: number;
    creators_count: number;
  };
  results: {
    total_reach: number;
    total_engagement: number;
    total_conversions: number;
    roi: number;
  };
  briefing_details?: {
    formatos?: string[];
    perfil_criador?: string;
    objetivo_detalhado?: string;
    comunicacao_secundaria?: string;
    datas_gravacao?: {
      data_inicio?: string;
      data_fim?: string;
      horarios_preferenciais?: string[];
      observacoes?: string;
    };
    roteiro_video?: {
      o_que_falar?: string;
      historia?: string;
      promocao_cta?: string;
      tom_comunicacao?: string;
      pontos_obrigatorios?: string[];
    };
    requisitos_tecnicos?: {
      duracao_video?: string;
      qualidade?: string;
      formato_entrega?: string;
      hashtags_obrigatorias?: string[];
    };
    // Campos novos (processados por IA)
    briefing_summary?: {
      client?: string;
      campaign_title?: string;
      objective?: string;
      target_audience?: string;
      key_messages?: string[];
      brand_tone?: string;
    };
    creative_requirements?: {
      formats?: string[];
      creator_profile?: string;
      content_style?: string;
    };
    video_script?: {
      introduction?: string;
      main_content?: string;
      call_to_action?: string;
    };
    attention_points?: {
      must_include?: string[];
      avoid_items?: string[];
    };
    success_metrics?: {
      primary_kpi?: string;
      secondary_kpis?: string[];
    };
    hashtags_strategy?: {
      mandatory_hashtags?: string[];
      strategic_hashtags?: string[];
      brand_hashtags?: string[];
    };
  };
  criadores?: Creator[];
  totalCriadores?: number;
  created_at: string;
  updated_at: string;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function formatMonthYear(monthStr: string): string {
  if (!monthStr) return '';
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  if (monthStr.match(/^\d{6}$/)) {
    const year = monthStr.substring(0, 4);
    const month = parseInt(monthStr.substring(4, 6));
    return `${monthNames[month - 1]} ${year}`;
  }
  if (monthStr.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = monthStr.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  if (monthStr.match(/^[A-Za-zç]+ \d{4}$/)) return monthStr;
  return monthStr;
}

function formatNumber(value: number): string {
  if (!value) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

function formatInstagramHandle(handle: string): string {
  if (!handle) return '';
  return handle.replace(/^@+/, '');
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Reunião de briefing': 'bg-amber-50 text-amber-700 border-amber-200',
    'Briefing enviado': 'bg-blue-50 text-blue-700 border-blue-200',
    'Agendamentos': 'bg-sky-50 text-sky-700 border-sky-200',
    'Em produção': 'bg-blue-50 text-blue-700 border-blue-200',
    'Entrega final': 'bg-orange-50 text-orange-700 border-orange-200',
    'Concluída': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Finalizado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Cancelada': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

function StepIndicator({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <Clock size={16} className="text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-[11px] ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

function ContentIcon({ type }: { type: string }) {
  switch (type) {
    case 'reels': return <PlayCircle size={14} className="text-rose-500" />;
    case 'story': return <Smartphone size={14} className="text-orange-500" />;
    case 'post': return <Layers size={14} className="text-blue-500" />;
    default: return <ImageIcon size={14} className="text-gray-500" />;
  }
}

// ─── Tab Components ──────────────────────────────────────────────────────────

function OverviewTab({ campaign }: { campaign: Campaign }) {
  const totalExpected = (campaign.deliverables?.posts || 0) + (campaign.deliverables?.reels || 0) + (campaign.deliverables?.stories || 0);
  const totalDelivered = campaign.criadores?.reduce((sum, c) => sum + (c.deliverables?.content_links?.length || 0), 0) || 0;

  return (
    <div className="space-y-5">
      {/* Descrição */}
      {campaign.description && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição</h4>
          <p className="text-[13px] text-gray-700 leading-relaxed">{campaign.description}</p>
        </div>
      )}

      {/* Objetivos */}
      {campaign.objectives?.primary && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Target size={12} /> Objetivos
          </h4>
          <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100/60">
            <p className="text-[13px] font-medium text-blue-800">{campaign.objectives.primary}</p>
            {campaign.objectives.secondary?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {campaign.objectives.secondary.map((obj, i) => (
                  <li key={i} className="text-[12px] text-blue-600 flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* KPIs planejados */}
      {campaign.objectives?.kpis && (campaign.objectives.kpis.reach > 0 || campaign.objectives.kpis.engagement > 0) && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">KPIs Planejados</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/50 rounded-xl p-3 border border-gray-100 text-center">
              <Eye size={14} className="text-gray-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 font-medium">Alcance</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(campaign.objectives.kpis.reach)}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 border border-gray-100 text-center">
              <Heart size={14} className="text-gray-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 font-medium">Engajamento</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(campaign.objectives.kpis.engagement)}</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 border border-gray-100 text-center">
              <TrendingUp size={14} className="text-gray-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400 font-medium">Conversões</p>
              <p className="text-lg font-bold text-gray-900">{formatNumber(campaign.objectives.kpis.conversions)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Entregas */}
      <div>
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Entregas</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {campaign.deliverables?.reels > 0 && (
            <div className="flex items-center gap-2.5 bg-white/50 rounded-xl p-3 border border-gray-100">
              <PlayCircle size={16} className="text-rose-500" />
              <div>
                <p className="text-[10px] text-gray-400">Reels</p>
                <p className="text-[15px] font-bold text-gray-900">{campaign.deliverables.reels}</p>
              </div>
            </div>
          )}
          {campaign.deliverables?.posts > 0 && (
            <div className="flex items-center gap-2.5 bg-white/50 rounded-xl p-3 border border-gray-100">
              <Layers size={16} className="text-blue-500" />
              <div>
                <p className="text-[10px] text-gray-400">Posts</p>
                <p className="text-[15px] font-bold text-gray-900">{campaign.deliverables.posts}</p>
              </div>
            </div>
          )}
          {campaign.deliverables?.stories > 0 && (
            <div className="flex items-center gap-2.5 bg-white/50 rounded-xl p-3 border border-gray-100">
              <Smartphone size={16} className="text-orange-500" />
              <div>
                <p className="text-[10px] text-gray-400">Stories</p>
                <p className="text-[15px] font-bold text-gray-900">{campaign.deliverables.stories}</p>
              </div>
            </div>
          )}
          {campaign.deliverables?.events > 0 && (
            <div className="flex items-center gap-2.5 bg-white/50 rounded-xl p-3 border border-gray-100">
              <Calendar size={16} className="text-emerald-500" />
              <div>
                <p className="text-[10px] text-gray-400">Eventos</p>
                <p className="text-[15px] font-bold text-gray-900">{campaign.deliverables.events}</p>
              </div>
            </div>
          )}
        </div>
        {totalExpected > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totalDelivered / totalExpected) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-gray-500">
              {totalDelivered}/{totalExpected} entregues
            </span>
          </div>
        )}
      </div>

      {/* Datas */}
      {campaign.start_date && campaign.end_date && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar size={12} /> Período
          </h4>
          <p className="text-[13px] text-gray-700">
            {format(new Date(campaign.start_date), "dd 'de' MMMM", { locale: ptBR })} — {format(new Date(campaign.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      )}
    </div>
  );
}

function BriefingTab({ campaign }: { campaign: Campaign }) {
  const bd = campaign.briefing_details;
  if (!bd) {
    return (
      <div className="text-center py-12">
        <FileText size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-[13px] text-gray-400">Briefing ainda não foi definido para esta campanha.</p>
      </div>
    );
  }

  const hasContent = (val: unknown): boolean => {
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0 && val.some(v => hasContent(v));
    if (typeof val === 'object') return Object.values(val as Record<string, unknown>).some(v => hasContent(v));
    return !!val;
  };

  return (
    <div className="space-y-5">
      {/* Objetivo detalhado */}
      {hasContent(bd.objetivo_detalhado) && (
        <Section icon={<Target size={14} />} title="Objetivo Detalhado">
          <p className="text-[13px] text-gray-700 leading-relaxed">{bd.objetivo_detalhado}</p>
        </Section>
      )}

      {/* Briefing Summary (IA) */}
      {hasContent(bd.briefing_summary?.objective) && (
        <Section icon={<Sparkles size={14} />} title="Objetivo da Campanha">
          <p className="text-[13px] text-gray-700 leading-relaxed">{bd.briefing_summary?.objective}</p>
          {bd.briefing_summary?.target_audience && (
            <p className="text-[12px] text-gray-500 mt-2"><strong>Público-alvo:</strong> {bd.briefing_summary.target_audience}</p>
          )}
          {bd.briefing_summary?.key_messages && bd.briefing_summary.key_messages.length > 0 && (
            <div className="mt-2">
              <p className="text-[11px] font-medium text-gray-500 mb-1">Mensagens-chave:</p>
              <ul className="space-y-1">
                {bd.briefing_summary.key_messages.map((msg, i) => (
                  <li key={i} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Perfil do criador */}
      {hasContent(bd.perfil_criador || bd.creative_requirements?.creator_profile) && (
        <Section icon={<Users size={14} />} title="Perfil do Criador Ideal">
          <p className="text-[13px] text-gray-700 leading-relaxed">
            {bd.perfil_criador || bd.creative_requirements?.creator_profile}
          </p>
        </Section>
      )}

      {/* Formatos */}
      {hasContent(bd.formatos || bd.creative_requirements?.formats) && (
        <Section icon={<Film size={14} />} title="Formatos">
          <div className="flex flex-wrap gap-2">
            {(bd.formatos || bd.creative_requirements?.formats || []).map((f, i) => (
              <span key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg text-[12px] font-medium text-gray-600 border border-gray-100">
                {f}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Roteiro do Vídeo */}
      {hasContent(bd.roteiro_video) && (
        <Section icon={<Mic size={14} />} title="Roteiro do Vídeo">
          <div className="space-y-3">
            {bd.roteiro_video?.o_que_falar && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">O que falar</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.roteiro_video.o_que_falar}</p>
              </div>
            )}
            {bd.roteiro_video?.historia && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">História / Narrativa</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.roteiro_video.historia}</p>
              </div>
            )}
            {bd.roteiro_video?.promocao_cta && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">CTA / Promoção</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.roteiro_video.promocao_cta}</p>
              </div>
            )}
            {bd.roteiro_video?.tom_comunicacao && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tom de Comunicação</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.roteiro_video.tom_comunicacao}</p>
              </div>
            )}
            {bd.roteiro_video?.pontos_obrigatorios && bd.roteiro_video.pontos_obrigatorios.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pontos Obrigatórios</p>
                <ul className="space-y-1">
                  {bd.roteiro_video.pontos_obrigatorios.map((p, i) => (
                    <li key={i} className="text-[12px] text-gray-600 flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Video Script (IA) */}
      {hasContent(bd.video_script) && !hasContent(bd.roteiro_video) && (
        <Section icon={<Mic size={14} />} title="Roteiro do Vídeo">
          <div className="space-y-3">
            {bd.video_script?.introduction && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Introdução</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.video_script.introduction}</p>
              </div>
            )}
            {bd.video_script?.main_content && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Conteúdo Principal</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.video_script.main_content}</p>
              </div>
            )}
            {bd.video_script?.call_to_action && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Call to Action</p>
                <p className="text-[13px] text-gray-700 leading-relaxed">{bd.video_script.call_to_action}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Requisitos Técnicos */}
      {hasContent(bd.requisitos_tecnicos) && (
        <Section icon={<ClipboardList size={14} />} title="Requisitos Técnicos">
          <div className="grid grid-cols-2 gap-3">
            {bd.requisitos_tecnicos?.duracao_video && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium">Duração</p>
                <p className="text-[13px] font-semibold text-gray-800">{bd.requisitos_tecnicos.duracao_video}</p>
              </div>
            )}
            {bd.requisitos_tecnicos?.qualidade && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium">Qualidade</p>
                <p className="text-[13px] font-semibold text-gray-800">{bd.requisitos_tecnicos.qualidade}</p>
              </div>
            )}
            {bd.requisitos_tecnicos?.formato_entrega && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium">Formato</p>
                <p className="text-[13px] font-semibold text-gray-800">{bd.requisitos_tecnicos.formato_entrega}</p>
              </div>
            )}
          </div>
          {bd.requisitos_tecnicos?.hashtags_obrigatorias && bd.requisitos_tecnicos.hashtags_obrigatorias.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Hash size={10} /> Hashtags Obrigatórias
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bd.requisitos_tecnicos.hashtags_obrigatorias.map((h, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-medium">
                    {h.startsWith('#') ? h : `#${h}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Hashtags Strategy (IA) */}
      {hasContent(bd.hashtags_strategy) && !hasContent(bd.requisitos_tecnicos?.hashtags_obrigatorias) && (
        <Section icon={<Hash size={14} />} title="Estratégia de Hashtags">
          <div className="space-y-2">
            {bd.hashtags_strategy?.mandatory_hashtags && bd.hashtags_strategy.mandatory_hashtags.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium mb-1">Obrigatórias</p>
                <div className="flex flex-wrap gap-1.5">
                  {bd.hashtags_strategy.mandatory_hashtags.map((h, i) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[11px] font-medium">
                      {h.startsWith('#') ? h : `#${h}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {bd.hashtags_strategy?.strategic_hashtags && bd.hashtags_strategy.strategic_hashtags.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-400 font-medium mb-1">Estratégicas</p>
                <div className="flex flex-wrap gap-1.5">
                  {bd.hashtags_strategy.strategic_hashtags.map((h, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-[11px] font-medium">
                      {h.startsWith('#') ? h : `#${h}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Pontos de Atenção (IA) */}
      {hasContent(bd.attention_points) && (
        <Section icon={<Megaphone size={14} />} title="Pontos de Atenção">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bd.attention_points?.must_include && bd.attention_points.must_include.length > 0 && (
              <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/60">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5">Incluir</p>
                <ul className="space-y-1">
                  {bd.attention_points.must_include.map((item, i) => (
                    <li key={i} className="text-[12px] text-emerald-700 flex items-start gap-1.5">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {bd.attention_points?.avoid_items && bd.attention_points.avoid_items.length > 0 && (
              <div className="bg-red-50/50 rounded-xl p-3 border border-red-100/60">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1.5">Evitar</p>
                <ul className="space-y-1">
                  {bd.attention_points.avoid_items.map((item, i) => (
                    <li key={i} className="text-[12px] text-red-700 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Datas de Gravação */}
      {hasContent(bd.datas_gravacao) && (
        <Section icon={<Calendar size={14} />} title="Datas de Gravação">
          <div className="space-y-2">
            {(bd.datas_gravacao?.data_inicio || bd.datas_gravacao?.data_fim) && (
              <p className="text-[13px] text-gray-700">
                {bd.datas_gravacao.data_inicio && format(new Date(bd.datas_gravacao.data_inicio), "dd 'de' MMMM", { locale: ptBR })}
                {bd.datas_gravacao.data_fim && ` a ${format(new Date(bd.datas_gravacao.data_fim), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`}
              </p>
            )}
            {bd.datas_gravacao?.horarios_preferenciais && bd.datas_gravacao.horarios_preferenciais.length > 0 && (
              <p className="text-[12px] text-gray-500">
                <strong>Horários:</strong> {bd.datas_gravacao.horarios_preferenciais.join(', ')}
              </p>
            )}
            {bd.datas_gravacao?.observacoes && (
              <p className="text-[12px] text-gray-500">
                <strong>Obs:</strong> {bd.datas_gravacao.observacoes}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Comunicação Secundária */}
      {hasContent(bd.comunicacao_secundaria) && (
        <Section icon={<MessageCircle size={14} />} title="Comunicação Secundária">
          <p className="text-[13px] text-gray-700 leading-relaxed">{bd.comunicacao_secundaria}</p>
        </Section>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      <div className="bg-white/60 rounded-xl p-4 border border-gray-100/80">
        {children}
      </div>
    </div>
  );
}

function CreatorsTab({ campaign }: { campaign: Campaign }) {
  const creators = campaign.criadores || [];

  if (creators.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-[13px] text-gray-400">Nenhum criador atribuído a esta campanha ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {creators.map((creator) => (
        <div key={creator.id} className="bg-white/60 rounded-xl border border-gray-100/80 overflow-hidden">
          {/* Creator Header */}
          <div className="p-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[13px] font-bold text-gray-500">
                {creator.nome?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <h5 className="text-[13px] font-bold text-gray-900">{creator.nome}</h5>
                <div className="flex items-center gap-2 mt-0.5">
                  {creator.instagram && (
                    <a
                      href={`https://instagram.com/${formatInstagramHandle(creator.instagram)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <Instagram size={10} />
                      @{formatInstagramHandle(creator.instagram)}
                    </a>
                  )}
                  {creator.seguidores > 0 && (
                    <span className="text-[10px] text-gray-400">{formatNumber(creator.seguidores)} seg.</span>
                  )}
                  {creator.cidade && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <MapPin size={9} /> {creator.cidade}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {creator.status && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                creator.status === 'Confirmado' || creator.status === 'Ativo'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-gray-50 text-gray-600'
              }`}>
                {creator.status}
              </span>
            )}
          </div>

          {/* Delivery Timeline */}
          <div className="px-4 pb-3 border-t border-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              <StepIndicator
                done={creator.deliverables?.briefing_complete === 'Concluído' || creator.deliverables?.briefing_complete === 'Completo'}
                label="Briefing"
              />
              <StepIndicator
                done={creator.deliverables?.visit_confirmed === 'Confirmado' || creator.deliverables?.visit_confirmed === 'Sim'}
                label="Visita"
              />
              <StepIndicator
                done={creator.deliverables?.video_approved === 'Aprovado' || creator.deliverables?.video_approved === 'Sim'}
                label="Vídeo aprovado"
              />
              <StepIndicator
                done={creator.deliverables?.video_posted === 'Sim' || creator.deliverables?.video_posted === 'Postado'}
                label="Postado"
              />
            </div>
          </div>

          {/* Content Links */}
          {(creator.deliverables?.content_links?.length > 0 || creator.video_instagram_link || creator.video_tiktok_link) && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Conteúdo Publicado</p>
              <div className="flex flex-wrap gap-2">
                {creator.video_instagram_link && (
                  <a
                    href={creator.video_instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg text-[11px] font-medium text-rose-700 border border-rose-100 hover:shadow-sm transition-shadow"
                  >
                    <Instagram size={12} /> Instagram <ExternalLink size={10} />
                  </a>
                )}
                {creator.video_tiktok_link && (
                  <a
                    href={creator.video_tiktok_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 rounded-lg text-[11px] font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <Video size={12} /> TikTok <ExternalLink size={10} />
                  </a>
                )}
                {creator.deliverables?.content_links?.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-[11px] font-medium text-blue-700 border border-blue-100 hover:shadow-sm transition-shadow truncate max-w-[200px]"
                  >
                    <ExternalLink size={10} className="flex-shrink-0" />
                    <span className="truncate">Link {i + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics (if available) */}
          {(creator.deliverables?.reach || creator.deliverables?.impressions || creator.deliverables?.likes) && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Métricas</p>
              <div className="flex flex-wrap gap-3">
                {creator.deliverables.reach && creator.deliverables.reach > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600">
                    <Eye size={12} className="text-gray-400" /> {formatNumber(creator.deliverables.reach)} alcance
                  </div>
                )}
                {creator.deliverables.impressions && creator.deliverables.impressions > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600">
                    <BarChart3 size={12} className="text-gray-400" /> {formatNumber(creator.deliverables.impressions)} impressões
                  </div>
                )}
                {creator.deliverables.likes && creator.deliverables.likes > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600">
                    <Heart size={12} className="text-gray-400" /> {formatNumber(creator.deliverables.likes)} curtidas
                  </div>
                )}
                {creator.deliverables.comments && creator.deliverables.comments > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600">
                    <MessageCircle size={12} className="text-gray-400" /> {formatNumber(creator.deliverables.comments)} comentários
                  </div>
                )}
                {creator.deliverables.shares && creator.deliverables.shares > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600">
                    <Share2 size={12} className="text-gray-400" /> {formatNumber(creator.deliverables.shares)} compartilhamentos
                  </div>
                )}
                {creator.deliverables.saves && creator.deliverables.saves > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600">
                    <Bookmark size={12} className="text-gray-400" /> {formatNumber(creator.deliverables.saves)} salvos
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ResultsTab({ campaign }: { campaign: Campaign }) {
  const r = campaign.results;
  const hasResults = r && (r.total_reach > 0 || r.total_engagement > 0 || r.total_conversions > 0 || r.roi > 0);

  // Collect all content links from creators
  const allLinks: { link: string; creator: string; type: string }[] = [];
  campaign.criadores?.forEach(c => {
    if (c.video_instagram_link) allLinks.push({ link: c.video_instagram_link, creator: c.nome, type: 'instagram' });
    if (c.video_tiktok_link) allLinks.push({ link: c.video_tiktok_link, creator: c.nome, type: 'tiktok' });
    c.deliverables?.content_links?.forEach(l => allLinks.push({ link: l, creator: c.nome, type: 'link' }));
  });

  if (!hasResults && allLinks.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-[13px] text-gray-400">Os resultados serão exibidos quando a campanha for finalizada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Métricas consolidadas */}
      {hasResults && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Resultados Consolidados</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/60 rounded-xl p-4 border border-gray-100/80 text-center">
              <Eye size={18} className="text-blue-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-gray-400 font-medium">Alcance Total</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(r.total_reach)}</p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-gray-100/80 text-center">
              <Heart size={18} className="text-rose-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-gray-400 font-medium">Engajamento</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(r.total_engagement)}</p>
            </div>
            <div className="bg-white/60 rounded-xl p-4 border border-gray-100/80 text-center">
              <TrendingUp size={18} className="text-emerald-500 mx-auto mb-1.5" />
              <p className="text-[10px] text-gray-400 font-medium">Conversões</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(r.total_conversions)}</p>
            </div>
            {r.roi > 0 && (
              <div className="bg-white/60 rounded-xl p-4 border border-gray-100/80 text-center">
                <BarChart3 size={18} className="text-amber-500 mx-auto mb-1.5" />
                <p className="text-[10px] text-gray-400 font-medium">ROI</p>
                <p className="text-xl font-bold text-gray-900">{r.roi.toFixed(1)}x</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All content links */}
      {allLinks.length > 0 && (
        <div>
          <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
            Conteúdo Publicado ({allLinks.length})
          </h4>
          <div className="space-y-2">
            {allLinks.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100/80 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                {item.type === 'instagram' && <Instagram size={16} className="text-rose-500 flex-shrink-0" />}
                {item.type === 'tiktok' && <Video size={16} className="text-gray-900 flex-shrink-0" />}
                {item.type === 'link' && <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                    {item.type === 'instagram' ? 'Vídeo Instagram' : item.type === 'tiktok' ? 'Vídeo TikTok' : item.link}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.creator}</p>
                </div>
                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Campaign Expandable Card ────────────────────────────────────────────────

type TabKey = 'overview' | 'briefing' | 'creators' | 'results';

function CampaignCard({ campaign, isExpanded, onToggle }: {
  campaign: Campaign;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const creatorsCount = campaign.totalCriadores || campaign.deliverables?.creators_count || campaign.criadores?.length || 0;
  const totalDeliverables = (campaign.deliverables?.posts || 0) + (campaign.deliverables?.reels || 0) + (campaign.deliverables?.stories || 0);
  const totalDelivered = campaign.criadores?.reduce((sum, c) => sum + (c.deliverables?.content_links?.length || 0), 0) || 0;
  const hasBriefing = campaign.briefing_details && Object.keys(campaign.briefing_details).length > 0;
  const hasResults = campaign.results && (campaign.results.total_reach > 0 || campaign.results.total_engagement > 0);

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; show: boolean }[] = [
    { key: 'overview', label: 'Visão Geral', icon: <Layout size={13} />, show: true },
    { key: 'briefing', label: 'Briefing', icon: <FileText size={13} />, show: true },
    { key: 'creators', label: 'Criadores', icon: <Users size={13} />, show: true },
    { key: 'results', label: 'Resultados', icon: <BarChart3 size={13} />, show: true },
  ];

  return (
    <div className={`bg-white/70 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
      isExpanded ? 'border-blue-200/60 shadow-lg shadow-blue-500/5' : 'border-white/80 shadow-sm hover:shadow-md hover:border-gray-200'
    }`}>
      {/* Collapsed Header */}
      <div
        className="p-4 sm:p-5 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {formatMonthYear(campaign.month)}
              </span>
              <StatusBadge status={campaign.status} />
            </div>
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug">
              {campaign.title}
            </h3>
            {!isExpanded && campaign.description && (
              <p className="text-[12px] text-gray-500 mt-1 line-clamp-1">{campaign.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Mini metrics */}
            {!isExpanded && (
              <div className="hidden sm:flex items-center gap-4">
                {creatorsCount > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Users size={12} className="text-gray-400" />
                    <span className="font-semibold">{creatorsCount}</span>
                  </div>
                )}
                {totalDeliverables > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Layers size={12} className="text-gray-400" />
                    <span className="font-semibold">{totalDelivered}/{totalDeliverables}</span>
                  </div>
                )}
              </div>
            )}

            <div className={`p-1.5 rounded-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100/80">
          {/* Tabs */}
          <div className="px-4 sm:px-5 pt-4">
            <div className="bg-gray-100/80 rounded-xl p-1 flex gap-1">
              {tabs.filter(t => t.show).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-5">
            {activeTab === 'overview' && <OverviewTab campaign={campaign} />}
            {activeTab === 'briefing' && <BriefingTab campaign={campaign} />}
            {activeTab === 'creators' && <CreatorsTab campaign={campaign} />}
            {activeTab === 'results' && <ResultsTab campaign={campaign} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

function CampanhasEmpresaContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) { router.push('/login'); return; }

      const isBusinessOwner = user.role === 'business_owner' || (user.roles && user.roles.includes('business_owner'));
      if (!isBusinessOwner) { router.push('/dashboard'); return; }
      if (!user.business_id) { setHasAccess(false); setLoading(false); return; }

      setHasAccess(true);

      try {
        // Fetch business info
        const bizRes = await fetch(`/api/businesses/${user.business_id}`);
        const biz = await bizRes.json();
        setBusinessName(biz.name || '');

        // Fetch campaigns
        const campRes = await fetch(`/api/supabase/campaigns?business_id=${user.business_id}`);
        const campData = await campRes.json();

        if (campData.success && campData.data && Array.isArray(campData.data)) {
          const sorted = campData.data.sort((a: Campaign, b: Campaign) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setCampaigns(sorted);

          // Auto-expand first campaign
          if (sorted.length > 0) {
            setExpandedId(sorted[0].id);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar campanhas:', err);
      }

      setLoading(false);
    }

    load();
  }, [user, router]);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007AFF] mx-auto mb-4" />
          <p className="text-[13px] text-gray-500">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-[13px] text-gray-500 mb-6">Esta página é exclusiva para proprietários de empresas.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-[#007AFF] text-white rounded-xl text-[13px] font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Stats
  const totalCreators = campaigns.reduce((sum, c) => sum + (c.totalCriadores || c.deliverables?.creators_count || c.criadores?.length || 0), 0);
  const totalContentsDelivered = campaigns.reduce((sum, c) => {
    return sum + (c.criadores?.reduce((s, cr) => s + (cr.deliverables?.content_links?.length || 0) + (cr.video_instagram_link ? 1 : 0) + (cr.video_tiktok_link ? 1 : 0), 0) || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Campanhas</h1>
          <p className="text-[13px] text-gray-500 mt-1">{businessName}</p>
        </div>

        {/* Summary Cards */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="px-4 py-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl"><Megaphone size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Campanhas</p>
              <p className="text-lg font-bold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
          <div className="px-4 py-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-teal-50 rounded-xl"><Users size={16} className="text-teal-600" /></div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Criadores</p>
              <p className="text-lg font-bold text-gray-900">{totalCreators}</p>
            </div>
          </div>
          {totalContentsDelivered > 0 && (
            <div className="px-4 py-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 size={16} className="text-emerald-600" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Publicados</p>
                <p className="text-lg font-bold text-gray-900">{totalContentsDelivered}</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-sm p-12 text-center">
            <Megaphone size={32} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Nenhuma campanha encontrada</h3>
            <p className="text-[13px] text-gray-400">Suas campanhas aparecerão aqui quando forem criadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                isExpanded={expandedId === campaign.id}
                onToggle={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function CampanhasEmpresaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007AFF] mx-auto mb-4" />
          <p className="text-[13px] text-gray-500">Carregando...</p>
        </div>
      </div>
    }>
      <CampanhasEmpresaContent />
    </Suspense>
  );
}
