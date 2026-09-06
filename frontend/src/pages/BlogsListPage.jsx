import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, BookOpen } from "lucide-react";
import api, { fileUrl } from "@/lib/api";
import Seo from "@/components/Seo";

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
  if (src.startsWith("http")) return src;
  return fileUrl(src);
}

function BlogCard({ blog, idx }) {
  const img = blogImage(blog.featured_image);
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(idx, 8) * 0.05 }}
      className="group luxury-card overflow-hidden flex flex-col"
      data-testid={`blog-card-${idx}`}
    >
      <Link
        to={`/blogs/${blog.slug}`}
        data-testid={`blog-link-${blog.slug}`}
        className="block"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F1E9DF]">
          {img ? (
            <img
              loading="lazy"
              src={img}
              alt={blog.title}
              className="w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-copper/50">
              <BookOpen className="w-10 h-10" strokeWidth={1.1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/40 via-transparent to-transparent" />
        </div>
      </Link>

      <div className="p-7 sm:p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-[#737373] mb-5">
          <span className="flex items-center gap-1.5 text-copper">
            <Calendar className="w-3 h-3" strokeWidth={1.4} />
            {formatDate(blog.publish_date || blog.created_at)}
          </span>
          {blog.author && (
            <>
              <span>·</span>
              <span>{blog.author}</span>
            </>
          )}
        </div>

        <Link to={`/blogs/${blog.slug}`} className="block">
          <h3 className="font-serif-display text-xl sm:text-2xl text-ivory leading-[1.25] group-hover:text-copper transition-colors line-clamp-3 mb-4">
            {blog.title}
          </h3>
        </Link>

        {blog.short_description && (
          <p className="text-[#5F5F5F] text-[15px] font-light leading-[1.7] line-clamp-3 mb-6 flex-1">
            {blog.short_description}
          </p>
        )}

        <Link
          to={`/blogs/${blog.slug}`}
          className="mt-auto inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-copper hover:text-copper-hover transition w-fit"
        >
          Read Story
          <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}

function BlogSkeleton({ idx }) {
  return (
    <div
      className="luxury-card overflow-hidden animate-pulse"
      style={{ animationDelay: `${idx * 60}ms` }}
      data-testid={`blog-skeleton-${idx}`}
    >
      <div className="aspect-[16/10] bg-white/[0.05]" />
      <div className="p-7">
        <div className="h-3 w-32 bg-white/[0.06] mb-5" />
        <div className="h-5 w-[85%] bg-white/[0.08] mb-3" />
        <div className="h-5 w-[60%] bg-white/[0.08] mb-6" />
        <div className="h-3 w-full bg-white/[0.04] mb-2" />
        <div className="h-3 w-[80%] bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function BlogsListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/blogs")
      .then(({ data }) => setBlogs(Array.isArray(data) ? data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Astittva Marketing Blog",
    url: "https://astittva.in/blogs",
    publisher: {
      "@type": "Organization",
      name: "Astittva Marketing",
      url: "https://astittva.in",
    },
    blogPost: blogs.map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      datePublished: b.publish_date || b.created_at,
      url: `https://astittva.in/blogs/${b.slug}`,
    })),
  };

  return (
    <div data-testid="blogs-list-page" className="relative text-ivory">
      <Seo
        title="Blogs · Luxury Real Estate Perspectives from Kolkata & Beyond"
        description="Editorial insights on Kolkata luxury real estate, New Town & Rajarhat corridors, investor strategy, and global property intelligence — curated by Astittva Marketing."
        path="/blogs"
        keywords="Astittva blogs, Kolkata real estate blog, luxury property insights, New Town Rajarhat editorial, real estate investment articles India"
        jsonLd={jsonLd}
      />

      {/* ============== HERO ============== */}
      <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-20 overflow-hidden">
        <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-4xl"
          >
            <div className="eyebrow-line mb-6 sm:mb-8">
              <span className="text-[10px] tracking-[0.5em] uppercase text-[#5F5F5F]">
                ASTITTVA Editorial
              </span>
            </div>
            <h1 className="section-title text-[2rem] sm:text-5xl lg:text-7xl leading-[1.05]">
              The Astittva Journal
            </h1>
            <p className="mt-6 sm:mt-8 text-muted-fg text-base sm:text-lg max-w-3xl leading-[1.75] font-light">
              Slow-read essays on Kolkata luxury real estate, investor strategy, and the
              micro-market shifts shaping tomorrow&apos;s premium addresses.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============== BLOG GRID ============== */}
      <section
        data-testid="blog-grid-section"
        className="relative py-12 sm:py-20 border-t border-copper/10"
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-16">
          {loading ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              data-testid="blogs-loading"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogSkeleton key={i} idx={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div
              className="text-center py-24 border border-[#E8DED2] bg-white/60"
              data-testid="blogs-empty"
            >
              <BookOpen
                className="w-10 h-10 text-copper/60 mx-auto mb-6"
                strokeWidth={1.1}
              />
              <p className="text-[#5F5F5F] font-light italic max-w-md mx-auto leading-relaxed">
                The Journal is being prepared. New editorial pieces will appear here shortly.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              data-testid="blogs-grid"
            >
              {blogs.map((b, i) => (
                <BlogCard key={b.id} blog={b} idx={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
