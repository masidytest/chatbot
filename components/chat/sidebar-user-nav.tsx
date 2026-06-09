"use client";

import { ChevronUp, LayoutDashboardIcon, SparklesIcon, LanguagesIcon, MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useTranslation, type Language } from "@/lib/i18n/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "./icons";
import { toast } from "./toast";

const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
  it: "Italiano",
};

function emailToHue(email: string): number {
  let hash = 0;
  for (const char of email) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const { t, language, setLanguage, languages, isLoaded } = useTranslation();

  const isGuest = guestRegex.test(data?.user?.email ?? "");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {status === "loading" ? (
              <SidebarMenuButton className="h-10 justify-between rounded-lg bg-transparent text-sidebar-foreground/50 transition-colors duration-150 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <div className="flex flex-row items-center gap-2">
                  <div className="size-6 animate-pulse rounded-full bg-sidebar-foreground/10" />
                  <span className="animate-pulse rounded-md bg-sidebar-foreground/10 text-transparent text-[13px]">
                    Loading...
                  </span>
                </div>
                <div className="animate-spin text-sidebar-foreground/50">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className="h-8 px-2 rounded-lg bg-transparent text-sidebar-foreground/70 transition-colors duration-150 hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                data-testid="user-nav-button"
              >
                <div
                  className="size-5 shrink-0 rounded-full ring-1 ring-sidebar-border/50"
                  style={{
                    background: `linear-gradient(135deg, oklch(0.35 0.08 ${emailToHue(user.email ?? "")}), oklch(0.25 0.05 ${emailToHue(user.email ?? "") + 40}))`,
                  }}
                />
                <span className="truncate text-[13px]" data-testid="user-email">
                  {isGuest ? "Guest" : user?.email}
                </span>
                <ChevronUp className="ml-auto size-3.5 text-sidebar-foreground/50" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-popper-anchor-width) rounded-lg border border-border/60 bg-card/95 backdrop-blur-xl shadow-[var(--shadow-float)]"
            data-testid="user-nav-menu"
            side="top"
          >
            {!isGuest && (
              <>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[13px]"
                  onSelect={() => router.push("/dashboard")}
                >
                  <LayoutDashboardIcon className="size-3.5" />
                  {t("common.dashboard", "Dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[13px] text-orange-500 focus:text-orange-500"
                  onSelect={() => router.push("/pricing")}
                >
                  <SparklesIcon className="size-3.5" />
                  {t("common.upgradePlan", "Upgrade plan")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="cursor-pointer text-[13px] flex items-center gap-2"
              data-testid="user-nav-item-theme"
              onSelect={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? (
                <>
                  <SunIcon className="size-3.5" />
                  {t("common.lightMode", "Light mode")}
                </>
              ) : (
                <>
                  <MoonIcon className="size-3.5" />
                  {t("common.darkMode", "Dark mode")}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {true && (
              <>
                <div className="px-2 py-1.5 text-[13px] flex items-center gap-2">
                  <LanguagesIcon className="size-3.5" />
                  <select
                    className="flex-1 bg-transparent outline-none text-[13px] cursor-pointer text-foreground border-none"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang} className="bg-card text-foreground">
                        {languageNames[lang]}
                      </option>
                    ))}
                  </select>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                className="w-full cursor-pointer text-[13px]"
                onClick={() => {
                  if (status === "loading") {
                    toast({ type: "error", description: "Checking authentication status, please try again!" });
                    return;
                  }
                  if (isGuest) {
                    router.push("/login");
                  } else {
                    signOut({ redirectTo: "/" });
                  }
                }}
                type="button"
              >
                {isGuest ? t("common.loginToAccount", "Login to your account") : t("common.signOut", "Sign out")}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
