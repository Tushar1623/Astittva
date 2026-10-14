import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, ArrowUpRight } from "lucide-react";
import api, { isGoogleDriveImage, driveImageUrl } from "@/lib/api";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import { sanitizeBlogHtml } from "@/lib/sanitize";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function blogImage(src) {
  if (!src) return "";
  if (isGoogleDriveImage(src)) return driveImageUrl(src, 1200);
  if (src.startsWith("http")) return src;
  return "";
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/blogs/${slug}`)
      .then(({ data }) => setBlog(data))
      .catch((e) => {
        if (e?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div
        data-testid="blog-detail-loading"
        className="pt-40 text-center text-[#5F5F5F] tracking-[0.3em] uppercase text-xs"
      >
        Loading…
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div
        data-testid="blog-detail-not-found"
        className="pt-40 max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="font-serif-display text-3xl text-ivory mb-4">
          Story not found
        </h2>
        <p className="text-[#5F5F5F] font-light mb-8">
          The story you are looking for may have been moved or unpublished.
        </p>
        <Link to="/blogs" className="btn-outline">
          Back to the Journal
        </Link>
      </div>
    );
  }

  const img = blogImage(blog.featured_image);
  const seoTitle = blog.seo_title || blog.title;
  const seoDesc =
    blog.seo_description ||
    blog.short_description ||
    `${blog.title} — Astittva Marketing editorial.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: seoDesc,
    image: img || undefined,
    datePublished: blog.publish_date || blog.created_at,
    dateModified: blog.updated_at || blog.publish_date || blog.created_at,
    author: {
      "@type": "Organization",
      name: blog.author || "Astittva Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "Astittva Marketing",
      url: "https://astittva.in",
    },
    mainEntityOfPage: `https://astittva.in/blogs/${blog.slug}`,
  };

  const blogBreadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blogs" },
    { name: blog.title, path: `/blogs/${blog.slug}` },
  ];

  return (
    <div data-testid="blog-detail-page" className="relative text-ivory">
      <Seo
        title={`${seoTitle} | Astittva Marketing`}
        description={seoDesc}
        path={`/blogs/${blog.slug}`}
        image={img || undefined}
        type="article"
        publishedTime={blog.publish_date || blog.created_at}
        modifiedTime={blog.updated_at || blog.publish_date || blog.created_at}
        author={blog.author || "Astittva Editorial"}
        schema={[jsonLd, buildBreadcrumbSchema(blogBreadcrumbs)]}
      />

      {/* ============== HERO ============== */}
      <section className="relative pt-32 sm:pt-40 pb-10 sm:pb-14">
        <div className="max-w-[900px] mx-auto px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-[#737373] mb-6 font-sans">
              <Link to="/" className="hover:text-copper transition-colors">Home</Link>
              <span>/</span>
              <Link to="/blogs" className="hover:text-copper transition-colors">The Journal</Link>
              <span>/</span>
              <span className="text-copper font-medium truncate max-w-[280px] sm:max-w-md">{blog.title}</span>
            </nav>

            <Link
              to="/blogs"
              data-testid="back-to-blogs"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#737373] hover:text-copper transition mb-8"
            >
              <ArrowLeft className="w-3 h-3" strokeWidth={1.4} /> The Journal
            </Link>

            <div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#737373] mb-5">
              <span className="flex items-center gap-1.5 text-copper">
                <Calendar className="w-3 h-3" strokeWidth={1.4} />
                {formatDate(blog.publish_date || blog.created_at)}
              </span>
              {blog.author && (
                <>
                  <span>·</span>
                  <span data-testid="blog-author">{blog.author}</span>
                </>
              )}
            </div>

            <h1
              data-testid="blog-title"
              className="section-title text-3xl sm:text-4xl lg:text-5xl leading-[1.1]"
            >
              {blog.title}
            </h1>

            {blog.short_description && (
              <p className="mt-6 text-muted-fg text-lg sm:text-xl leading-[1.7] font-light">
                {blog.short_description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ============== FEATURED IMAGE ============== */}
      {img && (
        <section className="relative pb-10 sm:pb-16">
          <div className="max-w-[1180px] mx-auto px-6 sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative overflow-hidden aspect-[16/9] bg-[#F1E9DF]"
              data-testid="blog-hero-image"
            >
              <img
                src={img}
                alt={blog.title}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* ============== BODY ============== */}
      <section className="relative pb-24">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="blog-prose"
            data-testid="blog-body"
            dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.body) }}
          />

          {/* Contextual Internal Linking */}
          <div className="mt-12 p-6 rounded-[8px] bg-white border border-[#E8DED2] text-[#1C1C1C]">
            <h3 className="font-serif text-lg font-bold mb-2">Planning a property investment in Kolkata?</h3>
            <p className="text-sm text-[#5F5F5F] mb-4">
              Explore verified new launches, check home loan affordability, or schedule a 1-on-1 consultation with our senior advisory team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/properties" className="btn-primary text-xs py-2 px-4">Browse Properties</Link>
              <Link to="/calculators/home-loan-emi" className="btn-outline text-xs py-2 px-4">EMI Calculator</Link>
              <Link to="/contact" className="btn-outline text-xs py-2 px-4">Book Consultation</Link>
            </div>
          </div>

          <div className="mt-16 pt-10 border-t border-[#E8DED2] flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-[#5F5F5F] hover:text-copper transition"
            >
              <ArrowLeft className="w-3 h-3" strokeWidth={1.4} /> Back to the Journal
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-copper hover:text-copper-hover transition"
            >
              Speak to an Advisor <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
