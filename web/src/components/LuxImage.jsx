/**
 * LuxImage — luxury-caliber responsive image wrapper.
 *
 * Emits a <picture> element that:
 *   1. Serves a WebP mobile crop (~640-720w) to phones via `(max-width: 768px)`
 *   2. Serves a WebP desktop asset to everyone else
 *   3. Falls back to the original JPG/PNG the caller provided
 *
 * The optimiser at /app/scripts/optimize_images.py produces two sibling files
 * next to every original in /app/frontend/public/images:
 *   - <name>.webp        (desktop / retina — max 1920w)
 *   - <name>-mobile.webp (mobile          — max  720w)
 *
 * Pass `src="/images/luxe/foo.jpg"` and this component automatically wires up
 * the two WebP siblings. Fully SSR-safe (no browser APIs), no state, no JS.
 *
 * Props:
 *   - src        (required)  path to the original image, e.g. "/images/foo.jpg"
 *   - alt        (required)  accessible caption
 *   - eager      (bool)      set to true for above-the-fold LCP images. Adds
 *                            loading="eager" + fetchpriority="high". Default: lazy.
 *   - width/height          dimensions to help the browser reserve layout space
 *                            (reduces CLS). Optional.
 *   - all other props (className, style, sizes, onLoad, ...) are forwarded to <img>
 */
export default function LuxImage({
  src,
  alt = "",
  eager = false,
  width,
  height,
  sizes,
  className,
  style,
  ...rest
}) {
  // Only rewrite paths that live inside /images (project assets we've optimised).
  // External URLs, blob URLs, or paths without a supported extension pass through.
  const canOptimise =
    typeof src === "string" &&
    src.startsWith("/images/") &&
    /\.(jpe?g|png)$/i.test(src);

  if (!canOptimise) {
    return (
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
        fetchPriority={eager ? "high" : "auto"}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        style={style}
        {...rest}
      />
    );
  }

  const desktopWebp = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const mobileWebp = src.replace(/\.(jpe?g|png)$/i, "-mobile.webp");

  return (
    <picture>
      <source
        type="image/webp"
        media="(max-width: 768px)"
        srcSet={mobileWebp}
      />
      <source type="image/webp" srcSet={desktopWebp} />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
        fetchPriority={eager ? "high" : "auto"}
        width={width}
        height={height}
        sizes={sizes}
        className={className}
        style={style}
        {...rest}
      />
    </picture>
  );
}
