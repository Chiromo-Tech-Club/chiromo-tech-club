import { SITE_CONFIG } from "@/config/site";
import { absoluteUrl, getSiteUrl } from "@/lib/seo/site-url";

/** Organization + EducationalOrganization JSON-LD for Google rich results. */
export function SiteJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "EducationalOrganization", "StudentOrganization"],
        "@id": `${url}/#organization`,
        name: SITE_CONFIG.name,
        alternateName: ["CTC", "Chiromo Tech Club UoN", "University of Nairobi Chiromo Tech Club"],
        url,
        logo: absoluteUrl("/images/image.svg"),
        description: SITE_CONFIG.description,
        slogan: SITE_CONFIG.tagline,
        email: SITE_CONFIG.contactEmail,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Chiromo",
          addressRegion: "Nairobi",
          addressCountry: "KE",
        },
        areaServed: {
          "@type": "Place",
          name: "University of Nairobi — Chiromo Campus",
        },
        sameAs: [SITE_CONFIG.socials.github, SITE_CONFIG.socials.instagram, SITE_CONFIG.socials.linkedin],
        parentOrganization: {
          "@type": "CollegeOrUniversity",
          name: "University of Nairobi",
          url: "https://www.uonbi.ac.ke",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en-KE",
        potentialAction: {
          "@type": "SearchAction",
          target: `${url}/communities?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD must be raw JSON in the document
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
