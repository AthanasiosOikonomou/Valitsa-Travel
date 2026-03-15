import { createContext, useContext, useState, type ReactNode } from "react";

type Lang = "en" | "gr";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navbar
    "nav.brand": "VALITSA",
    "nav.terms": "Terms & Conditions",
    "nav.daily": "Daily Trips",
    "nav.twoday": "2-Day Trips",
    "nav.internal": "Domestic Trips",
    "nav.external": "International Trips",
    "nav.contactBtn": "Contact",

    // Contact Modal
    "contact.title": "Contact Us",
    "contact.callUs": "Call Us",
    "contact.whatsapp": "WhatsApp",
    "contact.whatsappDesc": "Chat with us instantly",
    "contact.viber": "Viber",
    "contact.viberDesc": "Message us on Viber",
    "contact.sendMessage": "Send a Message",
    "contact.sendMessageDesc": "Fill out the form and we'll get back to you",
    "contact.back": "Back",
    "contact.send": "Send Message",
    "contact.sent": "Message Sent!",
    "contact.sentDesc": "We'll get back to you within 24 hours.",

    // Hero
    "hero.label": "Luxury Travel, Redefined",
    "hero.title": "Discover Your Next Destination",
    "hero.subtitle":
      "Handcrafted journeys to the world's most extraordinary places. Every detail curated, every moment unforgettable.",
    "hero.cta": "View All Our Trips",

    // Featured
    "featured.label": "Curated Collections",
    "featured.title": "Featured Escapes",
    "featured.viewAll": "View all trips",

    // Trip Grid
    "grid.label": "Curated Collections",
    "grid.title": "Featured Escapes",
    "grid.all": "All",
    "grid.viewDetails": "View Details",

    // Trip Card Quick Links
    "card.moreDuration": "More {duration} Trips",
    "card.moreType": "More {type} Trips",

    // Trip Detail
    "detail.startingFrom": "Starting from",
    "detail.expressInterest": "Express Your Interest",
    "detail.firstName": "First Name",
    "detail.lastName": "Last Name",
    "detail.email": "Email Address",
    "detail.mobile": "Mobile (optional)",
    "detail.message": "Tell us about your preferences...",
    "detail.sendInquiry": "Send Inquiry",
    "detail.inquirySent": "Inquiry Sent",
    "detail.inquiryMsg": "We'll be in touch within 24 hours.",
    "detail.description": "Description",
    "detail.program": "Program",
    "detail.included": "Included",

    // Archive / Search Page
    "archive.title": "All Trips",
    "archive.resultsFound": "trips found",
    "archive.searchPlaceholder": "Search by title...",
    "archive.priceRange": "Price Range",
    "archive.specialFilters": "Special Filters",
    "archive.bonusTrips": "Bonus Trips",
    "archive.guaranteedDepartures": "Guaranteed Departures",
    "archive.availableSeats": "Available Seats",
    "archive.duration": "Duration",
    "archive.days": "Days",
    "archive.departureCity": "Departure City",
    "archive.category": "Category",
    "archive.tripType": "Trip Type",
    "archive.all": "All",
    "archive.group": "Group Trips",
    "archive.individual": "Individual",
    "archive.more": "MORE",
    "archive.guaranteed": "Guaranteed",
    "archive.noResults": "No trips match your filters.",

    // Advanced Search
    "search.title": "Advanced Search",
    "search.destination": "Destination",
    "search.internal": "Internal",
    "search.external": "External",
    "search.duration": "Duration (Days)",
    "search.category": "Category",
    "search.cultural": "Cultural",
    "search.adventure": "Adventure",
    "search.religious": "Religious",
    "search.wellness": "Wellness",
    "search.wildlife": "Wildlife",
    "search.expedition": "Expedition",
    "search.priceRange": "Price Range",
    "search.transport": "Transport Mode",
    "search.bus": "Bus",
    "search.plane": "Plane",
    "search.ship": "Ship",
    "search.apply": "Apply Filters",
    "search.reset": "Reset Filters",
    "search.filters": "Filters",

    // Footer
    "footer.rights": "© 2026 Valitsa Travel. All rights reserved.",
  },
  gr: {
    // Navbar
    "nav.brand": "VALITSA",
    "nav.terms": "Όροι & Προϋποθέσεις",
    "nav.daily": "Ημερήσιες Εκδρομές",
    "nav.twoday": "2ήμερες Εκδρομές",
    "nav.internal": "Εκδρομές Εσωτερικού",
    "nav.external": "Εκδρομές Εξωτερικού",
    "nav.contactBtn": "Επικοινωνία",

    // Contact Modal
    "contact.title": "Επικοινωνία",
    "contact.callUs": "Καλέστε μας",
    "contact.whatsapp": "WhatsApp",
    "contact.whatsappDesc": "Συνομιλήστε μαζί μας άμεσα",
    "contact.viber": "Viber",
    "contact.viberDesc": "Στείλτε μας μήνυμα στο Viber",
    "contact.sendMessage": "Στείλτε μήνυμα",
    "contact.sendMessageDesc":
      "Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε μαζί σας",
    "contact.back": "Πίσω",
    "contact.send": "Αποστολή",
    "contact.sent": "Το μήνυμα στάλθηκε!",
    "contact.sentDesc": "Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.",

    // Hero
    "hero.label": "Πολυτελή Ταξίδια, Ξανά",
    "hero.title": "Ανακαλύψτε τον Επόμενο Προορισμό σας",
    "hero.subtitle":
      "Χειροποίητα ταξίδια στα πιο εξαιρετικά μέρη του κόσμου. Κάθε λεπτομέρεια επιμελημένη, κάθε στιγμή αξέχαστη.",
    "hero.cta": "Δείτε όλα τα ταξίδια μας",

    // Featured
    "featured.label": "Επιλεγμένες Συλλογές",
    "featured.title": "Κορυφαίες Αποδράσεις",
    "featured.viewAll": "Δείτε όλα τα ταξίδια",

    // Trip Grid
    "grid.label": "Επιλεγμένες Συλλογές",
    "grid.title": "Κορυφαίες Αποδράσεις",
    "grid.all": "Όλα",
    "grid.viewDetails": "Λεπτομέρειες",

    // Trip Card Quick Links
    "card.moreDuration": "Περισσότερα {duration} Ταξίδια",
    "card.moreType": "Περισσότερα {type} Ταξίδια",

    // Trip Detail
    "detail.startingFrom": "Από",
    "detail.expressInterest": "Εκδηλώστε Ενδιαφέρον",
    "detail.firstName": "Όνομα",
    "detail.lastName": "Επώνυμο",
    "detail.email": "Email",
    "detail.mobile": "Κινητό (προαιρετικό)",
    "detail.message": "Πείτε μας τις προτιμήσεις σας...",
    "detail.sendInquiry": "Αποστολή",
    "detail.inquirySent": "Το αίτημα στάλθηκε",
    "detail.inquiryMsg": "Θα επικοινωνήσουμε εντός 24 ωρών.",
    "detail.description": "Περιγραφή",
    "detail.program": "Πρόγραμμα",
    "detail.included": "Περιλαμβάνονται",

    // Archive / Search Page
    "archive.title": "Όλα τα Ταξίδια",
    "archive.resultsFound": "ταξίδια βρέθηκαν",
    "archive.searchPlaceholder": "Αναζήτηση με τίτλο...",
    "archive.priceRange": "Εύρος Τιμής",
    "archive.specialFilters": "Ειδικά Φίλτρα",
    "archive.bonusTrips": "Bonus Ταξίδια",
    "archive.guaranteedDepartures": "Εξασφαλισμένες Αναχωρήσεις",
    "archive.availableSeats": "Διαθέσιμες Θέσεις",
    "archive.duration": "Διάρκεια",
    "archive.days": "Ημέρες",
    "archive.departureCity": "Πόλη Αναχώρησης",
    "archive.category": "Κατηγορία",
    "archive.tripType": "Τύπος Ταξιδιού",
    "archive.all": "Όλα",
    "archive.group": "Ομαδικά Ταξίδια",
    "archive.individual": "Ατομικά",
    "archive.more": "ΠΕΡΙΣΣΟΤΕΡΑ",
    "archive.guaranteed": "Εξασφαλισμένη",
    "archive.noResults": "Δεν βρέθηκαν ταξίδια με αυτά τα φίλτρα.",

    // Advanced Search
    "search.title": "Σύνθετη Αναζήτηση",
    "search.destination": "Προορισμός",
    "search.internal": "Εσωτερικό",
    "search.external": "Εξωτερικό",
    "search.duration": "Διάρκεια (Ημέρες)",
    "search.category": "Κατηγορία",
    "search.cultural": "Πολιτιστικό",
    "search.adventure": "Περιπέτεια",
    "search.religious": "Θρησκευτικό",
    "search.wellness": "Ευεξία",
    "search.wildlife": "Άγρια Ζωή",
    "search.expedition": "Αποστολή",
    "search.priceRange": "Εύρος Τιμής",
    "search.transport": "Μέσο Μεταφοράς",
    "search.bus": "Λεωφορείο",
    "search.plane": "Αεροπλάνο",
    "search.ship": "Πλοίο",
    "search.apply": "Εφαρμογή",
    "search.reset": "Επαναφορά Φίλτρων",
    "search.filters": "Φίλτρα",

    // Footer
    "footer.rights": "© 2026 Valitsa Travel. Με επιφύλαξη παντός δικαιώματος.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("gr");

  const t = (key: string) => translations[lang][key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
