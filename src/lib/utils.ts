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
