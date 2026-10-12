'use client';

import React from 'react';
import StoofiAiChatBox from '@/components/ai/StoofiAiChatBox';

export default function TeacherChatBoxPage() {
  return <StoofiAiChatBox forcedRole="Teacher" pageTitle="Teacher AI Assistant" />;
}
