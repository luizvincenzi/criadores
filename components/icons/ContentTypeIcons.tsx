import React from 'react';

export const contentTypeConfig = {
  post: {
    label: 'Post',
    color: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-blue-500',
    order: 1
  },
  reels: {
    label: 'Reels',
    color: 'bg-purple-500',
    text: 'text-purple-700',
    border: 'border-purple-500',
    order: 2
  },
  story: {
    label: 'Story',
    color: 'bg-pink-500',
    text: 'text-pink-700',
    border: 'border-pink-500',
    order: 3
  }
};

interface ContentTypeIconProps {
  type: 'post' | 'reels' | 'story';
  size?: number;
  className?: string;
}

export function ContentTypeIcon({ type, size = 16, className = '' }: ContentTypeIconProps) {
  const iconProps = {
    width: size,
    height: size,
    className: className || contentTypeConfig[type].text
  };

  if (type === 'post') {
    return (
      <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
    );
  }

  if (type === 'reels') {
    return (
      <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/>
        <line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="2" y1="7" x2="7" y2="7"/>
        <line x1="2" y1="17" x2="7" y2="17"/>
        <line x1="17" y1="7" x2="22" y2="7"/>
        <line x1="17" y1="17" x2="22" y2="17"/>
      </svg>
    );
  }

  // story
  return (
    <svg {...iconProps} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
    </svg>
  );
}

