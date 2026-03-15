import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageSquare, Send, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactModal = ({ open, onClose }: ContactModalProps) => {
  const { t } = useLanguage();
  const [view, setView] = useState<"options" | "form">("options");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", mobile: "", email: "", message: "" });

  const handleClose = () => {
    onClose();
    setTimeout(() => { setView("options"); setSent(false); }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-card border border-border rounded-3xl w-full max-w-lg overflow-hidden"
            style={{ boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold">{t("contact.title")}</h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {view === "options" && !sent && (
                <div className="space-y-4">
                  {/* Call Us */}
                  <a
                    href="tel:+302101234567"
                    className="flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t("contact.callUs")}</p>
                      <p className="text-foreground-muted text-sm">+30 210 123 4567</p>
                    </div>
                  </a>

                  {/* Send Message */}
                  <button
                    onClick={() => setView("form")}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all duration-200 group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t("contact.sendMessage")}</p>
                      <p className="text-foreground-muted text-sm">{t("contact.sendMessageDesc")}</p>
                    </div>
                  </button>
                </div>
              )}

              {view === "form" && !sent && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder={t("detail.firstName") + " *"} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input required placeholder={t("detail.lastName") + " *"} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <input required placeholder={t("detail.mobile") + " *"} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input required type="email" placeholder={t("detail.email") + " *"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <textarea required placeholder={t("detail.message")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setView("options")} className="px-5 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                      {t("contact.back")}
                    </button>
                    <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                      <Send size={16} />
                      {t("contact.send")}
                    </button>
                  </div>
                </form>
              )}

              {sent && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
                  <CheckCircle size={48} className="text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">{t("contact.sent")}</h3>
                  <p className="text-foreground-muted text-sm">{t("contact.sentDesc")}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
