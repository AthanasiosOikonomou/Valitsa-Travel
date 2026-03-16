import { Helmet } from "react-helmet-async";

const SITE_URL = "https://valitsatravel.gr";

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
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
  imageAlt = "Valitsa Travel Logo",
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
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=5"
      />
      {keywords ? <meta name="keywords" content={keywords} /> : null}

      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="el" href={toAbsoluteUrl(path)} />
      <link rel="alternate" hrefLang="en" href={toAbsoluteUrl(path)} />

      <meta property="og:site_name" content="Valitsa Travel" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={locale} />
      {locale === "el_GR" && (
        <meta property="og:locale:alternate" content="en_US" />
      )}
      {locale === "en_US" && (
        <meta property="og:locale:alternate" content="el_GR" />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@valitsatravel" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="theme-color" content="#0f172a" />

      {jsonLdList.map((schema, idx) => (
        <script key={`jsonld-${idx}`} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
