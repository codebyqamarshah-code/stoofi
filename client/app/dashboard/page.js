'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardUI from '@/components/DashboardUI';

export default function DashboardPage() {
  const { user } = useAuth();
  return <DashboardUI user={user} />;
}
