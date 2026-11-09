import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, BookOpen } from "lucide-react";
import api, { isGoogleDriveImage, driveImageUrl, driveProxyUrl, getGoogleDriveFileId } from "@/lib/api";
import { resolveBlogImage, pickBlogFallback } from "@/lib/blogImages";
import Seo from "@/components/Seo";
import { buildBreadcrumbSchema } from "@/lib/seoConfig";
import SafeImage from "@/components/SafeImage";
import seedBlogs from "@/data/seedBlogs.json";
import ShareButton from "@/components/ShareButton";

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

function BlogCard({ blog, idx }) {
  const img = resolveBlogImage(blog, 900);
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(idx, 8) * 0.05 }}
      className="group bg-white rounded-2xl border border-[#E8DED2] overflow-hidden flex flex-col shadow-xs hover:border-[#D4A359] hover:-translate-y-1 hover:shadow-[0_16px_36px_-10px_rgba(184,115,51,0.18)] transition-all duration-400"
      data-testid={`blog-card-${idx}`}
    >
      <Link
        to={`/blogs/${blog.slug}`}
        data-testid={`blog-link-${blog.slug}`}
        className="block"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#F1E9DF]">
          <SafeImage
            src={blog.featured_image || img}
            alt={blog.title}
            type="blog"
            seed={blog}
            fallbackSrc={pickBlogFallback(blog)}
            width={900}
            priority={idx < 3}
            className="w-full h-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C]/40 via-transparent to-transparent pointer-events-none" />
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
          <h3 className="font-serif-display text-xl sm:text-2xl text-[#1C1C1C] leading-[1.25] group-hover:text-copper transition-colors line-clamp-3 mb-4">
            {blog.title}
          </h3>
        </Link>

        {blog.short_description && (
          <p className="text-[#5F5F5F] text-[15px] font-light leading-[1.7] line-clamp-3 mb-6 flex-1">
            {blog.short_description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#E8DED2]">
          <Link
          to={`/blogs/${blog.slug}`}
          className="mt-auto inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-copper hover:text-copper-hover transition w-fit"
        >
          Read Story
          <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
          <ShareButton
            item={blog}
            title={blog.title}
            description={blog.short_description || ""}
            url={`https://astittva.in/blogs/${blog.slug}`}
            image={img}
            type="blog"
            category={blog.category || ""}
            author={blog.author || ""}
            date={formatDate(blog.publish_date || blog.created_at)}
            variant="iconOnly"
            className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] !p-0"
            label=""
          />
        </div>
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
  const [blogs, setBlogs] = useState(() => {
    try {
      const cached = localStorage.getItem("astitva_cache_blogs");
      if (cached) return JSON.parse(cached);
    } catch {}
    return seedBlogs || [];
  });
  const [loading, setLoading] = useState(() => blogs.length === 0);

  useEffect(() => {
    api
      .get("/blogs")
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          setBlogs(data);
          try {
            localStorage.setItem("astitva_cache_blogs", JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {})
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
    <div data-testid="blogs-list-page" className="relative text-[#1C1C1C]">
      <Seo
        title="Real Estate Blog | Property Insights Kolkata | Astittva"
        description="Read expert analysis on Kolkata real estate, property investment trends, New Town infrastructure updates, and homebuyer advisory guides by Astittva Marketing."
        path="/blogs"
        schema={[jsonLd, buildBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blogs" }])]}
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
                The Astittva Journal · Kolkata Property Insights
              </span>
            </div>
            <h1 className="section-title text-[2rem] sm:text-5xl lg:text-7xl leading-[1.05]">
              Real Estate Blog &amp; Insights
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
          {/* ===================== EDITORIAL OVERVIEW & RESEARCH PILLARS ===================== */}
          <div className="mt-20 pt-16 border-t border-[#E8DED2]">
            <div className="max-w-4xl mx-auto">
              <div className="text-[10px] tracking-[0.35em] uppercase text-[#B87333] font-semibold mb-3">
                Kolkata Property Research &amp; Advisory
              </div>
              <h2 className="font-serif-display text-2xl sm:text-3xl text-[#1C1C1C] mb-6 font-normal">
                About the Astittva Real Estate Blog &amp; Insights Journal
              </h2>

              <div className="space-y-6 text-[#5F5F5F] text-sm sm:text-base leading-relaxed font-light">
                <p>
                  The Astittva Real Estate Blog delivers independent, data-driven market intelligence for homebuyers, NRI investors, and corporate professionals in Kolkata. Real estate is one of the most significant financial commitments an individual or family undertakes; our editorial mission is to demystify complex transaction mechanics, legal title verifications, and micro-market pricing trends with uncompromised clarity.
                </p>

                <div>
                  <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                    Key Editorial Themes &amp; Market Intelligence
                  </h3>
                  <p>
                    Our research essays focus on four fundamental pillars: <strong>Micro-Market Pricing &amp; Appreciation</strong> (tracking price per sq.ft. movements across New Town Action Areas, Rajarhat, EM Bypass, and South Kolkata), <strong>WBRERA &amp; Legal Diligence</strong> (deed examination checklists, sanctioned plan verifications, and promoter track records), <strong>Financial Planning</strong> (home loan interest rate trends, West Bengal stamp duty calculations, rental yields, and capital gains exemptions), and <strong>Urban Infrastructure</strong> (metro corridor expansions including the Orange Line, Green Line, and airport linkages).
                  </p>
                </div>

                <div>
                  <h3 className="font-serif-display text-lg text-[#1C1C1C] mb-2 font-normal text-[#B87333]">
                    Grounded in On-the-Ground Advisory Experience
                  </h3>
                  <p>
                    Unlike generic property portals, every article published in our real estate blog is authored and reviewed in collaboration with Astittva Marketing&apos;s active property advisory desk. We draw on actual transaction histories, developer negotiations, and on-site physical evaluations to ensure our readers receive actionable, authentic insights.
                  </p>
                </div>
              </div>

              <div className="mt-10 p-6 bg-[#F5F1EC] rounded-xl border border-[#E8DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[#1C1C1C] font-medium text-sm">Have a Question About a Kolkata Property?</div>
                  <div className="text-[#5F5F5F] text-xs mt-0.5">Speak with our editorial research team or book an advisor consultation.</div>
                </div>
                <div className="flex items-center gap-3">
                  <Link to="/contact" className="btn-primary text-xs py-2 px-5">Contact Advisory</Link>
                  <Link to="/properties" className="btn-outline text-xs py-2 px-4">Browse Properties</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
