import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://masidy.com"
  ),
  title: {
    default: "Masidy — AI That Works Harder",
    template: "%s | Masidy",
  },
  description:
    "Masidy is your personal AI assistant. Search the web, get live weather and stock prices, write, code, and remember across every conversation.",
  keywords: ["AI", "chatbot", "Masidy", "artificial intelligence", "assistant", "web search AI"],
  authors: [{ name: "Masidy Team" }],
  creator: "Masidy Team",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Masidy",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://masidy.com",
    siteName: "Masidy",
    title: "Masidy — AI That Works Harder",
    description:
      "Your personal AI assistant. Search the web, get live data, write, code, and remember.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Masidy AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Masidy — AI That Works Harder",
    description:
      "Your personal AI. Search the web, get live data, write, and code.",
    images: ["/twitter-image.png"],
  },
  icons: {
    icon: "/masidy-icon.svg",
    shortcut: "/masidy-icon.svg",
    apple: "/masidy-icon.svg",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)",  color: "#09090b" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: service worker registration
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  if(!('serviceWorker' in navigator)) return;
  // Unregister any old broken SW first, then register fresh
  navigator.serviceWorker.getRegistrations().then(function(regs){
    var unreg = regs.map(function(r){ return r.unregister(); });
    return Promise.all(unreg);
  }).then(function(){
    return navigator.serviceWorker.register('/sw.js');
  }).catch(function(){});
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault();
    window.__installPrompt=e;
  });
})();
`.trim(),
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SessionProvider
            basePath={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/auth`}
          >
            <TooltipProvider>{children}</TooltipProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
