"use client";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminDashboardUI from "@/components/AdminDashboardUI";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  return <AdminDashboardUI user={user} />;
}
