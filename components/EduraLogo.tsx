import React from "react";

export default function EduraLogo({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 rounded-2xl overflow-hidden shadow-md shadow-indigo-500/25 bg-[#4F46E5] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/edura-logo.png"
        alt="Edura Logo"
        width={size}
        height={size}
        className="w-full h-full object-cover rounded-2xl block"
        loading="eager"
      />
    </div>
  );
}
