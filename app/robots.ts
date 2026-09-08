import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/auth/", "/api/", "/verify"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
