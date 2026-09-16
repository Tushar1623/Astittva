import { Helmet } from 'react-helmet-async';
import { project } from '../data/project';

export default function SEO({ title, description, path = '' }) {
  const fullTitle = title ? `${title} | ${project.name}` : `${project.name} — ${project.tagline}`;
  const desc = description || `Explore residential and commercial plots near New Town Kolkata at ${project.name}. View available plots, pricing, master plan and payment options.`;
  const url = `https://www.riddhibhumi.com${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}
