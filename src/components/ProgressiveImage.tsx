import { useMemo, useState } from "react";
import { buildResponsiveImageSet, cn } from "@/lib/utils";

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
  decoding = "async",
}: ProgressiveImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");
  const resolvedFetchPriority = fetchPriority ?? (priority ? "high" : "auto");

  const sources = useMemo(
    () => buildResponsiveImageSet(src, responsiveWidths, lqipWidth),
    [src, responsiveWidths, lqipWidth],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-200/75 dark:bg-slate-800/70",
        className,
      )}
    >
      <img
        src={sources.lqipSrc}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full scale-110 object-cover blur-2xl",
          loaded ? "opacity-0" : "opacity-100",
        )}
        style={{
          transition:
            "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), filter 300ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />

      <picture>
        {sources.avifSrcSet ? (
          <source type="image/avif" srcSet={sources.avifSrcSet} sizes={sizes} />
        ) : null}
        {sources.webpSrcSet ? (
          <source type="image/webp" srcSet={sources.webpSrcSet} sizes={sizes} />
        ) : null}

        <img
          src={sources.fallbackSrc}
          srcSet={sources.fallbackSrcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={resolvedLoading}
          fetchPriority={resolvedFetchPriority}
          decoding={decoding}
          onLoad={() => setLoaded(true)}
          className={cn(
            "relative z-[1] h-full w-full object-cover transform-gpu [backface-visibility:hidden]",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-md",
            imgClassName,
          )}
          style={{
            transition:
              "opacity 300ms cubic-bezier(0.22, 1, 0.36, 1), filter 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </picture>
    </div>
  );
};

export default ProgressiveImage;
