import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function optimizeImageUrl(src: string, width?: number) {
  if (!src) return src;

  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();

    if (host.includes("images.unsplash.com")) {
      url.searchParams.set("auto", "format,compress");
      url.searchParams.set("fit", "crop");
      if (width) {
        url.searchParams.set("w", String(width));
      }
      url.searchParams.set("q", "80");
      return url.toString();
    }

    if (host.includes("images.prismic.io")) {
      url.searchParams.set("auto", "format,compress");
      if (width) {
        url.searchParams.set("w", String(width));
      }
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}

type ModernFormat = "avif" | "webp" | "jpg";

const DEFAULT_RESPONSIVE_WIDTHS = [480, 768, 1024, 1280, 1600, 2000];

const buildCdnImageUrl = (
  src: string,
  width: number,
  quality: number,
  format?: ModernFormat,
) => {
  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();

    if (host.includes("images.unsplash.com")) {
      url.searchParams.set("auto", "format,compress");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      if (format) {
        url.searchParams.set("fm", format);
      }
      return url.toString();
    }

    if (host.includes("images.prismic.io")) {
      url.searchParams.set("auto", "format,compress");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      if (format) {
        url.searchParams.set("fm", format);
      }
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
};

const isCdnOptimizable = (src: string) => {
  try {
    const host = new URL(src).hostname.toLowerCase();
    return (
      host.includes("images.unsplash.com") || host.includes("images.prismic.io")
    );
  } catch {
    return false;
  }
};

export function buildResponsiveImageSet(
  src: string,
  widths: number[] = DEFAULT_RESPONSIVE_WIDTHS,
  lqipWidth = 20,
) {
  const isOptimizable = isCdnOptimizable(src);
  const sortedWidths = [...widths].sort((a, b) => a - b);

  if (!isOptimizable) {
    return {
      fallbackSrc: src,
      fallbackSrcSet: undefined as string | undefined,
      avifSrcSet: undefined as string | undefined,
      webpSrcSet: undefined as string | undefined,
      lqipSrc: src,
    };
  }

  const buildSrcSet = (format?: ModernFormat, quality = 78) =>
    sortedWidths
      .map(
        (width) => `${buildCdnImageUrl(src, width, quality, format)} ${width}w`,
      )
      .join(", ");

  const largestWidth = sortedWidths[sortedWidths.length - 1];

  return {
    fallbackSrc: buildCdnImageUrl(src, largestWidth, 80, "jpg"),
    fallbackSrcSet: buildSrcSet("jpg", 80),
    avifSrcSet: buildSrcSet("avif", 62),
    webpSrcSet: buildSrcSet("webp", 72),
    lqipSrc: buildCdnImageUrl(src, lqipWidth, 30, "jpg"),
  };
}
