import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Masidy — AI That Works Harder",
    short_name: "Masidy",
    description: "Your personal AI assistant. Search the web, get live data, write and code.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#F97316",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/masidy-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        // biome-ignore lint/suspicious/noExplicitAny: Next.js manifest type doesn't include purpose
        purpose: "any maskable" as any,
      },
    ],
    categories: ["productivity", "utilities"],
  };
}
