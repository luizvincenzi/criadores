'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_value?: string;
  new_value?: string;
  user_id: string;
  user_name: string;
  details?: string;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const { getData } = await import('@/app/actions/sheetsActions');
      const rawData = await getData('Audit_Log');
      
      if (rawData && rawData.length > 1) {
        // Remove cabeçalho e mapeia dados
        const logEntries: AuditLogEntry[] = rawData.slice(1).map((row: any[]) => ({
          id: row[0] || '',
          timestamp: row[1] || '',
          action: row[2] || '',
          entity_type: row[3] || '',
          entity_id: row[4] || '',
          entity_name: row[5] || '',
          old_value: row[6] || '',
          new_value: row[7] || '',
          user_id: row[8] || '',
          user_name: row[9] || '',
          details: row[10] || ''
        })).reverse(); // Mais recentes primeiro

        setLogs(logEntries);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      'business_created': '➕',
      'business_updated': '✏️',
      'business_deleted': '🗑️',
      'business_stage_changed': '🔄',
      'user_login': '🔐',
      'user_logout': '🚪',
      'data_sync': '🔄',
      'export_data': '📤',
      'import_data': '📥'
    };
    return icons[action] || '📝';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'business_created': 'text-green-600',
      'business_updated': 'text-blue-600',
      'business_deleted': 'text-red-600',
      'business_stage_changed': 'text-purple-600',
      'user_login': 'text-green-600',
      'user_logout': 'text-gray-600',
      'data_sync': 'text-blue-600'
    };
    return colors[action] || 'text-gray-600';
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('pt-BR');
    } catch {
      return timestamp;
    }
  };

  const formatAction = (action: string) => {
    const actions: Record<string, string> = {
      'business_created': 'Negócio Criado',
      'business_updated': 'Negócio Atualizado',
      'business_deleted': 'Negócio Excluído',
      'business_stage_changed': 'Status Alterado',
      'user_login': 'Login',
      'user_logout': 'Logout',
      'data_sync': 'Sincronização'
    };
    return actions[action] || action;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-xl">📋</span>
            <span>Log de Auditoria</span>
          </CardTitle>
          <Button 
            variant="outlined" 
            size="sm" 
            onClick={loadAuditLogs}
            loading={loading}
            icon="🔄"
          >
            Carregar Logs
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {logs.length === 0 && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>Nenhum log encontrado. Clique em "Carregar Logs" para buscar.</p>
          </div>
        )}

        {logs.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {getActionIcon(log.action)}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-medium ${getActionColor(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-1">
                    <strong>{log.entity_name}</strong>
                    {log.old_value && log.new_value && (
                      <span className="ml-2">
                        de <span className="font-mono bg-red-100 px-1 rounded">{log.old_value}</span>
                        {' '}para <span className="font-mono bg-green-100 px-1 rounded">{log.new_value}</span>
                      </span>
                    )}
                  </div>
                  
                  {log.details && (
                    <div className="text-xs text-gray-600">
                      {log.details}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-1">
                    por {log.user_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
