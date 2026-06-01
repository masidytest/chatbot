"use client";

import { SunDim } from "lucide-react";

export function MasidyWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" };
  return (
    <span className={`font-semibold tracking-tight text-foreground ${sizes[size]}`}>
      masidy
    </span>
  );
}

export function MasidyBrand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const iconSizes = { sm: 16, md: 18, lg: 28 };
  return (
    <span className="flex items-center gap-2">
      <SunDim size={iconSizes[size]} strokeWidth={1.5} className="text-foreground" />
      <MasidyWordmark size={size} />
    </span>
  );
}

export function MasidyIcon({ size = 20 }: { size?: number }) {
  return <SunDim size={size} strokeWidth={1.5} className="text-foreground" />;
}
