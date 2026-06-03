import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://masidy.com";
  return [
    { url: base,               lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${base}/pricing`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/features`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/about`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/legal`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
