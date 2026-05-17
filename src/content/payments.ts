export type PaymentsBankSection = {
  bankLabel: string;
  bankName: string;
  accountNumberLabel: string;
  accountNumber: string;
  ibanLabel: string;
  iban: string;
  swift: string;
};

export type PaymentsContent = {
  modalTitle: string;
  seoDescription: string;
  intro: string;
  accountHolderLabel: string;
  accountHolderName: string;
  vatLine: string;
  bankSection: PaymentsBankSection;
  afterDepositIntro: string;
  notifyPhonePrefix: string;
  notifyPhone: string;
  notifyEmailPrefix: string;
  notifyEmail: string;
  notifyEmailMiddle: string;
  notifyMobile: string;
  notifyMobileSuffix: string;
  importantHeading: string;
  importantItems: string[];
  exampleLabel: string;
  exampleText: string;
};

export const paymentsGr: PaymentsContent = {
  modalTitle: "Τρόποι Πληρωμής",
  seoDescription:
    "Τραπεζικοί λογαριασμοί VALITSA TRAVEL για καταθέσεις και οδηγίες εξόφλησης κρατήσεων.",
  intro: "Τραπεζικοί λογαριασμοί VALITSA TRAVEL για καταθέσεις:",
  accountHolderLabel: "ΔΙΚΑΙΟΥΧΟΣ ΛΟΓΑΡΙΑΣΜΟΥ:",
  accountHolderName:
    "ΒΑΛΙΤΣΑ ΤΡΑΒΕΛ ΜΟΝΟΠΡΟΣΩΠΗ ΙΔΙΩΤΙΚΗ ΚΕΦΑΛΑΙΟΥΧΙΚΗ ΕΤΑΙΡΕΙΑ",
  vatLine: "Αριθμός Φορολογικού Μητρώου (ΑΦΜ): 803 261 232",
  bankSection: {
    bankLabel: "ΤΡΑΠΕΖΑ:",
    bankName: "ΠΕΙΡΑΙΩΣ",
    accountNumberLabel: "ΑΡΙΘ. ΛΟΓΑΡΙΑΣΜΟΥ:",
    accountNumber: "51 3111 8994 197",
    ibanLabel: "ΙΒΑΝ:",
    iban: "GR58 0172 1310 0051 3111 8994 197",
    swift: "SWIFT-BIC της τράπεζας Πειραιώς είναι PIRBGRAA",
  },
  afterDepositIntro:
    "Μετά από την κατάθεση του ποσού, παρακαλούμε όπως ενημερώσετε σχετικά το γραφείο με έναν από τους παρακάτω τρόπους:",
  notifyPhonePrefix: "Τηλεφωνήστε",
  notifyPhone: "210 260 6248",
  notifyEmailPrefix: "Αποστείλετε το καταθετήριο στη διεύθυνση ηλεκτρονικού ταχυδρομείου",
  notifyEmail: "sales@valitsatravel.gr",
  notifyEmailMiddle: "ή στο τηλέφωνο",
  notifyMobile: "693 745 4193",
  notifyMobileSuffix: "(Viber, WhatsApp).",
  importantHeading: "Σημαντικό:",
  importantItems: [
    "το επώνυμό σας",
    "τον προορισμό και",
    "την ημερομηνία της εκδρομής.",
  ],
  exampleLabel: "Παράδειγμα:",
  exampleText: "«ΝΙΚΟΛΑΟΥ – ΑΡΧΑΙΑ ΟΛΥΜΠΙΑ – 5-18/8/26»",
};

export const paymentsEn: PaymentsContent = {
  modalTitle: "Payment Methods",
  seoDescription:
    "VALITSA TRAVEL bank accounts for deposits and payment instructions for bookings.",
  intro: "VALITSA TRAVEL bank accounts for deposits:",
  accountHolderLabel: "ACCOUNT HOLDER:",
  accountHolderName:
    "ΒΑΛΙΤΣΑ ΤΡΑΒΕΛ ΜΟΝΟΠΡΟΣΩΠΗ ΙΔΙΩΤΙΚΗ ΚΕΦΑΛΑΙΟΥΧΙΚΗ ΕΤΑΙΡΕΙΑ",
  vatLine: "Tax Registration Number (VAT): 803 261 232",
  bankSection: {
    bankLabel: "BANK:",
    bankName: "PIRAEUS BANK",
    accountNumberLabel: "ACCOUNT NO.:",
    accountNumber: "51 3111 8994 197",
    ibanLabel: "IBAN:",
    iban: "GR58 0172 1310 0051 3111 8994 197",
    swift: "Piraeus Bank SWIFT-BIC: PIRBGRAA",
  },
  afterDepositIntro:
    "After making your deposit, please notify our office using one of the following methods:",
  notifyPhonePrefix: "Call",
  notifyPhone: "210 260 6248",
  notifyEmailPrefix: "Send the deposit slip to",
  notifyEmail: "sales@valitsatravel.gr",
  notifyEmailMiddle: "or to mobile",
  notifyMobile: "693 745 4193",
  notifyMobileSuffix: "(Viber, WhatsApp).",
  importantHeading: "Important:",
  importantItems: [
    "your surname",
    "the destination, and",
    "the date of the excursion.",
  ],
  exampleLabel: "Example:",
  exampleText: "«NIKOLOU – ANCIENT OLYMPIA – 5-18/8/26»",
};
