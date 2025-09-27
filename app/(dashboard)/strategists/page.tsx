'use client';

import React from 'react';
import StrategistAccessManager from '@/components/StrategistAccessManager';
import { PageGuard } from '@/components/PermissionGuard';

export default function StrategistsPage() {
  return (
    <PageGuard requiredPermission="admin:all">
      <div className="min-h-screen bg-gray-50">
        <StrategistAccessManager />
      </div>
    </PageGuard>
  );
}
