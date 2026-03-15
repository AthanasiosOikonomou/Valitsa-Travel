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
    "nav.toggleLanguage": "Toggle language",
    "nav.toggleTheme": "Toggle theme",
    "nav.menu": "Menu",

    // Common
    "common.close": "Close",

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
    "contact.sending": "Sending...",
    "contact.sendFailed": "Failed to send message. Please try again.",
    "contact.sent": "Message Sent!",
    "contact.sentDesc": "We'll get back to you within 24 hours.",

    "validation.required": "This field is required",
    "validation.emailInvalid": "Please enter a valid email address",
    "validation.phoneInvalid": "Please enter a valid phone number",

    // Hero
    "hero.label": "Luxury Travel, Redefined",
    "hero.title": "Discover Your Next Destination",
    "hero.subtitle":
      "Handcrafted journeys to the world's most extraordinary places. Every detail curated, every moment unforgettable.",
    "hero.cta": "View All Our Trips",
    "hero.alt": "Aerial view of a serene tropical coastline",

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
    "detail.mobile": "Mobile",
    "detail.message": "Tell us about your preferences...",
    "detail.sendInquiry": "Send Inquiry",
    "detail.sending": "Sending...",
    "detail.sendFailed": "Failed to send inquiry. Please try again.",
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
    "archive.specialFilters": "Travel Preferences",
    "archive.bonusTrips": "Trips with Extra Perks",
    "archive.guaranteedDepartures": "Guaranteed Departures",
    "archive.availableSeats": "Available Seats",
    "archive.featuredPicks": "Top Picks",
    "archive.sortBy": "Sort By",
    "archive.sort.recommended": "Recommended",
    "archive.sort.priceAsc": "Lowest Price",
    "archive.sort.priceDesc": "Highest Price",
    "archive.sort.durationAsc": "Shortest Duration",
    "archive.duration": "Duration",
    "archive.days": "Days",
    "archive.continent": "Continent",
    "archive.country": "Country",
    "archive.departureCity": "Departure City",
    "archive.category": "Category",
    "archive.tripType": "Trip Type",
    "archive.all": "All",
    "archive.group": "Group Trips",
    "archive.individual": "Individual",
    "archive.more": "MORE",
    "archive.guaranteed": "Guaranteed",
    "archive.bonus": "Extra Perk",
    "archive.noResults": "No trips match your filters.",

    // Trip Types
    "tripType.Exotic": "Exotic",
    "tripType.Road Trip": "Road Trip",
    "tripType.Flight": "Flight",

    // Not Found
    "notFound.message": "Oops! Page not found",
    "notFound.backHome": "Return to Home",

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

    // Countries
    "country.Greece": "Greece",
    "country.Italy": "Italy",
    "country.Japan": "Japan",
    "country.Iceland": "Iceland",
    "country.Switzerland": "Switzerland",
    "country.Tanzania": "Tanzania",
    "country.Chile": "Chile",
    "country.France": "France",
    "country.Peru": "Peru",
    "country.Egypt": "Egypt",
    "country.USA": "USA",

    // Continents
    "continent.Europe": "Europe",
    "continent.Asia": "Asia",
    "continent.Africa": "Africa",
    "continent.North America": "North America",
    "continent.South America": "South America",
    "continent.Other": "Other",

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
    "nav.toggleLanguage": "Αλλαγή γλώσσας",
    "nav.toggleTheme": "Αλλαγή θέματος",
    "nav.menu": "Μενού",

    // Common
    "common.close": "Κλείσιμο",

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
    "contact.sending": "Αποστολή...",
    "contact.sendFailed": "Αποτυχία αποστολής. Προσπαθήστε ξανά.",
    "contact.sent": "Το μήνυμα στάλθηκε!",
    "contact.sentDesc": "Θα επικοινωνήσουμε μαζί σας εντός 24 ωρών.",

    "validation.required": "Το πεδίο είναι υποχρεωτικό",
    "validation.emailInvalid": "Εισάγετε έγκυρη διεύθυνση email",
    "validation.phoneInvalid": "Εισάγετε έγκυρο αριθμό τηλεφώνου",

    // Hero
    "hero.label": "Πολυτελή Ταξίδια, Ξανά",
    "hero.title": "Ανακαλύψτε τον Επόμενο Προορισμό σας",
    "hero.subtitle":
      "Χειροποίητα ταξίδια στα πιο εξαιρετικά μέρη του κόσμου. Κάθε λεπτομέρεια επιμελημένη, κάθε στιγμή αξέχαστη.",
    "hero.cta": "Δείτε όλα τα ταξίδια μας",
    "hero.alt": "Εναέρια θέα σε ήρεμη τροπική ακτογραμμή",

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
    "detail.mobile": "Κινητό",
    "detail.message": "Πείτε μας τις προτιμήσεις σας...",
    "detail.sendInquiry": "Αποστολή",
    "detail.sending": "Αποστολή...",
    "detail.sendFailed": "Αποτυχία αποστολής αιτήματος. Προσπαθήστε ξανά.",
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
    "archive.specialFilters": "Προτιμήσεις Ταξιδιού",
    "archive.bonusTrips": "Ταξίδια με Extra Παροχές",
    "archive.guaranteedDepartures": "Εξασφαλισμένες Αναχωρήσεις",
    "archive.availableSeats": "Διαθέσιμες Θέσεις",
    "archive.featuredPicks": "Κορυφαίες Επιλογές",
    "archive.sortBy": "Ταξινόμηση",
    "archive.sort.recommended": "Προτεινόμενα",
    "archive.sort.priceAsc": "Χαμηλότερη Τιμή",
    "archive.sort.priceDesc": "Υψηλότερη Τιμή",
    "archive.sort.durationAsc": "Μικρότερη Διάρκεια",
    "archive.duration": "Διάρκεια",
    "archive.days": "Ημέρες",
    "archive.continent": "Ήπειρος",
    "archive.country": "Χώρα",
    "archive.departureCity": "Πόλη Αναχώρησης",
    "archive.category": "Κατηγορία",
    "archive.tripType": "Τύπος Ταξιδιού",
    "archive.all": "Όλα",
    "archive.group": "Ομαδικά Ταξίδια",
    "archive.individual": "Ατομικά",
    "archive.more": "ΠΕΡΙΣΣΟΤΕΡΑ",
    "archive.guaranteed": "Εξασφαλισμένη",
    "archive.bonus": "Extra Παροχή",
    "archive.noResults": "Δεν βρέθηκαν ταξίδια με αυτά τα φίλτρα.",

    // Trip Types
    "tripType.Exotic": "Εξωτικό",
    "tripType.Road Trip": "Οδικό",
    "tripType.Flight": "Αεροπορικό",

    // Not Found
    "notFound.message": "Ουπς! Η σελίδα δεν βρέθηκε",
    "notFound.backHome": "Επιστροφή στην Αρχική",

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
    "search.expedition": "Εξερεύνηση",
    "search.priceRange": "Εύρος Τιμής",
    "search.transport": "Μέσο Μεταφοράς",
    "search.bus": "Λεωφορείο",
    "search.plane": "Αεροπλάνο",
    "search.ship": "Πλοίο",
    "search.apply": "Εφαρμογή",
    "search.reset": "Επαναφορά Φίλτρων",
    "search.filters": "Φίλτρα",

    // Countries
    "country.Greece": "Ελλάδα",
    "country.Italy": "Ιταλία",
    "country.Japan": "Ιαπωνία",
    "country.Iceland": "Ισλανδία",
    "country.Switzerland": "Ελβετία",
    "country.Tanzania": "Τανζανία",
    "country.Chile": "Χιλή",
    "country.France": "Γαλλία",
    "country.Peru": "Περού",
    "country.Egypt": "Αίγυπτος",
    "country.USA": "ΗΠΑ",

    // Continents
    "continent.Europe": "Ευρώπη",
    "continent.Asia": "Ασία",
    "continent.Africa": "Αφρική",
    "continent.North America": "Βόρεια Αμερική",
    "continent.South America": "Νότια Αμερική",
    "continent.Other": "Άλλη",

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
