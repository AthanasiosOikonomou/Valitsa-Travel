import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const TermsModal = ({ open, onClose }: TermsModalProps) => {
  const { lang } = useLanguage();
  const isGreek = lang === "gr";

  const modalTitle = isGreek
    ? "Όροι και Προϋποθέσεις Συμμετοχής σε Ταξίδι"
    : "Terms and Conditions of Participation in a Trip";

  const closeLabel = isGreek ? "Κλείσιμο" : "Close";
  const seoDescription = isGreek
    ? "Διαβάστε τους όρους και τις προϋποθέσεις συμμετοχής σε ταξίδι με τη Valitsa Travel."
    : "Read the terms and conditions for participating in a trip with Valitsa Travel.";

  const sectionTitles = isGreek
    ? {
        introduction: "1. Εισαγωγή",
        bookings: "2. Κρατήσεις και Πληρωμές",
        prices: "3. Τιμές και Μεταβολές",
        cancellations: "4. Ακυρώσεις από τον Ταξιδιώτη",
        obligations: "5. Υποχρεώσεις και Ευθύνες της Εταιρείας",
        documents: "6. Ταξιδιωτικά Έγγραφα και Ασφάλιση",
        disputes: "7. Επίλυση Διαφορών",
      }
    : {
        introduction: "1. Introduction",
        bookings: "2. Bookings and Payments",
        prices: "3. Prices and Changes",
        cancellations: "4. Cancellations by the Traveler",
        obligations: "5. Company Obligations and Liability",
        documents: "6. Travel Documents and Insurance",
        disputes: "7. Dispute Resolution",
      };

  const copy = isGreek
    ? {
        introduction:
          'Η συμμετοχή σε οποιοδήποτε ταξίδι του γραφείου μας Valitsa Travel (εφεξής "η Εταιρεία") προϋποθέτει την ανεπιφύλακτη αποδοχή των παρακάτω όρων, οι οποίοι είναι εναρμονισμένοι με την κοινοτική οδηγία (ΕΕ) 2015/2302 και την ελληνική νομοθεσία (Π.Δ. 7/2018).',
        prices:
          "Οι τιμές των ταξιδιών υπολογίζονται με βάση τα κοστολόγια των μεταφορικών μέσων και των συναλλαγματικών ισοτιμιών κατά την ημέρα έκδοσης του προγράμματος.",
        cancellations:
          "Σε περίπτωση ακύρωσης από την πλευρά του πελάτη, ισχύουν ενδεικτικά τα παρακάτω ακυρωτικά:",
        obligations:
          "Η Εταιρεία λειτουργεί ως μεσολαβητής μεταξύ των ταξιδιωτών και των παρόχων υπηρεσιών (αεροπορικές εταιρείες, ξενοδοχεία, μεταφορείς).",
        disputes:
          "Οποιαδήποτε διαφορά προκύψει κατά την εκτέλεση της σύμβασης, θα καταβάλλεται προσπάθεια φιλικής επίλυσης. Εάν αυτό δεν καταστεί δυνατό, αρμόδια είναι τα δικαστήρια της Αθήνας.",
        bookingsList: [
          "Προκαταβολή: Για την επικύρωση της κράτησης απαιτείται προκαταβολή ύψους 30% της συνολικής αξίας.",
          "Εξόφληση: Η πλήρης εξόφληση του ποσού πρέπει να γίνει το αργότερο 21 ημέρες πριν από την αναχώρηση.",
          "Σε περίπτωση μη έγκαιρης εξόφλησης, η Εταιρεία διατηρεί το δικαίωμα να ακυρώσει την κράτηση χωρίς επιστροφή της προκαταβολής.",
        ],
        pricesList: [
          "Η Εταιρεία διατηρεί το δικαίωμα αναπροσαρμογής των τιμών έως και 20 ημέρες πριν την αναχώρηση, σε περίπτωση αυξήσεων στους ναύλους (καύσιμα) ή αλλαγής ισοτιμιών.",
          "Εάν η αύξηση υπερβαίνει το 8% της αξίας του ταξιδιού, ο πελάτης έχει δικαίωμα να ακυρώσει τη συμμετοχή του χωρίς καμία επιβάρυνση.",
        ],
        cancellationsList: [
          "Έως 30 ημέρες πριν: Επιστροφή όλου του ποσού (ενδέχεται να κρατηθούν έξοδα φακέλου).",
          "29 έως 15 ημέρες πριν: Παρακράτηση της προκαταβολής.",
          "14 ημέρες έως την αναχώρηση: Παρακράτηση του 100% της αξίας του ταξιδιού.",
          "Σημείωση: Για ειδικές ναυλώσεις (charter) ή περιόδους αιχμής, οι όροι ακύρωσης ενδέχεται να είναι αυστηρότεροι.",
        ],
        obligationsList: [
          "Δεν φέρει ευθύνη για καθυστερήσεις, αλλαγές δρομολογίων ή ατυχήματα που οφείλονται σε ανωτέρα βία (καιρικές συνθήκες, απεργίες, πολιτικές ταραχές).",
          "Η Εταιρεία δικαιούται να ακυρώσει το ταξίδι εάν η συμμετοχή είναι μικρότερη από τον ελάχιστο απαιτούμενο αριθμό ατόμων, επιστρέφοντας στο ακέραιο τα χρήματα στους συμμετέχοντες.",
        ],
        documentsList: [
          "Έγγραφα: Ο ταξιδιώτης φέρει την αποκλειστική ευθύνη για την κατοχή έγκυρου διαβατηρίου, βίζας ή ταυτότητας νέου τύπου.",
          "Ασφάλιση: Η Εταιρεία διαθέτει Ασφάλεια Αστικής Επαγγελματικής Ευθύνης. Συνιστάται ωστόσο στους ταξιδιώτες η σύναψη προαιρετικής ιδιωτικής ασφάλειας που καλύπτει ακυρωτικά ή ιατρικά έξοδα.",
        ],
      }
    : {
        introduction:
          "Participation in any trip organized by our agency, Valitsa Travel (hereinafter the 'Company'), requires unconditional acceptance of the following terms, aligned with EU Directive 2015/2302 and applicable Greek legislation (P.D. 7/2018).",
        prices:
          "Trip prices are calculated based on transport costs and exchange rates applicable on the day the program is issued.",
        cancellations:
          "In case of cancellation by the customer, the following cancellation policy applies indicatively:",
        obligations:
          "The Company acts as an intermediary between travelers and service providers (airlines, hotels, carriers).",
        disputes:
          "Any dispute arising from the execution of the contract will first be subject to an effort for amicable settlement. If this is not possible, the courts of Athens shall have jurisdiction.",
        bookingsList: [
          "Deposit: A 30% deposit of the total amount is required to confirm a booking.",
          "Final payment: Full payment must be completed no later than 21 days before departure.",
          "If payment is not completed on time, the Company reserves the right to cancel the booking without refund of the deposit.",
        ],
        pricesList: [
          "The Company reserves the right to adjust prices up to 20 days before departure in case of transport fare increases (fuel) or exchange-rate changes.",
          "If the increase exceeds 8% of the trip price, the customer has the right to cancel participation without any charge.",
        ],
        cancellationsList: [
          "Up to 30 days before departure: Full refund (administrative fees may apply).",
          "29 to 15 days before departure: Deposit is retained.",
          "14 days up to departure: 100% of the trip value is retained.",
          "Note: For special charter trips or peak periods, cancellation terms may be stricter.",
        ],
        obligationsList: [
          "The Company is not liable for delays, schedule changes, or accidents caused by force majeure (weather conditions, strikes, political unrest).",
          "The Company may cancel a trip if participation is below the minimum required number of participants, refunding all paid amounts in full.",
        ],
        documentsList: [
          "Documents: The traveler is solely responsible for holding a valid passport, visa, or new-type identity card where required.",
          "Insurance: The Company holds Professional Civil Liability Insurance. Travelers are also advised to purchase optional private insurance covering cancellation or medical expenses.",
        ],
      };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pb-4 pt-14 sm:pt-16 backdrop-blur-md bg-black/50 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="bg-card border border-border rounded-3xl w-full max-w-3xl overflow-hidden transform-gpu [backface-visibility:hidden]"
            style={{ boxShadow: "var(--shadow-lg)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <Helmet prioritizeSeoTags>
              <title>{`${modalTitle} | Valitsa Travel`}</title>
              <meta name="description" content={seoDescription} />
              <meta
                property="og:title"
                content={`${modalTitle} | Valitsa Travel`}
              />
              <meta property="og:description" content={seoDescription} />
              <meta
                name="twitter:title"
                content={`${modalTitle} | Valitsa Travel`}
              />
              <meta name="twitter:description" content={seoDescription} />
            </Helmet>

            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg md:text-xl font-bold">{modalTitle}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-[transform,background-color,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu [backface-visibility:hidden] active:scale-[0.97]"
                aria-label={closeLabel}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 md:p-7 max-h-[62vh] overflow-y-auto space-y-6 text-sm md:text-[0.95rem] leading-relaxed text-foreground-muted">
              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.introduction}
                </h3>
                <p>{copy.introduction}</p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.bookings}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  {copy.bookingsList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.prices}
                </h3>
                <p>{copy.prices}</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  {copy.pricesList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.cancellations}
                </h3>
                <p>{copy.cancellations}</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  {copy.cancellationsList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.obligations}
                </h3>
                <p>{copy.obligations}</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  {copy.obligationsList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.documents}
                </h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  {copy.documentsList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-foreground">
                  {sectionTitles.disputes}
                </h3>
                <p>{copy.disputes}</p>
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
