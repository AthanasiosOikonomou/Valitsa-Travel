import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[96vh] flex items-center justify-center overflow-hidden px-4 pt-24 pb-12 md:px-8">
      <img
        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2000"
        alt={t("hero.alt")}
        loading="eager"
        fetchpriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.55] animate-scale-hero"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.14),rgba(15,23,42,0.72))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_34%)]" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mx-auto max-w-4xl px-6 py-10 text-center md:px-12 md:py-14">
          <motion.p
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="label-ui text-white/78 mb-5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.35)]"
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
            className="text-hero text-display text-white mb-6 drop-shadow-[0_10px_32px_rgba(0,0,0,0.42)]"
          >
            {t("hero.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="premium-subheading text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto drop-shadow-[0_4px_18px_rgba(0,0,0,0.3)]"
          >
            {t("hero.subtitle")}
          </motion.p>

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
              className="premium-button-light px-10 py-5 text-base"
            >
              {t("hero.cta")}
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
