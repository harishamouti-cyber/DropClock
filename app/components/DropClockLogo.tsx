import React from "react";

export function DropClockLogo({ className = "w-5 h-5 text-zinc-900 inline-block" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Precision clock dial */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Clock hands showing countdown cutoff */}
      <path
        d="M12 7.5V12L15 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Emerald transit droplet notch */}
      <path
        d="M12 1.75C10.9 3 10.2 4 10.2 4.9C10.2 5.95 11.05 6.75 12 6.75C12.95 6.75 13.8 5.95 13.8 4.9C13.8 4 13.1 3 12 1.75Z"
        fill="#008060"
      />
    </svg>
  );
}
