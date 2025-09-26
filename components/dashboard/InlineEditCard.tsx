'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import EditButton from '@/components/ui/EditButton';

interface InlineEditCardProps {
  title: string;
  value: string | number;
  unit?: string;
  type?: 'text' | 'number' | 'select';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  onSave: (value: string | number) => Promise<void>;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  formatDisplay?: (value: string | number) => string;
}

export function InlineEditCard({
  title,
  value,
  unit = '',
  type = 'text',
  options = [],
  min,
  max,
  step,
  onSave,
  className = '',
  disabled = false,
  placeholder,
  formatDisplay
}: InlineEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = formatDisplay ? formatDisplay(value) : `${value}${unit}`;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        {!isEditing && !disabled && (
          <EditButton
            onClick={() => setIsEditing(true)}
            size="sm"
            variant="secondary"
          />
        )}
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          {/* Input Field */}
          <div className="relative">
            {type === 'select' ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={loading}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={editValue}
                onChange={(e) => setEditValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                onKeyDown={handleKeyPress}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={loading}
                autoFocus
              />
            )}
            {unit && type === 'number' && (
              <span className="absolute right-3 top-2 text-sm text-gray-500">
                {unit}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Salvar
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Cancelar
            </button>
          </div>

          {/* Helper Text */}
          {type === 'number' && (min !== undefined || max !== undefined) && (
            <p className="text-xs text-gray-500">
              {min !== undefined && max !== undefined
                ? `Valor entre ${min} e ${max}`
                : min !== undefined
                ? `Valor mínimo: ${min}`
                : `Valor máximo: ${max}`}
            </p>
          )}
        </div>
      ) : (
        <div className="text-lg font-semibold text-gray-900">
          {displayValue}
        </div>
      )}
    </div>
  );
}

export default InlineEditCard;
