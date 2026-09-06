/**
 * Astittva signature ambient glow.
 *
 * A single, near-invisible burgundy radial centered behind the header on every page.
 * Acts like premium lobby lighting — felt, not seen. No bars, no hard edges, no panels.
 *
 * Mobile and desktop render the SAME shape, position, spread, blur and feathering;
 * desktop simply carries a slightly higher peak intensity so the warmth is
 * perceptible on large screens. Mobile keeps the gentler, current values.
 */
export default function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] overflow-hidden"
    >
      {/* ── Mobile (≤ md) burgundy radial — preserved at the current, lighter values ── */}
      <div
        className="absolute left-1/2 top-[-180px] w-[1400px] h-[640px] -translate-x-1/2 rounded-full md:hidden"
        style={{
          background:
            "radial-gradient(closest-side, rgba(94,31,40,0.17) 0%, rgba(94,31,40,0.09) 40%, rgba(94,31,40,0.03) 70%, transparent 100%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute left-1/2 top-[-80px] w-[760px] h-[280px] -translate-x-1/2 rounded-full md:hidden"
        style={{
          background:
            "radial-gradient(closest-side, rgba(184,115,51,0.065) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* ── Desktop (≥ md) burgundy radial — +22% intensity for perceptible warmth ── */}
      <div
        className="absolute left-1/2 top-[-180px] w-[1400px] h-[640px] -translate-x-1/2 rounded-full hidden md:block"
        style={{
          background:
            "radial-gradient(closest-side, rgba(94,31,40,0.21) 0%, rgba(94,31,40,0.11) 40%, rgba(94,31,40,0.04) 70%, transparent 100%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute left-1/2 top-[-80px] w-[760px] h-[280px] -translate-x-1/2 rounded-full hidden md:block"
        style={{
          background:
            "radial-gradient(closest-side, rgba(184,115,51,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
}
