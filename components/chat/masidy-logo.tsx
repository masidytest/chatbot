"use client";

// Full logo: orange dot grid icon + MASIDY text (black/white per theme)
export function MasidyBrand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scales = { sm: 0.45, md: 0.55, lg: 0.82 };
  const s = scales[size];
  const w = Math.round(200 * s);
  const h = Math.round(48 * s);

  return (
    <svg
      fill="none"
      height={h}
      viewBox="0 0 200 48"
      width={w}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dot grid - always orange */}
      <circle cx="8" cy="8" fill="#F97316" r="5" />
      <circle cx="22" cy="8" fill="#F97316" r="5" />
      <circle cx="36" cy="8" fill="#F97316" r="5" />
      <circle cx="8" cy="24" fill="#F97316" r="5" />
      <circle cx="22" cy="24" fill="#F97316" r="5" />
      <circle cx="8" cy="40" fill="#F97316" r="5" />
      <circle cx="22" cy="40" fill="#F97316" r="5" />
      <circle cx="36" cy="40" fill="#F97316" r="5" />
      <line stroke="#F97316" strokeLinecap="round" strokeWidth="3" x1="8" x2="22" y1="8" y2="24" />
      <line stroke="#F97316" strokeLinecap="round" strokeWidth="3" x1="22" x2="36" y1="8" y2="8" />
      <line stroke="#F97316" strokeLinecap="round" strokeWidth="3" x1="22" x2="8" y1="24" y2="40" />
      <line stroke="#F97316" strokeLinecap="round" strokeWidth="3" x1="22" x2="36" y1="24" y2="40" />
      {/* MASIDY text - currentColor = black in light, white in dark */}
      <text
        dominantBaseline="auto"
        fill="currentColor"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="-0.5"
        x="52"
        y="34"
      >
        MASIDY
      </text>
    </svg>
  );
}

// Icon only: dot grid - always orange
export function MasidyIcon({ size = 20 }: { size?: number }) {
  return (
    <img
      alt="Masidy"
      height={size}
      src="/masidy-icon.svg"
      style={{ height: size, width: size }}
      width={size}
    />
  );
}

// Wordmark only
export function MasidyWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" };
  return (
    <span className={`font-bold tracking-tight text-foreground ${sizes[size]}`}>
      MASIDY
    </span>
  );
}
