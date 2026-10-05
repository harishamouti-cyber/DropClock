import React from "react";

export function DropClockLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="text-zinc-800 dark:text-zinc-200" />
      <path d="M12 7V12L15 14" stroke="#008060" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="3" r="1.5" fill="#008060" />
    </svg>
  );
}
