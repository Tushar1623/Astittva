import React from "react";
import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/seoConfig";

/**
 * Universal SEO & OpenGraph Head Tag Component
 *
 * Props:
 *  - title         (string)  Page title. Formatted with branding if not already included.
 *  - description   (string)  Meta & social description.
 *  - path          (string)  Route pathname for canonical & og:url (e.g. "/properties").
 *  - image         (string)  Absolute or relative image URL for social previews.
 *  - type          (string)  og:type — "website", "article", or "product". Default: "website".
 *  - noIndex       (bool)    When true, outputs `noindex, nofollow` (for admin/login).
 *  - jsonLd        (object|array) Structured data schema(s) to embed as JSON-LD.
 *  - schema        (object|array) Alias for jsonLd.
 *  - keywords      (string)  Optional comma-separated keywords.
 *  - publishedTime (string)  ISO date string for articles/blogs.
 *  - modifiedTime  (string)  ISO date string for articles/blogs.
 *  - author        (string)  Author name for articles/blogs.
 */
export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  jsonLd,
  schema,
  publishedTime,
  modifiedTime,
  author,
}) {
  // Ensure path is clean and canonical URL is properly formed (strip query params and hashes for canonical)
  const rawPath = path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const pathWithoutQuery = rawPath.split("?")[0].split("#")[0];
  const cleanCanonical =
    pathWithoutQuery === `${SITE_URL}` || pathWithoutQuery === `${SITE_URL}/`
      ? `${SITE_URL}/`
      : pathWithoutQuery.replace(/\/+$/, "");

  // Clean title: replace HTML entities if accidentally passed
  const cleanTitle = (title || SITE_NAME)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  // Smart title suffix: avoid duplicate brand suffix
  let fullTitle = cleanTitle.toLowerCase().includes("astittva")
    ? cleanTitle
    : `${cleanTitle} | ${SITE_NAME}`;

  // Strict Max 60 characters for SEO Title (PRD Requirement)
  if (fullTitle.length > 60) {
    const brandSuffix = ` | ${SITE_NAME}`;
    if (fullTitle.endsWith(brandSuffix)) {
      const prefix = fullTitle.slice(0, -brandSuffix.length);
      const maxPrefixLen = 60 - brandSuffix.length; // 60 - 21 = 39
      fullTitle = `${prefix.slice(0, maxPrefixLen - 3).trim()}...${brandSuffix}`;
    } else {
      fullTitle = `${fullTitle.slice(0, 57).trim()}...`;
    }
  }

  // Strict Max 155 characters for SEO Meta Description (PRD Requirement)
  let cleanDescription = description ? description.replace(/\s+/g, " ").trim() : "";
  if (cleanDescription.length > 155) {
    const truncated = cleanDescription.slice(0, 152);
    const lastSpace = truncated.lastIndexOf(" ");
    cleanDescription = lastSpace > 110 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`;
  }

  // Ensure absolute image URL for Open Graph / Twitter
  let ogImage = image || DEFAULT_OG_IMAGE;
  if (ogImage && !ogImage.startsWith("http")) {
    ogImage = `${SITE_URL}${ogImage.startsWith("/") ? ogImage : `/${ogImage}`}`;
  }

  // Combine schemas
  const schemasToRender = [];
  if (jsonLd) {
    if (Array.isArray(jsonLd)) schemasToRender.push(...jsonLd);
    else schemasToRender.push(jsonLd);
  }
  if (schema) {
    if (Array.isArray(schema)) schemasToRender.push(...schema);
    else schemasToRender.push(schema);
  }

  return (
    <Helmet prioritizeSeoTags>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      {cleanDescription && <meta name="description" content={cleanDescription} />}
      <link rel="canonical" href={cleanCanonical} />

      {/* Robots Directive */}
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {cleanDescription && <meta property="og:description" content={cleanDescription} />}
      <meta property="og:url" content={cleanCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:locale" content="en_IN" />

      {/* Article Specific Open Graph */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {cleanDescription && <meta name="twitter:description" content={cleanDescription} />}
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {schemasToRender.length > 0 &&
        schemasToRender.map((s, idx) => (
          <script key={idx} type="application/ld+json">
            {JSON.stringify(s)}
          </script>
        ))}
    </Helmet>
  );
}
