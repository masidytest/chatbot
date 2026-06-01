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
  const iconSizes = { sm: 14, md: 16, lg: 26 };
  return (
    <span className="flex items-center gap-1.5">
      <SunDim size={iconSizes[size]} className="text-foreground" />
      <MasidyWordmark size={size} />
    </span>
  );
}

export function MasidyIcon({ size = 20 }: { size?: number }) {
  return <SunDim size={size} className="text-foreground" />;
}
