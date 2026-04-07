import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { prefetchTripsRoute } from "@/lib/routePrefetch";
import ProgressiveImage from "@/components/ProgressiveImage";
import {
  getHeroStaticSources,
  HERO_IMAGE_HEIGHT,
  HERO_IMAGE_SRC,
  HERO_IMAGE_WIDTH,
  HERO_LQIP_SRC,
} from "@/lib/heroImage";
import { showTrips } from "@/lib/showTrips";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden px-4 pt-24 pb-12 md:px-8">
      <ProgressiveImage
        src={HERO_IMAGE_SRC}
        staticSources={getHeroStaticSources()}
        {...(HERO_LQIP_SRC ? { lqipSrc: HERO_LQIP_SRC } : {})}
        alt={t("hero.alt")}
        width={HERO_IMAGE_WIDTH}
        height={HERO_IMAGE_HEIGHT}
        priority
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        decoding="sync"
        className="absolute inset-0"
        imgClassName="brightness-[0.55] animate-scale-hero"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.14),rgba(15,23,42,0.72))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_34%)]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center md:px-12 md:py-14">
          <motion.p
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="label-ui text-sm text-white mb-5 hero-copy-depth"
          >
            {t("hero.label")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-hero text-display text-white mb-6 hero-copy-depth-title"
          >
            {t("hero.title")}
          </motion.h1>

          {showTrips ? (
            <motion.p
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="premium-subheading text-white/80 text-xl md:text-2xl mb-10 max-w-2xl mx-auto hero-copy-depth"
            >
              {t("hero.subtitle")}
            </motion.p>
          ) : null}

          {showTrips ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to="/trips"
                onMouseEnter={prefetchTripsRoute}
                onFocus={prefetchTripsRoute}
                onTouchStart={prefetchTripsRoute}
                className="premium-button-light px-10 py-5 text-base"
              >
                {t("hero.cta")}
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
