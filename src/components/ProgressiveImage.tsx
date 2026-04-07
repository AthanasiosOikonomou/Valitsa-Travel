import { useMemo, useState, useEffect, useRef } from "react";
import { buildResponsiveImageSet, cn } from "@/lib/utils";

export interface StaticImageSources {
  webp: string;
  /** Optional smaller file for browsers that support AVIF. */
  avif?: string;
  /** `<img>` fallback when `<picture>` sources are unsupported (usually same as webp). */
  fallback?: string;
}

interface ProgressiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  responsiveWidths?: number[];
  lqipWidth?: number;
  /** Overrides LQIP URL (e.g. tiny `/hero/hero-lqip.webp` for same-origin heroes). */
  lqipSrc?: string;
  /** Fixed AVIF/WebP files (e.g. under `/public/hero/`). When set, CDN srcset is not used. */
  staticSources?: StaticImageSources;
  decoding?: "sync" | "async" | "auto";
}

const ProgressiveImage = ({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  width,
  height,
  priority = false,
  loading,
  fetchPriority,
  responsiveWidths,
  lqipWidth = 20,
  lqipSrc: lqipSrcProp,
  staticSources,
  decoding = "async",
}: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [showBlur, setShowBlur] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const containerRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

  const sources = useMemo(
    () => buildResponsiveImageSet(src, responsiveWidths, lqipWidth),
    [src, responsiveWidths, lqipWidth],
  );

  const resolvedLqipSrc = staticSources
    ? lqipSrcProp
    : (lqipSrcProp ?? sources.lqipSrc);
  const imgFallbackSrc = staticSources
    ? (staticSources.fallback ?? staticSources.webp)
    : sources.fallbackSrc;
  const imgFallbackSrcSet = staticSources ? undefined : sources.fallbackSrcSet;

  // Intersection Observer for lazy images: start loading at 400px before visibility
  useEffect(() => {
    if (priority || resolvedLoading === "eager") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "400px",
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, resolvedLoading]);

  // Only show blur after 150ms of loading if image hasn't loaded yet
  const handleLoadStart = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      if (!loaded) {
        setShowBlur(true);
      }
    }, 150);
  };

  const handleLoadComplete = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setLoaded(true);
    setShowBlur(false);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-slate-200/75 dark:bg-slate-800/70",
        className,
      )}
    >
      {shouldLoad && showBlur && resolvedLqipSrc ? (
        <img
          src={resolvedLqipSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full scale-110 object-cover blur-2xl",
            loaded ? "opacity-0" : "opacity-100",
          )}
          style={{
            transition:
              "opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), filter 250ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      ) : null}

      {shouldLoad && (
        <picture>
          {staticSources ? (
            <>
              {staticSources.avif ? (
                <source
                  type="image/avif"
                  srcSet={staticSources.avif}
                  sizes={sizes}
                />
              ) : null}
              <source type="image/webp" srcSet={staticSources.webp} sizes={sizes} />
            </>
          ) : (
            <>
              {sources.avifSrcSet ? (
                <source
                  type="image/avif"
                  srcSet={sources.avifSrcSet}
                  sizes={sizes}
                />
              ) : null}
              {sources.webpSrcSet ? (
                <source
                  type="image/webp"
                  srcSet={sources.webpSrcSet}
                  sizes={sizes}
                />
              ) : null}
            </>
          )}

          <img
            src={imgFallbackSrc}
            srcSet={imgFallbackSrcSet}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={resolvedLoading}
            fetchpriority={resolvedFetchPriority}
            decoding={decoding}
            onLoadStart={handleLoadStart}
            onLoad={handleLoadComplete}
            className={cn(
              "relative z-[1] h-full w-full object-cover transform-gpu [backface-visibility:hidden]",
              loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
              imgClassName,
            )}
            style={{
              transition:
                "opacity 250ms cubic-bezier(0.22, 1, 0.36, 1), filter 250ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </picture>
      )}
    </div>
  );
};

export default ProgressiveImage;
