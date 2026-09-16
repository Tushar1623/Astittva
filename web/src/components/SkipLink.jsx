/**
 * SkipLink — A visually hidden "Skip to main content" anchor that becomes
 * visible on keyboard focus. Required for WCAG 2.2 AA compliance (NAV-03).
 *
 * The matching target is id="main-content" placed on the <main> element
 * inside PublicLayout.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      data-testid="skip-to-content"
    >
      Skip to main content
    </a>
  );
}
