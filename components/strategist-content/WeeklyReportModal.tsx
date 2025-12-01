'use client';

import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, Download, Share2, Calendar, 
  Video, Image as ImageIcon, Disc, 
  Quote, CheckCircle2, Layout, Layers, Info
} from 'lucide-react';

interface SocialContent {
  id: string;
  content_type: 'post' | 'reels' | 'story';
  scheduled_date: string;
  title?: string;
  description?: string;
  caption?: string;
  is_executed?: boolean;
  [key: string]: any;
}

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: Date;
  monthStart: Date;
  contents: SocialContent[];
  businessName: string;
  viewMode: 'week' | 'month';
}

// Componente de Ícone Minimalista
const TypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ComponentType<any>> = {
    reels: Video,
    story: Disc,
    post: ImageIcon
  };
  const Icon = icons[type] || Layout;
  
  const styles: Record<string, string> = {
    reels: "bg-slate-100 text-slate-900",
    story: "bg-slate-100 text-slate-600",
    post: "bg-slate-100 text-slate-500"
  };

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${styles[type] || styles.post}`}>
      <Icon className="w-4 h-4" />
    </div>
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

  // Determinar período baseado no tipo de relatório
  const periodStart = reportType === 'week' ? weekStart : monthStart;
  const periodEnd = reportType === 'week' 
    ? endOfWeek(weekStart, { weekStartsOn: 1 })
    : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

  // Filtrar conteúdos do período
  const periodContents = useMemo(() => {
    return contents.filter(content => {
      const contentDate = new Date(content.scheduled_date.split('T')[0]);
      return contentDate >= periodStart && contentDate <= periodEnd;
    });
  }, [contents, periodStart, periodEnd]);

  // Agrupar por dia
  const contentsByDay = useMemo(() => {
    const days = eachDayOfInterval({ start: periodStart, end: periodEnd });
    return days.map(day => ({
      date: day,
      dayName: format(day, 'EEEE', { locale: ptBR }),
      dayFormatted: format(day, 'd MMM', { locale: ptBR }),
      items: periodContents.filter(c => {
        const cDate = new Date(c.scheduled_date.split('T')[0]);
        return isSameDay(cDate, day);
      })
    })).filter(d => d.items.length > 0);
  }, [periodContents, periodStart, periodEnd]);

  // Resumo
  const summary = useMemo(() => ({
    reels: periodContents.filter(c => c.content_type === 'reels').length,
    stories: periodContents.filter(c => c.content_type === 'story').length,
    posts: periodContents.filter(c => c.content_type === 'post').length
  }), [periodContents]);

  // Calcular número da semana
  const weekNumber = Math.ceil((weekStart.getDate()) / 7);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `Relatório - ${businessName}`,
        text: `Relatório ${reportType === 'week' ? 'Semanal' : 'Mensal'} de ${businessName}`,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copiado!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[95vh] bg-[#F5F5F7] rounded-[24px] shadow-2xl overflow-hidden z-10 flex flex-col">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center">
              <Layers className="w-4 h-4 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-600">Visualização de Cliente</span>
          </div>

          {/* Report Type Toggle */}
          <div className="bg-slate-100 p-1 rounded-full flex">
            <button
              onClick={() => setReportType('week')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                reportType === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setReportType('month')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                reportType === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
              }`}
            >
              Mensal
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="h-9 px-4 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartilhar
            </button>
            <button
              onClick={handlePrint}
              className="h-9 px-5 rounded-full bg-[#1d1d1f] text-xs font-semibold text-white hover:bg-black transition-transform active:scale-95 shadow-md flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar PDF
            </button>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Paper Container - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-4xl mx-auto bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] rounded-[20px] overflow-hidden print:shadow-none print:rounded-none min-h-[1000px] flex flex-col">

            {/* Modern Header */}
            <header className="px-12 pt-16 pb-8 border-b border-slate-50">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">
                    Relatório {reportType === 'week' ? 'Semanal' : 'Mensal'}
                  </p>
                  <h1 className="text-5xl font-bold tracking-tight text-[#1d1d1f] mb-2">{businessName}.</h1>
                  <p className="text-lg text-slate-500 font-medium">
                    {reportType === 'week' ? `Semana ${weekNumber}` : format(monthStart, 'MMMM yyyy', { locale: ptBR })}
                  </p>
                </div>

                <div className="bg-[#F5F5F7] px-4 py-2 rounded-xl flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Ativo</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300"></div>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(periodStart, 'd MMM', { locale: ptBR })} - {format(periodEnd, 'd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Metrics - Apple Fitness Style */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#F5F5F7] rounded-2xl p-6 flex flex-col items-start justify-between h-32 group hover:bg-[#1d1d1f] hover:text-white transition-colors duration-300">
                  <Video className="w-6 h-6 text-slate-400 group-hover:text-white/60" />
                  <div>
                    <span className="text-3xl font-bold block mb-1">{summary.reels}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-white/60">Reels</span>
                  </div>
                </div>
                <div className="bg-[#F5F5F7] rounded-2xl p-6 flex flex-col items-start justify-between h-32 group hover:bg-[#1d1d1f] hover:text-white transition-colors duration-300">
                  <Disc className="w-6 h-6 text-slate-400 group-hover:text-white/60" />
                  <div>
                    <span className="text-3xl font-bold block mb-1">{summary.stories}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-white/60">Stories</span>
                  </div>
                </div>
                <div className="bg-[#F5F5F7] rounded-2xl p-6 flex flex-col items-start justify-between h-32 group hover:bg-[#1d1d1f] hover:text-white transition-colors duration-300">
                  <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-white/60" />
                  <div>
                    <span className="text-3xl font-bold block mb-1">{summary.posts}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-white/60">Posts</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Content Body */}
            <div className="flex-1 px-12 py-12 space-y-16">

              {contentsByDay.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum conteúdo planejado</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Não há conteúdos agendados para este período. Adicione conteúdos para gerar o relatório.
                  </p>
                </div>
              ) : (
                contentsByDay.map((day) => (
                  <div key={day.date.toISOString()} className="relative">
                    {/* Day Marker */}
                    <div className="flex items-baseline gap-4 mb-8 border-b border-slate-100 pb-4">
                      <h3 className="text-2xl font-bold text-[#1d1d1f] capitalize">{day.dayName}</h3>
                      <span className="text-sm font-medium text-slate-400">{day.dayFormatted}</span>
                    </div>

                    {/* Items List */}
                    <div className="space-y-8">
                      {day.items.map((item, itemIdx) => (
                        <div key={item.id} className="group relative pl-8 border-l-2 border-slate-100 hover:border-slate-300 transition-colors">

                          {/* Glass Dot */}
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-hover:border-slate-400 group-hover:scale-110 transition-all shadow-sm"></div>

                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <TypeIcon type={item.content_type} />
                              <h4 className="text-lg font-semibold text-slate-900">
                                {item.title || `${item.content_type === 'reels' ? 'Reels' : item.content_type === 'story' ? 'Story' : 'Post'} #${itemIdx + 1}`}
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-slate-300 uppercase bg-slate-50 px-2 py-1 rounded">
                              {item.content_type}
                            </span>
                          </div>

                          <div className="pl-11 space-y-4">
                            {item.description && (
                              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {item.description}
                              </p>
                            )}

                            {item.caption && (
                              <div className="bg-[#F9F9FB] rounded-xl p-5 border border-slate-100 relative mt-4">
                                <Quote className="absolute top-4 left-4 w-4 h-4 text-slate-300" />
                                <div className="pl-6">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Legenda</p>
                                  <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                                    {item.caption}
                                  </p>
                                </div>
                              </div>
                            )}

                            {item.is_executed && (
                              <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Publicado</span>
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

            {/* Footer com Branding */}
            <footer className="bg-[#F9F9FB] border-t border-slate-100 p-12 mt-auto print:break-inside-avoid">
              <div className="flex flex-col items-center justify-center gap-4 text-center">

                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent max-w-xs mb-4"></div>

                <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">Relatório criado através da plataforma</p>

                {/* Logo crIAdores */}
                <div className="flex items-baseline justify-center select-none opacity-90 hover:opacity-100 transition-opacity cursor-default">
                  <span className="text-3xl font-sans tracking-tight leading-none">
                    <span className="text-slate-500 font-light">cr</span>
                    <span className="text-[#1d1d1f] font-bold">IA</span>
                    <span className="text-slate-500 font-light">dores</span>
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Doc ID: {Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                  <span>•</span>
                  <span>Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
}

