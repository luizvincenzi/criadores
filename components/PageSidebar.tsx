'use client';

import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

interface PageSidebarProps {
  items: SidebarItem[];
  className?: string;
}

export function PageSidebar({ items, className = '' }: PageSidebarProps) {
  return (
    <div className={`page-sidebar ${className}`}>
      {items.map((item) => {
        const ItemWrapper = item.href ? 'a' : 'div';
        
        return (
          <ItemWrapper
            key={item.id}
            href={item.href}
            onClick={item.onClick}
            className={`sidebar-item ${item.active ? 'active' : ''}`}
            title={item.label}
          >
            <div className="sidebar-item-icon">
              {item.icon}
            </div>
            <div className="sidebar-item-label">
              {item.label}
            </div>
          </ItemWrapper>
        );
      })}
    </div>
  );
}

export default PageSidebar;

