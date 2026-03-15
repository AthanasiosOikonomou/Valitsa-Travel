import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Check } from "lucide-react";
import type { Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

interface TripDetailProps {
  trip: Trip;
  onClose: () => void;
}

const tabKeys = ["description", "program", "included"] as const;

const TripDetail = ({ trip, onClose }: TripDetailProps) => {
  const [activeTab, setActiveTab] = useState<string>("description");
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[110] p-3.5 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7">
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={trip.image}
            alt={trip.title}
            className="w-full aspect-[16/10] object-cover rounded-[2rem] mb-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-4 text-foreground-muted text-sm mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} /> {trip.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {trip.duration}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl text-display mb-6">{trip.title}</h2>

            <div className="flex gap-2 flex-wrap mb-10">
              {trip.tags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-muted rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b border-border">
              {tabKeys.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-3 text-sm font-semibold transition-colors duration-250 ${
                    activeTab === tab ? "text-foreground" : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {t(`detail.${tab}`)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "description" && (
                  <p className="text-body-prose text-lg leading-relaxed">{trip.description}</p>
                )}
                {activeTab === "program" && (
                  <ul className="space-y-4">
                    {trip.program.map((day, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-body-prose pt-1">{day}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === "included" && (
                  <ul className="space-y-3">
                    {trip.included.map((item, i) => (
                      <li key={i} className="flex gap-3 items-center text-body-prose">
                        <Check size={16} className="text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right column — sticky form */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border p-8 md:p-10 rounded-[2rem]"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="label-ui text-foreground-muted mb-1">{t("detail.startingFrom")}</p>
                  <p className="text-3xl font-bold">{trip.price}</p>
                </div>
                <span className="label-ui text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  {trip.duration}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-6">{t("detail.expressInterest")}</h3>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check size={28} className="text-primary" />
                  </div>
                  <p className="font-semibold text-lg mb-1">{t("detail.inquirySent")}</p>
                  <p className="text-foreground-muted text-sm">{t("detail.inquiryMsg")}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      maxLength={100}
                      value={formData.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      className="bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-shadow"
                      placeholder={t("detail.firstName")}
                    />
                    <input
                      required
                      maxLength={100}
                      value={formData.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      className="bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-shadow"
                      placeholder={t("detail.lastName")}
                    />
                  </div>
                  <input
                    required
                    type="email"
                    maxLength={255}
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-shadow"
                    placeholder={t("detail.email")}
                  />
                  <input
                    type="tel"
                    maxLength={20}
                    value={formData.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    className="w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 transition-shadow"
                    placeholder={t("detail.mobile")}
                  />
                  <textarea
                    maxLength={1000}
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground h-28 resize-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                    placeholder={t("detail.message")}
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors duration-250 min-h-[56px]"
                  >
                    {t("detail.sendInquiry")}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripDetail;
