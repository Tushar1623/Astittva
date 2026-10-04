import AboutPage from "./AboutPage";

/**
 * ContactPage
 * Re-exports the integrated About & Contact experience with automatic scroll to the contact form.
 */
export default function ContactPage() {
  return <AboutPage scrollToContact={true} />;
}
