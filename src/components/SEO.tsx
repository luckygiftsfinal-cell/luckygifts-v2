import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?:       string;
  description?: string;
  keywords?:    string;
  image?:       string;
  url?:         string;
  type?:        "website" | "product" | "article";
  price?:       string;
  currency?:    string;
  noIndex?:     boolean;
}

const SITE_NAME    = "LuckyGifts";
const DOMAIN       = "https://getluckygifts.shop";
const DEFAULT_IMG  = `${DOMAIN}/images/og-default.jpg`;
const DEFAULT_DESC = "Shop premium lifestyle products and automatically enter life-changing luxury prize draws — Rolex, iPhone, Cash, Cars & more. 250,000+ tickets sold.";
const DEFAULT_KW   = "luxury prizes, win prizes UAE, lucky draw Dubai, win car UAE, win cash prizes, luxury gifts, prize draw online";

export default function SEO({
  title,
  description = DEFAULT_DESC,
  keywords    = DEFAULT_KW,
  image       = DEFAULT_IMG,
  url         = "",
  type        = "website",
  price,
  currency    = "USD",
  noIndex     = false,
}: SEOProps) {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Shop Now & Win Big`;
  const canonicalUrl = `${DOMAIN}${url}`;
  const ogImage      = image.startsWith("http") ? image : `${DOMAIN}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description"  content={description} />
      <meta name="keywords"     content={keywords} />
      <meta name="author"       content={SITE_NAME} />
      <meta name="robots"       content={noIndex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:type"         content={type} />
      <meta property="og:site_name"    content={SITE_NAME} />
      <meta property="og:title"        content={fullTitle} />
      <meta property="og:description"  content={description} />
      <meta property="og:image"        content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url"          content={canonicalUrl} />
      <meta property="og:locale"       content="en_US" />

      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@LuckyGifts" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {type === "product" && price && (
        <>
          <meta property="product:price:amount"   content={price} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}

      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
