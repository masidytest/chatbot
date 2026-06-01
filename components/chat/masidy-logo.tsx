"use client";

// Option A: Wordmark only — "masidy" in gradient typography
export function MasidyWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl",
  };

  return (
    <span
      className={`font-bold tracking-tight ${sizes[size]}`}
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      masidy
    </span>
  );
}

// Option B: Icon + wordmark — stylized M spark + "masidy"
export function MasidyBrand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSizes = { sm: 16, md: 20, lg: 32 };
  const s = iconSizes[size];

  return (
    <span className="flex items-center gap-1.5">
      {/* Stylized M icon — neural spark shape */}
      <svg
        fill="none"
        height={s}
        viewBox="0 0 24 24"
        width={s}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="masidy-grad" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {/* M shape with spark/neural style */}
        <path
          d="M3 18V6l4.5 6L12 6l4.5 6L21 6v12"
          stroke="url(#masidy-grad)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        {/* Spark dots */}
        <circle cx="12" cy="6" fill="#8b5cf6" r="1.5" />
        <circle cx="3" cy="6" fill="#6366f1" r="1" opacity="0.6" />
        <circle cx="21" cy="6" fill="#a855f7" r="1" opacity="0.6" />
      </svg>

      <MasidyWordmark size={size} />
    </span>
  );
}

// Option C: Just the M icon (for favicon/small spaces)
export function MasidyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="masidy-icon-grad" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M3 18V6l4.5 6L12 6l4.5 6L21 6v12"
        stroke="url(#masidy-icon-grad)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <circle cx="12" cy="6" fill="#8b5cf6" r="1.5" />
    </svg>
  );
}
