'use client';

import React from 'react';
import StoofiAiChatBox from '@/components/ai/StoofiAiChatBox';

export default function StudentChatBoxPage() {
  return <StoofiAiChatBox forcedRole="Student" pageTitle="Student AI Assistant" />;
}
