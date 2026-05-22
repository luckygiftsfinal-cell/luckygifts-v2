import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  price?: string;
  currency?: string;
  noIndex?: boolean;
}

const SITE_NAME    = "LuckyGifts";
const DOMAIN       = "https://getluckygifts.shop";
const DEFAULT_IMG  = `${DOMAIN}/images/og-default.jpg`;
const DEFAULT_DESC = "Shop premium lifestyle products and automatically enter life-changing luxury prize draws — Rolex, iPhone, Cash, Cars & more. 250,000+ tickets sold.";
const DEFAULT_KW   = "luxury prizes, win prizes UAE, lucky draw Dubai, win car UAE, win cash prizes, luxury gifts, prize draw online";

function setMeta(property: string, content: string, attr = "name") {
  const selector = `meta[${attr}="${property}"]`;
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords    = DEFAULT_KW,
  image       = DEFAULT_IMG,
  url,
  type        = "website",
  price,
  currency    = "USD",
  noIndex     = false,
}: SEOProps) {
  const fullTitle   = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Shop Now & Win Big`;
  const canonicalUrl = url ? `${DOMAIN}${url}` : DOMAIN;
  const ogImage     = image.startsWith("http") ? image : `${DOMAIN}${image}`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Basic meta
    setMeta("description",              description);
    setMeta("keywords",                 keywords);
    setMeta("author",                   SITE_NAME);
    setMeta("robots",                   noIndex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("og:type",                  type,          "property");
    setMeta("og:site_name",             SITE_NAME,     "property");
    setMeta("og:title",                 fullTitle,     "property");
    setMeta("og:description",           description,   "property");
    setMeta("og:image",                 ogImage,       "property");
    setMeta("og:image:width",           "1200",        "property");
    setMeta("og:image:height",          "630",         "property");
    setMeta("og:url",                   canonicalUrl,  "property");
    setMeta("og:locale",                "en_US",       "property");

    // Twitter Card
    setMeta("twitter:card",             "summary_large_image");
    setMeta("twitter:site",             "@LuckyGifts");
    setMeta("twitter:title",            fullTitle);
    setMeta("twitter:description",      description);
    setMeta("twitter:image",            ogImage);

    // Product-specific OG tags
    if (type === "product" && price) {
      setMeta("product:price:amount",   price,    "property");
      setMeta("product:price:currency", currency, "property");
    }

    // Canonical
    setLink("canonical", canonicalUrl);
  }, [fullTitle, description, keywords, ogImage, canonicalUrl, type, price, currency, noIndex]);

  return null;
}
