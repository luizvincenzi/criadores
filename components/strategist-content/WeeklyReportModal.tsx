'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { format, endOfWeek, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X, Download, Share2, Calendar, Clock,
  Video, Image as ImageIcon, Disc,
  CheckCircle2, Layout, Layers, MessageCircle,
  FileText, AlertCircle, Loader2, Check, Copy
} from 'lucide-react';
import { BusinessSocialContent } from '../BusinessContentModal';
import { PlatformIcon, platformNames } from '@/components/icons/PlatformIcons';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  monthStart: Date;
  contents: BusinessSocialContent[];
  businessName: string;
  viewMode: 'week' | 'month';
}

// Status config
const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  planned: { label: 'Planejado', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  in_progress: { label: 'Em progresso', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  completed: { label: 'Publicado', color: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-400' }
};

const contentTypeConfig: Record<string, { label: string; icon: React.ComponentType<any>; color: string; bg: string }> = {
  reels: { label: 'Reels', icon: Video, color: 'text-green-700', bg: 'bg-green-50' },
  story: { label: 'Stories', icon: Disc, color: 'text-amber-700', bg: 'bg-amber-50' },
  post: { label: 'Posts', icon: ImageIcon, color: 'text-blue-700', bg: 'bg-blue-50' }
};

// Type Icon component
const TypeIcon = ({ type }: { type: string }) => {
  const config = contentTypeConfig[type] || contentTypeConfig.post;
  const Icon = config.icon;
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
      <Icon className="w-4 h-4" />
    </div>
  );
};

// Status Badge component
const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.planned;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${config.bg} ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default function WeeklyReportModal({
  isOpen,
  onClose,
  weekStart,
  monthStart,
  contents,
  businessName,
  viewMode
}: WeeklyReportModalProps) {
  const [reportType, setReportType] = useState<'week' | 'month'>(viewMode);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Período
  const periodStart = reportType === 'week' ? weekStart : monthStart;
  const periodEnd = reportType === 'week'
    ? endOfWeek(weekStart, { weekStartsOn: 1 })
    : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  const weekNumber = Math.ceil((weekStart.getDate()) / 7);

  // Filtrar conteúdos com timezone-safe
  const periodContents = useMemo(() => {
    const startStr = format(periodStart, 'yyyy-MM-dd');
    const endStr = format(periodEnd, 'yyyy-MM-dd');
    return contents.filter(content => {
      const dateStr = content.scheduled_date.includes('T')
        ? content.scheduled_date.split('T')[0]
        : content.scheduled_date;
      return dateStr >= startStr && dateStr <= endStr;
    });
  }, [contents, periodStart, periodEnd]);

  // Agrupar por dia (timezone-safe)
  const contentsByDay = useMemo(() => {
    const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
    return days.map(day => {
      const targetStr = format(day, 'yyyy-MM-dd');
      return {
        date: day,
        dayName: format(day, 'EEEE', { locale: ptBR }),
        dayFormatted: format(day, "d 'de' MMMM", { locale: ptBR }),
        items: periodContents.filter(c => {
          const cStr = c.scheduled_date.includes('T') ? c.scheduled_date.split('T')[0] : c.scheduled_date;
          return cStr === targetStr;
        }).sort((a, b) => (a.scheduled_time || '').localeCompare(b.scheduled_time || ''))
      };
    }).filter(d => d.items.length > 0);
  }, [periodContents, periodStart, periodEnd]);

  // Métricas avançadas
  const metrics = useMemo(() => {
    const total = periodContents.length;
    const executed = periodContents.filter(c => c.is_executed).length;
    const byType = {
      reels: periodContents.filter(c => c.content_type === 'reels').length,
      stories: periodContents.filter(c => c.content_type === 'story').length,
      posts: periodContents.filter(c => c.content_type === 'post').length
    };
    const byStatus = {
      planned: periodContents.filter(c => c.status === 'planned').length,
      in_progress: periodContents.filter(c => c.status === 'in_progress').length,
      completed: periodContents.filter(c => c.status === 'completed').length,
      cancelled: periodContents.filter(c => c.status === 'cancelled').length
    };

    // Contagem por plataforma
    const platformCounts: Record<string, number> = {};
    periodContents.forEach(c => {
      (c.platforms || []).forEach(p => {
        platformCounts[p] = (platformCounts[p] || 0) + 1;
      });
    });
    const platforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);

    return { total, executed, executionRate: total > 0 ? Math.round((executed / total) * 100) : 0, byType, byStatus, platforms };
  }, [periodContents]);

  // Doc ID estável baseado no período
  const docId = useMemo(() => {
    const seed = `${businessName}-${format(periodStart, 'yyyy-MM-dd')}-${reportType}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
  }, [businessName, periodStart, reportType]);

  // WhatsApp — resumo conciso
  const generateWhatsAppText = useCallback(() => {
    const periodLabel = reportType === 'week'
      ? `Semana ${weekNumber}`
      : format(monthStart, 'MMMM yyyy', { locale: ptBR });

    let text = `📊 *Relatório ${reportType === 'week' ? 'Semanal' : 'Mensal'}*\n`;
    text += `*${businessName}*\n`;
    text += `📅 ${periodLabel} · ${format(periodStart, 'd MMM', { locale: ptBR })} - ${format(periodEnd, 'd MMM', { locale: ptBR })}\n\n`;

    if (metrics.total > 0) {
      text += `✅ ${metrics.executed} de ${metrics.total} publicados (${metrics.executionRate}%)\n\n`;
      if (metrics.byType.reels > 0) text += `🎬 Reels: ${metrics.byType.reels}\n`;
      if (metrics.byType.posts > 0) text += `📷 Posts: ${metrics.byType.posts}\n`;
      if (metrics.byType.stories > 0) text += `⭕ Stories: ${metrics.byType.stories}\n`;

      if (metrics.platforms.length > 0) {
        text += `\n📱 ${metrics.platforms.map(([p, n]) => `${platformNames[p] || p} (${n})`).join(' · ')}\n`;
      }
    } else {
      text += `Nenhum conteúdo planejado neste período.\n`;
    }

    text += `\n— _crIAdores_`;
    return text;
  }, [reportType, weekNumber, monthStart, businessName, periodStart, periodEnd, metrics]);

  // Texto completo para copiar
  const generateFullText = useCallback(() => {
    const periodLabel = reportType === 'week'
      ? `Semana ${weekNumber}`
      : format(monthStart, 'MMMM yyyy', { locale: ptBR });

    let text = `RELATÓRIO ${reportType === 'week' ? 'SEMANAL' : 'MENSAL'}\n`;
    text += `${businessName}\n`;
    text += `${periodLabel} · ${format(periodStart, 'd MMM', { locale: ptBR })} - ${format(periodEnd, 'd MMM yyyy', { locale: ptBR })}\n`;
    text += `${'─'.repeat(40)}\n\n`;

    text += `RESUMO\n`;
    text += `Total: ${metrics.total} conteúdos\n`;
    text += `Publicados: ${metrics.executed} de ${metrics.total} (${metrics.executionRate}%)\n`;
    text += `Reels: ${metrics.byType.reels} · Posts: ${metrics.byType.posts} · Stories: ${metrics.byType.stories}\n`;
    if (metrics.platforms.length > 0) {
      text += `Plataformas: ${metrics.platforms.map(([p, n]) => `${platformNames[p] || p} (${n})`).join(', ')}\n`;
    }
    text += `\n${'─'.repeat(40)}\n\n`;

    contentsByDay.forEach(day => {
      text += `${day.dayName.toUpperCase()} — ${day.dayFormatted}\n\n`;
      day.items.forEach((item, idx) => {
        const typeLabel = contentTypeConfig[item.content_type]?.label || item.content_type;
        const title = item.title || `${typeLabel} #${idx + 1}`;
        const status = statusConfig[item.status]?.label || item.status;

        text += `  • [${typeLabel}] ${title}\n`;
        text += `    Status: ${status}`;
        if (item.scheduled_time) text += ` · Horário: ${item.scheduled_time}`;
        if (item.platforms?.length) text += ` · ${item.platforms.map(p => platformNames[p] || p).join(', ')}`;
        text += `\n`;
        if (item.description) text += `    ${item.description}\n`;
        if (item.briefing) text += `    Briefing: ${item.briefing}\n`;
        text += `\n`;
      });
    });

    text += `${'─'.repeat(40)}\n`;
    text += `Relatório gerado via crIAdores\n`;
    text += `${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;

    return text;
  }, [reportType, weekNumber, monthStart, businessName, periodStart, periodEnd, metrics, contentsByDay]);

  const handleWhatsApp = () => {
    const text = generateWhatsAppText();
    const encodedText = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleCopy = async () => {
    const text = generateFullText();
    try {
      if (navigator.share) {
        await navigator.share({ title: `Relatório - ${businessName}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        showToast('Relatório copiado!');
      }
    } catch {
      await navigator.clipboard.writeText(text);
      showToast('Relatório copiado!');
    }
  };

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { generateReportPDF } = await import('./generateReportPDF');
      generateReportPDF({
        businessName,
        reportType,
        periodStart,
        periodEnd,
        weekNumber,
        metrics,
        contentsByDay,
        docId
      });
      showToast('PDF exportado!');
    } catch (error) {
      console.error('[WeeklyReportModal] Erro ao exportar PDF:', error);
      showToast('Erro ao gerar PDF');
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, businessName, reportType, periodStart, periodEnd, weekNumber, metrics, contentsByDay, docId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 lg:p-8">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[95vh] bg-[#F5F5F7] rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col">

        {/* Top Bar */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
              <Layers className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-600 hidden sm:inline">Relatório</span>
          </div>

          {/* Toggle */}
          <div className="bg-slate-100 p-1 rounded-full flex order-3 md:order-none w-full md:w-auto justify-center">
            <button
              onClick={() => setReportType('week')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                reportType === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setReportType('month')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                reportType === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              Mensal
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleWhatsApp}
              className="h-9 px-3 md:px-4 rounded-full bg-[#25D366] text-xs font-semibold text-white hover:bg-[#20BD5A] transition-colors shadow-sm flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleCopy}
              className="h-9 px-3 md:px-4 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copiar</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="h-9 px-3 md:px-5 rounded-full bg-[#1d1d1f] text-xs font-semibold text-white hover:bg-black transition-transform active:scale-95 shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isExporting ? 'Gerando...' : 'PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Paper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <div className="pdf-paper max-w-4xl mx-auto bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden min-h-[600px] flex flex-col">

            {/* Header */}
            <header className="px-6 md:px-12 pt-10 md:pt-16 pb-6 md:pb-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 md:mb-10">
                <div>
                  <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-3">
                    Relatório {reportType === 'week' ? 'Semanal' : 'Mensal'}
                  </p>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] mb-1">{businessName}.</h1>
                  <p className="text-base md:text-lg text-slate-500 font-medium capitalize">
                    {reportType === 'week' ? `Semana ${weekNumber}` : format(monthStart, 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="bg-[#F5F5F7] px-4 py-2 rounded-xl flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Ativo</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300" />
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(periodStart, 'd MMM', { locale: ptBR })} - {format(periodEnd, 'd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {/* Total - destaque */}
                <div className="bg-[#1d1d1f] rounded-2xl p-4 md:p-5 flex flex-col justify-between h-28 md:h-32">
                  <Layout className="w-5 h-5 text-white/50" />
                  <div>
                    <span className="text-3xl md:text-4xl font-bold block text-white">{metrics.total}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Total</span>
                  </div>
                </div>
                {(['reels', 'story', 'post'] as const).map(type => {
                  const cfg = contentTypeConfig[type];
                  const Icon = cfg.icon;
                  const count = type === 'reels' ? metrics.byType.reels : type === 'story' ? metrics.byType.stories : metrics.byType.posts;
                  return (
                    <div key={type} className="bg-[#F5F5F7] rounded-2xl p-4 md:p-5 flex flex-col justify-between h-28 md:h-32">
                      <Icon className="w-5 h-5 text-slate-400" />
                      <div>
                        <span className="text-2xl md:text-3xl font-bold block text-[#1d1d1f]">{count}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{cfg.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Execution Rate Bar */}
              <div className="bg-[#F5F5F7] rounded-2xl p-4 md:p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Taxa de Publicação
                  </span>
                  <span className="text-sm font-bold text-[#1d1d1f]">
                    {metrics.executed} de {metrics.total} ({metrics.executionRate}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.executionRate}%` }}
                  />
                </div>
              </div>

              {/* Platforms + Status Row */}
              <div className="flex flex-col md:flex-row gap-3">
                {/* Plataformas */}
                {metrics.platforms.length > 0 && (
                  <div className="flex-1 bg-[#F5F5F7] rounded-2xl p-4 md:p-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Plataformas</p>
                    <div className="flex flex-wrap gap-2">
                      {metrics.platforms.map(([platform, count]) => (
                        <div key={platform} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-100">
                          <PlatformIcon platform={platform} size={14} className="text-slate-700" />
                          <span className="text-xs font-semibold text-slate-700">{platformNames[platform] || platform}</span>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status breakdown */}
                <div className={`${metrics.platforms.length > 0 ? 'md:w-56 flex-shrink-0' : 'flex-1'} bg-[#F5F5F7] rounded-2xl p-4 md:p-5`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Status</p>
                  <div className="space-y-2">
                    {Object.entries(metrics.byStatus)
                      .filter(([, count]) => count > 0)
                      .map(([status, count]) => {
                        const cfg = statusConfig[status];
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              <span className="text-xs font-medium text-slate-600">{cfg.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800">{count}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </header>

            {/* Content Timeline */}
            <div className="flex-1 px-6 md:px-12 py-8 md:py-12 space-y-10 md:space-y-14">

              {contentsByDay.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum conteúdo planejado</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Adicione conteúdos no calendário para gerar o relatório.
                  </p>
                </div>
              ) : (
                contentsByDay.map((day) => (
                  <div key={day.date.toISOString()}>
                    {/* Day Header */}
                    <div className="flex items-baseline gap-3 mb-6 pb-3 border-b border-slate-100">
                      <h3 className="text-xl md:text-2xl font-bold text-[#1d1d1f] capitalize">{day.dayName}</h3>
                      <span className="text-sm font-medium text-slate-400">{day.dayFormatted}</span>
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full ml-auto">
                        {day.items.length} {day.items.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-5">
                      {day.items.map((item, itemIdx) => (
                        <div key={item.id} className="relative pl-6 md:pl-8 border-l-2 border-slate-100">
                          {/* Timeline dot */}
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            item.is_executed ? 'bg-green-500' : 'bg-slate-200'
                          }`} />

                          {/* Item Header */}
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <TypeIcon type={item.content_type} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base md:text-lg font-semibold text-slate-900 leading-tight">
                                {item.title || `${contentTypeConfig[item.content_type]?.label || 'Conteúdo'} #${itemIdx + 1}`}
                              </h4>
                              {/* Meta row */}
                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <StatusBadge status={item.status} />
                                {item.scheduled_time && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {item.scheduled_time}
                                  </span>
                                )}
                                {item.platforms && item.platforms.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    {item.platforms.map(p => (
                                      <div key={p} className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center" title={platformNames[p] || p}>
                                        <PlatformIcon platform={p} size={12} className="text-slate-500" />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Content details */}
                          <div className="pl-10 md:pl-10 space-y-3 mt-3">
                            {item.description && (
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {item.briefing && (
                              <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-100/60">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Briefing</p>
                                </div>
                                <p className="text-xs text-amber-800/80 leading-relaxed whitespace-pre-wrap">
                                  {item.briefing}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <footer className="bg-[#F9F9FB] border-t border-slate-100 p-8 md:p-12 mt-auto">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent max-w-xs mb-2" />
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">Relatório gerado pela plataforma</p>
                <div className="flex items-baseline justify-center select-none">
                  <span className="text-2xl md:text-3xl font-sans tracking-tight leading-none">
                    <span className="text-slate-500 font-light">cr</span>
                    <span className="text-[#1d1d1f] font-bold">IA</span>
                    <span className="text-slate-500 font-light">dores</span>
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Doc {docId}</span>
                  <span>·</span>
                  <span>{format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#1d1d1f] text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm font-medium">
            <Check className="w-4 h-4 text-green-400" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
