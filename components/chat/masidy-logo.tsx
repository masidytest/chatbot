"use client";

// Full logo: icon + MASIDY text
export function MasidyBrand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const heights = { sm: 20, md: 24, lg: 36 };
  const h = heights[size];
  const w = Math.round(h * (200 / 48));
  return (
    <img
      alt="Masidy"
      className="dark:invert"
      height={h}
      src="/masidy-logo.svg"
      style={{ height: h, width: w }}
      width={w}
    />
  );
}

// Icon only: dot grid
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

// Wordmark only (for places that just need the text)
export function MasidyWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" };
  return (
    <span className={`font-bold tracking-tight text-foreground ${sizes[size]}`}>
      MASIDY
    </span>
  );
}
