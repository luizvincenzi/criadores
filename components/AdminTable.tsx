import React from 'react';

interface AdminTableProps {
  headers: string[];
  data: Record<string, any>[];
  renderRow: (item: Record<string, any>, index: number) => React.ReactNode;
}

export default function AdminTable({
  headers,
  data,
  renderRow
}: AdminTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-outline-variant rounded-2xl p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-on-surface mb-2">
          Nenhum dado encontrado
        </h3>
        <p className="text-sm text-on-surface-variant">
          Os dados aparecerão aqui quando estiverem disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
      {/* Container com scroll horizontal para responsividade */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Cabeçalho da tabela */}
          <thead className="bg-surface-container">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-semibold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Corpo da tabela */}
          <tbody className="divide-y divide-outline-variant">
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-surface-container-low transition-colors"
              >
                {renderRow(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer com informações */}
      <div className="bg-surface-container-low px-6 py-3 border-t border-outline-variant">
        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            Mostrando {data.length} {data.length === 1 ? 'item' : 'itens'}
          </span>
          
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
              Dados atualizados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para células da tabela
export function TableCell({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <td className={`px-6 py-4 text-sm text-on-surface ${className}`}>
      {children}
    </td>
  );
}

// Componente auxiliar para badges em células
export function TableBadge({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "warning" | "error" | "info"; 
}) {
  const variants = {
    default: "bg-surface-container text-on-surface border-outline-variant",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// Componente auxiliar para ações em células
export function TableActions({ 
  children 
}: { 
  children: React.ReactNode; 
}) {
  return (
    <div className="flex items-center space-x-2">
      {children}
    </div>
  );
}

// Componente auxiliar para botões de ação
export function TableActionButton({ 
  onClick, 
  children, 
  variant = "default" 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  variant?: "default" | "primary" | "danger"; 
}) {
  const variants = {
    default: "text-on-surface-variant hover:text-on-surface hover:bg-surface-container",
    primary: "text-primary hover:text-on-primary hover:bg-primary",
    danger: "text-error hover:text-on-error hover:bg-error",
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
