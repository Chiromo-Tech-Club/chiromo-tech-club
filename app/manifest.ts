import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/config/site";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.name,
    short_name: "CTC",
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0B1B3A",
    theme_color: "#0B1B3A",
    lang: "en-KE",
    categories: ["education", "technology", "community"],
    icons: [
      {
        src: "/images/image.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    id: getSiteUrl(),
  };
}
