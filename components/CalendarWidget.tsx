'use client';

import React, { useState, useEffect } from 'react';
import { listCalendarEvents } from '@/app/actions/calendarActions';

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  description?: string;
  location?: string;
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await listCalendarEvents();
      if (result.success) {
        setEvents(result.events);
      }
    } catch (err) {
      setError('Erro ao carregar eventos do calendário');
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isToday = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const eventDate = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return eventDate.toDateString() === tomorrow.toDateString();
  };

  const getDateLabel = (dateString: string) => {
    if (isToday(dateString)) return 'Hoje';
    if (isTomorrow(dateString)) return 'Amanhã';
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center">
          <span className="text-xl mr-2">📅</span>
          Próximos Agendamentos
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <span className="ml-3 text-on-surface-variant">Carregando eventos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated p-6">
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center">
          <span className="text-xl mr-2">📅</span>
          Próximos Agendamentos
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-on-surface flex items-center">
          <span className="text-xl mr-2">📅</span>
          Próximos Agendamentos
        </h3>
        <button 
          onClick={loadEvents}
          className="text-sm text-primary hover:text-primary-dark transition-colors"
        >
          🔄 Atualizar
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-sm text-on-surface-variant mb-2">
            Nenhum agendamento encontrado
          </p>
          <p className="text-xs text-on-surface-variant">
            Mova negócios para "Agendamentos" para criar eventos automaticamente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.slice(0, 5).map((event) => (
            <div 
              key={event.id} 
              className="bg-surface-container rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-on-surface text-sm line-clamp-1">
                  {event.summary}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  isToday(event.start.dateTime) 
                    ? 'bg-primary text-on-primary' 
                    : isTomorrow(event.start.dateTime)
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {getDateLabel(event.start.dateTime)}
                </span>
              </div>

              <div className="flex items-center text-xs text-on-surface-variant mb-2">
                <span className="mr-3">
                  🕐 {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                </span>
                {event.location && (
                  <span>
                    📍 {event.location}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          ))}

          {events.length > 5 && (
            <div className="text-center pt-2">
              <span className="text-xs text-on-surface-variant">
                +{events.length - 5} mais eventos
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
