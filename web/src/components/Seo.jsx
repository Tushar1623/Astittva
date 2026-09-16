import { Helmet } from "react-helmet-async";

const SITE_URL = "https://astittva.in";
const SITE_NAME = "Astittva Marketing";
const DEFAULT_OG_IMAGE =
  "https://customer-assets.emergentagent.com/job_astitva-luxury-1/artifacts/c212hx9z_ASTITTVA%20MARKETING%20FINAL.png";

/**
 * Universal SEO head tags for every public route.
 *
 * Props
 *  - title         (string)  Required. Becomes the document title and og:title.
 *  - description   (string)  Required. Meta description + og/twitter description.
 *  - path          (string)  e.g. "/about". Builds the canonical URL and og:url.
 *  - image         (string)  Optional og:image (absolute URL). Defaults to brand logo.
 *  - type          (string)  og:type — "website" | "article" | "product" etc.
 *  - noIndex       (bool)    Adds `robots: noindex,nofollow` when true.
 *  - jsonLd        (object|array) JSON-LD structured data to embed.
 *  - keywords      (string)  Optional comma-separated keywords.
 */
export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
  jsonLd,
  keywords,
}) {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle =
    title.toLowerCase().includes("astittva") ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large"} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
}
