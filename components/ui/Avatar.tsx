import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circular' | 'rounded' | 'square';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', variant = 'circular', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg'
    };

    const variants = {
      circular: 'rounded-full',
      rounded: 'rounded-xl',
      square: 'rounded-lg'
    };

    const getInitials = (name: string): string => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center bg-primary text-on-primary font-bold overflow-hidden',
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Se a imagem falhar ao carregar, esconde ela para mostrar o fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="select-none">
            {fallback ? getInitials(fallback) : '?'}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
