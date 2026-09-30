import React from "react";
import { GraduationCap } from "lucide-react";

export function StoofiLogo({ className = "", size = "md" }) {
  const iconSize = size === "lg" ? 36 : size === "sm" ? 22 : 28;
  const textSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className={`flex items-center justify-center gap-2.5 select-none ${className}`}>
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
        <GraduationCap size={24} className="text-white drop-shadow-sm" />
      </div>
      <div className="flex flex-col text-left">
        <span className={`${textSize} font-black tracking-tight text-zinc-900 dark:text-white leading-none`}>
          Stoofi<span className="text-emerald-600 dark:text-emerald-400">.</span>
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-0.5">
          School ERP
        </span>
      </div>
    </div>
  );
}
