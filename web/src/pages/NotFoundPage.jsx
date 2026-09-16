import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Home, Search, ArrowLeft } from "lucide-react";

/**
 * NotFoundPage — Shown for any unknown public route (NAV-03).
 * Provides clear recovery actions: return home or browse properties.
 * Never implies the user made an error; simply redirects to value.
 */
export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — ASTITTVA MARKETING</title>
        <meta
          name="description"
          content="The page you're looking for isn't here. Browse our property listings or return home."
        />
      </Helmet>

      <main
        id="main-content"
        className="min-h-[80vh] flex items-center justify-center px-5"
        aria-labelledby="not-found-heading"
      >
        <div className="text-center max-w-lg mx-auto py-24">
          {/* Eyebrow */}
          <p className="overline mb-6">404 — Page Not Found</p>

          {/* Headline */}
          <h1
            id="not-found-heading"
            className="section-title text-4xl sm:text-5xl mb-6"
          >
            This page doesn't exist
          </h1>

          {/* Supporting copy */}
          <p className="text-[#5F5F5F] text-base leading-relaxed mb-10 max-w-sm mx-auto">
            The link may have moved or the address may be incorrect. Use the
            options below to get back on track.
          </p>

          {/* Divider */}
          <div className="copper-divider mx-auto mb-10" />

          {/* Recovery actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="btn-primary flex items-center gap-2"
              data-testid="not-found-home-link"
            >
              <Home className="w-4 h-4" strokeWidth={1.5} />
              Return Home
            </Link>
            <Link
              to="/properties"
              className="btn-outline flex items-center gap-2"
              data-testid="not-found-properties-link"
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
              Browse Properties
            </Link>
          </div>

          {/* Browser back hint */}
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mt-8 flex items-center gap-2 text-[#5F5F5F] text-sm mx-auto hover:text-[#B87333] transition-colors"
            data-testid="not-found-back-button"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Go back
          </button>
        </div>
      </main>
    </>
  );
}
