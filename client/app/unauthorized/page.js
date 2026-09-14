'use client';
import Link from 'next/link';
import { ShieldX, LogIn, UserPlus } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 p-6">
      {/* Icon */}
      <div className="w-24 h-24 rounded-3xl bg-zinc-950 flex items-center justify-center mb-8 shadow-xl">
        <ShieldX className="w-12 h-12 text-white" />
      </div>

      {/* Error Code */}
      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-3">
        Error 401 — Unauthorized
      </p>

      {/* Heading */}
      <h1 className="text-4xl font-black text-zinc-900 tracking-tight text-center mb-3">
        Access Denied
      </h1>

      {/* Sub message */}
      <p className="text-sm text-zinc-500 text-center max-w-sm leading-relaxed mb-10">
        You must be logged in to access the dashboard. Please login with your credentials, or register a new account first.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-colors shadow-md"
        >
          <LogIn size={16} />
          Login
        </Link>
        <Link
          href="/register"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Register
        </Link>
      </div>

      {/* Go Home */}
      <Link
        href="/"
        className="mt-6 text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
