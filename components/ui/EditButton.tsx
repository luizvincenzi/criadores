'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function EditButton({
  onClick,
  variant = 'primary',
  size = 'sm',
  disabled = false,
  loading = false,
  children,
  className = ''
}: EditButtonProps) {

  // Seguindo o padrão exato do site:
  // "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-primary text-sm bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"

  const baseClasses = "inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-sm px-6 py-3 rounded-lg"
  };

  const variantClasses = {
    primary: "btn-primary bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-4 w-4"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${iconSizes[size]} mr-2`} />
      ) : (
        <Edit3 className={`${iconSizes[size]} mr-2`} />
      )}
      {children || 'Editar'}
    </button>
  );
}

export default EditButton;
