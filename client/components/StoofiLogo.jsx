import React from "react";

export function StoofiLogo({ className = "", size = "md" }) {
  const heightClass = size === "lg" ? "h-16 sm:h-20" : size === "sm" ? "h-8" : "h-12 sm:h-14";

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Stoofi Logo"
        className={`${heightClass} w-auto object-contain hover:scale-105 transition-transform duration-300`}
      />
    </div>
  );
}

export default StoofiLogo;
