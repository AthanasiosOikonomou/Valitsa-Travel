import { Helmet } from "react-helmet-async";

const SITE_URL = "https://valitsatravel.gr";

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string;
  lang?: "en" | "gr";
  structuredData?: JsonLd | JsonLd[];
}

const toAbsoluteUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const Seo = ({
  title,
  description,
  path = "/",
  image = "/branding/navbar/logo-light.svg",
  type = "website",
  noindex = false,
  keywords,
  lang = "en",
  structuredData,
}: SeoProps) => {
  const canonicalUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image);
  const fullTitle = title.includes("Valitsa Travel")
    ? title
    : `${title} | Valitsa Travel`;
  const robots = noindex ? "noindex, nofollow" : "index, follow";
  const locale = lang === "gr" ? "el_GR" : "en_US";
  const jsonLdList = Array.isArray(structuredData)
    ? structuredData
    : structuredData
      ? [structuredData]
      : [];

  return (
    <Helmet prioritizeSeoTags>
      <html lang={lang === "gr" ? "el" : "en"} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="author" content="Valitsa Travel" />
      {keywords ? <meta name="keywords" content={keywords} /> : null}

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content="Valitsa Travel" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {jsonLdList.map((schema, idx) => (
        <script key={`jsonld-${idx}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
