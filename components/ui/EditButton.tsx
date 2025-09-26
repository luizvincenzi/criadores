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
  
  const baseClasses = "inline-flex items-center gap-1 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  };
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  };
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${iconSizes[size]}`} />
      ) : (
        <Edit3 className={iconSizes[size]} />
      )}
      {children || 'Editar'}
    </button>
  );
}

export default EditButton;
