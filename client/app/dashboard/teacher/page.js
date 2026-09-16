"use client";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import TeacherDashboardUI from "@/components/TeacherDashboardUI";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  return <TeacherDashboardUI user={user} />;
}
