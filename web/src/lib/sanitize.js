/**
 * sanitizeBlogHtml — thin wrapper around DOMPurify configured for our blog
 * body content. Even though blog HTML is authored only by authenticated staff
 * (never end users), sanitising provides a defensive-in-depth layer so that a
 * compromised admin account, a copy-pasted snippet containing an inline event
 * handler, or a rogue <script> can never execute in a reader's browser.
 *
 * Allowed tags cover the editorial vocabulary already documented in the blog
 * form placeholder: headings, paragraphs, inline emphasis, links, lists,
 * blockquotes, images, code, and a horizontal rule.
 */
import DOMPurify from "dompurify";

const CONFIG = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "br", "hr", "span", "div",
    "strong", "b", "em", "i", "u", "s", "small", "sub", "sup",
    "a",
    "ul", "ol", "li",
    "blockquote", "cite",
    "img", "figure", "figcaption",
    "code", "pre",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel",           // links
    "src", "alt", "title", "loading",  // images
    "class",                            // editorial class hooks (blog-prose targets)
    "id",
  ],
  // Force every outbound <a> to open safely — appended after sanitisation
  // via ADD_ATTR + hooks below.
  ALLOW_DATA_ATTR: false,
};

// Every rendered <a target="_blank"> is force-hardened with rel="noopener
// noreferrer" so we never leak window.opener references.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && node.getAttribute("target") === "_blank") {
    node.setAttribute("rel", "noopener noreferrer");
  }
});

export function sanitizeBlogHtml(html) {
  if (!html) return "";
  return DOMPurify.sanitize(String(html), CONFIG);
}

export default sanitizeBlogHtml;
