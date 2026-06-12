export type TermsBlock =
  | { type: "paragraph"; text: string }
  | { type: "subsection"; title: string; blocks: TermsBlock[] };

export type TermsSection = {
  id: string;
  title: string;
  blocks: TermsBlock[];
};

export type TermsContent = {
  documentTitle: string;
  seoDescription: string;
  modalTitle: string;
  sections: TermsSection[];
};

const p = (text: string): TermsBlock => ({ type: "paragraph", text });
const sub = (title: string, blocks: TermsBlock[]): TermsBlock => ({
  type: "subsection",
  title,
  blocks,
});

export const termsGr: TermsContent = {
  documentTitle: "ΓΕΝΙΚΟΙ ΟΡΟΙ ΧΡΗΣΗΣ & ΟΡΟΙ ΣΥΜΜΕΤΟΧΗΣ – VALITSA TRAVEL",
  modalTitle: "Όροι & Προϋποθέσεις",
  seoDescription:
    "Γενικοί όροι χρήσης και όροι συμμετοχής σε οργανωμένα ταξίδια της Valitsa Travel — valitsatravel.gr",
  sections: [
    {
      id: "participation",
      title: "1. ΣΥΜΜΕΤΟΧΗ ΣΤΑ ΟΡΓΑΝΩΜΕΝΑ ΤΑΞΙΔΙΑ (ΕΙΣΑΓΩΓΗ)",
      blocks: [
        p(
          "Η συμμετοχή σε οποιαδήποτε εκδρομή που αναφέρεται στο σάιτ του ταξιδιωτικού γραφείο μας με την επωνυμία VALITSA TRAVEL, σημαίνει αυτομάτως ότι έχετε λάβει γνώση και αποδεχθήκατε χωρίς επιφυλάξεις τους παρακάτω όρους, οι οποίοι είναι σύμφωνοι με την Οδηγία 90/314 της ΕΕ και του ΠΔ 339/1996 και τους οποίους παρακαλούμε να τους διαβάσετε προσεκτικά.",
        ),
        p(
          "Οι εγγραφές σε οργανωμένο ταξίδι και οι κρατήσεις θέσεων ισχύουν μόνο μετά την καταβολή της προβλεπόμενης κάθε φορά προκαταβολής ή ολόκληρου του ποσού γεγονός που συνιστά την ανεπιφύλακτη αποδοχή των παρόντων όρων από την πλευρά του πελάτη.",
        ),
        p(
          "Το δικαίωμα συμμετοχής στο ταξίδι εξασφαλίζεται με την εξόφληση πριν την αναχώρηση του συνόλου της αξίας και των σχετικών επιβαρύνσεων τουλάχιστον 14 πλήρεις ημέρες (ή 2 εβδομάδες) για ταξίδι εσωτερικού και τουλάχιστον 21 πλήρεις ημέρες (3 εβδομάδες) για ταξίδι εξωτερικού.",
        ),
        p(
          "Ο συμμετέχων πελάτης - εκδρομέας, που έκανε την κράτηση θεωρείται ότι εκπροσωπεί την οικογένεια ή την ομάδα του και έχει υποχρέωση να ενημερώσει όλους τους εκπροσωπούμενους από αυτόν για τις λεπτομέρειες και τους όρους του ταξιδιού. Οι συμμετέχοντες μέσω τρίτου έχουν τις ίδιες υποχρεώσεις με τον εκπρόσωπο που τους ενέγραψε στο ταξίδι.",
        ),
      ],
    },
    {
      id: "agency-liability",
      title: "2. ΕΥΘΥΝΕΣ ΤΟΥ ΓΡΑΦΕΙΟΥ ΜΑΣ",
      blocks: [
        p(
          "Το VALITSA TRAVEL (εφεξής ταξιδιωτικό γραφείο ή γραφείο) ενεργεί ως ένας μεσολαβητής/ μεσάζων μεταξύ των πελατών – εκδρομέων (εφεξής εκδρομείς) και των διαφόρων τουριστικών γραφείων που έχουν την αποκλειστική ευθύνη της οργάνωσης των προγραμμάτων που περιέχονται στο παρόν σάιτ/ έντυπο, καθώς και άλλων φορέων (ακτοπλοϊκές εταιρείες, αεροπορικές εταιρείες) με τελικό σκοπό την πώληση οργανωμένων πακέτων ταξιδιών.",
        ),
        p(
          "Στους φορείς αυτούς το γραφείο μας ως αποκλειστικά μεσολαβητής/ μεσάζων δε συμμετέχει στον σχεδιασμό και την οργάνωση των ταξιδιωτικών πακέτων και κατά συνέπεια δεν φέρει καμία ευθύνη στις περιπτώσεις οργανωτικών αδυναμιών που προέρχονται από αυτούς τους τρίτους φορείς που μεσολαβούν για τη διεκπεραίωση του προγράμματος της εκδρομής. Τέτοια περίπτωση είναι π.χ. η ομαλή διεξαγωγή των ακτοπλοϊκών δρομολογίων (το γραφείο μας δε φέρει καμία ευθύνη για τυχόν αλλαγές, καθυστερήσεις ή ακυρώσεις απόπλου, αλλαγή πλοίου, αλλαγή προγράμματος δρομολογίου, κ.λπ.). Οι ακτοπλοϊκές (ή αεροπορικές) εταιρείες μπορούν να τροποποιήσουν τα δρομολόγια και τους τύπους των μεταφορικών μέσων (πλοίων/αεροσκαφών) χωρίς καμία προειδοποίηση. Το γραφείο μας δε φέρει καμία ευθύνη για τυχόν καθυστέρηση, αλλαγή προγράμματος απόπλου/πτήσης, αλλαγή τύπου πλοίου/αεροσκάφους ή και ακύρωση της πτήσης συνεπεία λόγων ανωτέρας βίας. Το VALITSA TRAVEL έχει μόνο μεσολαβητικό ρόλο.",
        ),
        p(
          "Δεν ευθύνεται επίσης για ανωμαλίες στην εκτέλεση της εκδρομής και τυχόν δυσχέρειες που οφείλονται σε γεγονότα που συνιστούν καταστάσεις ανωτέρας βίας (πόλεμοι, δυσμενείς καιρικές συνθήκες, απεργίες, αεροπειρατείες, θεομηνίες, κ.λπ.) καθώς επίσης δεν ευθύνεται και για πιθανά ατυχήματα, ασθένειες εξαιτίας των κλιματολογικών συνθηκών, επιδημίες, δηλητηριάσεις, εγκληματικές πράξεις, κλοπή αντικειμένων, απώλεια αποσκευών ή χρημάτων ή διαβατηρίων, φθορά αποσκευών κ.λ.π.",
        ),
      ],
    },
    {
      id: "program-execution",
      title: "3. ΕΚΤΕΛΕΣΗ – ΕΦΑΡΜΟΓΗ ΠΡΟΓΡΑΜΜΑΤΟΣ",
      blocks: [
        p(
          "Σε πολλές περιπτώσεις εξαιτίας αστάθμητων παραγόντων και απρόβλεπτων καταστάσεων καθίσταται επιβεβλημένη, από την πλευρά του διοργανωτή οργανωμένων τουριστικών ταξιδιών, η αλλαγή και διαφοροποίηση του προγράμματος. Πιθανή αλλαγή των ωρών αναχωρήσεων των μεταφορικών μέσων από το πρωί σε μεσημέρι ή απόγευμα και αντίστροφα ή της ώρας επιβίβασης σε λεωφορείο οδικής εκδρομής, δε θεωρείται αλλαγή προγράμματος. Αλλαγή ή τροποποίηση του προγράμματος μπορεί να συμβεί τόσο πριν την αναχώρηση της εκδρομής, όσο και κατά τη διάρκειά της.",
        ),
        sub("α) Πριν την αναχώρηση", [
          p(
            "Το πρόγραμμα του ταξιδιού δύναται να τροποποιηθεί, όπως αναφέρθηκε, εξαιτίας αστάθμητων παραγόντων π.χ. καθυστερήσεις ή ακυρώσεις δρομολογίων των μεταφορικών μέσων (αεροπλάνων, πλοίων, κ.λπ.) αλλαγή ξενοδοχείου εξαιτίας προβλημάτων στις κτιριακές εγκαταστάσεις ή λόγω γεγονότων τα οποία εκτάκτως συμβαίνουν στον τόπο προορισμού (π.χ. καιρικές συνθήκες, πολιτικά γεγονότα, αναταραχές, κ.λπ).",
          ),
        ]),
        sub("β) Κατά τη διάρκεια της εκδρομής", [
          p(
            "Ο εκάστοτε αρχηγός της εκδρομής έχει δικαίωμα, στοχεύοντας μόνο στην ασφάλεια των εκδρομέων και την όσο το δυνατόν καλύτερη εκτέλεση του προγράμματος, όταν προκύψει κάποιο απρόβλεπτο γεγονός ή ανωμαλία από αστάθμητους παράγοντες που αναφέρθηκαν ανωτέρω (καθυστερήσεις ή ακυρώσεις δρομολογίων μεταφορικών μέσων, πόλεμοι, πολιτικές αναταραχές, απεργίες, καιρικές συνθήκες, κ.λπ) να επιφέρει τροποποιήσεις στο πρόγραμμα.",
          ),
          p(
            "Ενδεικτικά μία τέτοια περίπτωση αναφέρεται ως η απαγόρευση απόπλου πλοίου για την επιστροφή των εκδρομέων λόγω καιρικών συνθηκών και η ανάγκη επιπλέον χρόνου παραμονής στο κατάλυμα.",
          ),
        ]),
      ],
    },
    {
      id: "seat-bookings",
      title: "4. ΚΡΑΤΗΣΕΙΣ ΘΕΣΕΩΝ",
      blocks: [
        p(
          "Για να είναι έγκυρη οποιαδήποτε κράτηση θέσης για συμμετοχή σε εκδρομή που προτείνει το γραφείο η οποία αναγράφεται στο σάιτ, πρέπει να καταβληθεί μία προκαταβολή ίση με το 30% της ολικής τιμής μέσα σε 3 ημέρες από την ημερομηνία της κράτησης (1η μέρα υπολογίζεται η ημερομηνία της κράτησης) και η εξόφληση του συνόλου της εκδρομής θα πρέπει να έχει ολοκληρωθεί 14 ημέρες πριν την αναχώρηση της κάθε εκδρομής.",
        ),
        p(
          "Σε περίπτωση που ισχύει από την πλευρά του διοργανωτή διαφορετικό χρονοδιάγραμμα για την προκαταβολή/ εξόφληση της εκδρομής αυτό θα κοινοποιείται με κάθε πρόσφορο μέσο στον πελάτη (ηλεκτρονικό ταχυδρομείο, WhatsApp, Viber, κ.λπ) ή θα αναγράφεται στην περιγραφή της εκδρομής.",
        ),
      ],
    },
    {
      id: "traveler-obligations",
      title: "5. ΥΠΟΧΡΕΩΣΕΙΣ - ΕΥΘΥΝΕΣ ΤΑΞΙΔΙΩΤΩΝ",
      blocks: [
        sub("Συμμετοχή", [
          p(
            "Η συμμετοχή σε ομαδικό ταξίδι προϋποθέτει συμμόρφωση με το πρόγραμμα, τις οδηγίες του αρχηγού, συνοδού ή ξεναγού, καθώς και έγκαιρη παρουσία σε όλα τα προκαθορισμένα σημεία και ώρες αναχώρησης (μεταφορές, πτήσεις, εκδρομές, ξεναγήσεις, γεύματα, κ.λπ.).",
          ),
          p(
            "Καθυστέρηση ή μη έγκαιρη προσέλευση μπορεί να οδηγήσει σε απώλεια μέρους ή του συνόλου προγραμματισμένης υπηρεσίας, χωρίς δικαίωμα επιστροφής χρημάτων ή αποζημίωσης. Σε τέτοια περίπτωση, ο ταξιδιώτης φέρει αποκλειστικά την ευθύνη και τα έξοδα επανένταξής του στην ομάδα.",
          ),
          p(
            "Επίσης ο αρχηγός ή συνοδός εκδρομής διατηρεί το δικαίωμα να συνεχίσει το πρόγραμμα χωρίς καθυστερημένους συμμετέχοντες, προς διασφάλιση της ομαλής διεξαγωγής της εκδρομής και του σεβασμού προς το σύνολο της ομάδας.",
          ),
        ]),
        sub("Ανωτέρα Βία", [
          p(
            "Σε περιπτώσεις ανωτέρας βίας, όπως ενδεικτικά κακοκαιρία, απεργίες, καθυστερήσεις ή ακυρώσεις δρομολογίων, το ταξιδιωτικό γραφείο δεν ευθύνεται για πρόσθετα έξοδα που ενδέχεται να προκύψουν (διαμονή, διατροφή, μεταφορές, αλλαγές εισιτηρίων, κ.λπ.), τα οποία επιβαρύνουν τους ταξιδιώτες.",
          ),
        ]),
        sub("Ταξιδιωτικά Έγγραφα", [
          p(
            "Οι ταξιδιώτες φέρουν την αποκλειστική ευθύνη για την κατοχή, νομιμότητα και ισχύ όλων των απαιτούμενων ταξιδιωτικών εγγράφων (ταυτότητα, διαβατήριο, visa, πιστοποιητικά ή λοιπές απαιτούμενες διατυπώσεις). Η έλλειψη ή μη έγκαιρη εξασφάλισή τους δεν αποτελεί λόγο δωρεάν ακύρωσης και συνεπάγεται τις προβλεπόμενες χρεώσεις ακύρωσης.",
          ),
          p("Η προμήθεια συναλλάγματος είναι επίσης αποκλειστική ευθύνη του ταξιδιώτη."),
        ]),
      ],
    },
    {
      id: "luggage",
      title: "6. ΑΠΟΣΚΕΥΕΣ",
      blocks: [
        p(
          "Οι αποσκευές μεταφέρονται με αποκλειστική ευθύνη και φροντίδα των ταξιδιωτών καθ' όλη τη διάρκεια του ταξιδιού, ανεξάρτητα από την παρουσία ή μη συνοδού ή εκπροσώπου του γραφείου.",
        ),
        p(
          "Σε περίπτωση απώλειας, καθυστέρησης ή φθοράς αποσκευών, εφαρμόζονται οι κανονισμοί του εκάστοτε μεταφορέα (όπως ενδεικτικά οι κανονισμοί IATA για αεροπορικές μεταφορές) και οι ισχύουσες διεθνείς συμβάσεις ή κανονισμοί που διέπουν κάθε μέσο μεταφοράς ή κατάλυμα.",
        ),
        p(
          "Το ταξιδιωτικό γραφείο δε φέρει ευθύνη για απώλεια, φθορά ή το περιεχόμενο των αποσκευών.",
        ),
      ],
    },
    {
      id: "cancellations",
      title: "7. ΑΚΥΡΩΣΕΙΣ ΣΥΜΜΕΤΟΧΗΣ ΑΠΌ ΤΑΞΙΔΙΩΤΗ",
      blocks: [
        p(
          "Κάθε ταξιδιώτης διατηρεί το δικαίωμα ακύρωσης της συμμετοχής του σε οργανωμένο ταξίδι ή εκδρομή, με έγγραφη ενημέρωση προς το ταξιδιωτικό γραφείο.",
        ),
        p(
          "Η ακύρωση συνεπάγεται επιβολή των προβλεπόμενων ακυρωτικών χρεώσεων, ανεξάρτητα από την ημερομηνία κράτησης ή το αν έχει εξοφληθεί μέρος ή το σύνολο του ταξιδιού, καθώς το γραφείο αναλαμβάνει εκ των προτέρων δεσμεύσεις και οικονομικές υποχρεώσεις (ρήτρες) προς τρίτους παρόχους (όπως ξενοδοχεία, αεροπορικές ή ακτοπλοϊκές εταιρείες, μεταφορικά μέσα και λοιπούς συνεργάτες).",
        ),
        p(
          "Ως εκπρόθεσμη θεωρείται κάθε ακύρωση που πραγματοποιείται εντός των τελευταίων 21 ημερών πριν από την αναχώρηση, εκτός εάν από τον συνεργάτη μας/διοργανωτή στην περιγραφή της συγκεκριμένης εκδρομής ορίζεται διαφορετικά.",
        ),
        p(
          "Σε περίπτωση διαφορετικής πολιτικής συνεργάτη/διοργανωτή/παρόχου υπηρεσίας, υπερισχύουν οι ειδικοί όροι του συγκεκριμένου προγράμματος, οι οποίοι αμελλητί θα γνωστοποιούνται στον ταξιδιώτη όποτε και όταν ζητηθούν.",
        ),
        p(
          "Εφόσον είναι εφικτό και επιτρέπεται από τους όρους του ταξιδιού, ο ταξιδιώτης μπορεί να μεταβιβάσει τη συμμετοχή του σε άλλο πρόσωπο, σύμφωνα με τις προβλεπόμενες προϋποθέσεις. Σε διαφορετική περίπτωση, εφαρμόζονται κανονικά οι ισχύουσες χρεώσεις ακύρωσης.",
        ),
        p(
          "Για ειδικούς όρους ή προσφορές σε αεροπορικούς ναύλους, μετά την έκδοση του εισιτηρίου ενδέχεται να επιβάλλονται ακυρωτικά έως και 100% της αξίας του εισιτηρίου, ανεξαρτήτως χρόνου κράτησης ή ακύρωσης.",
        ),
      ],
    },
    {
      id: "miscellaneous",
      title: "8. ΔΙΑΦΟΡΑ",
      blocks: [
        p(
          "Οι ώρες και τα δρομολόγια των πτήσεων που αναφέρονται στα έντυπα προγράμματα και στην ιστοσελίδα της Εταιρείας είναι ενδεικτικά και ενδέχεται να τροποποιηθούν από τις αεροπορικές εταιρείες. Οι τελικές ώρες αναχώρησης και άφιξης γνωστοποιούνται στους ταξιδιώτες μέσω του ενημερωτικού σημειώματος της εκδρομής, το οποίο αποστέλλεται συνήθως δύο (2) έως τρεις (3) ημέρες πριν από την αναχώρηση. Σε περίπτωση αλλαγών στα δρομολόγια, στις ώρες πτήσεων, στους τύπους αεροσκαφών ή καθυστερήσεων που οφείλονται στις αεροπορικές εταιρείες ή σε οποιονδήποτε άλλο μεταφορέα για λειτουργικούς, τεχνικούς ή άλλους λόγους εκτός ελέγχου του διοργανωτή, η Εταιρεία δεν φέρει καμία ευθύνη.",
        ),
        p(
          "Τα τρίκλινα δωμάτια που διατίθενται στα ξενοδοχεία είναι, κατά κανόνα, δίκλινα δωμάτια στα οποία προστίθεται μία επιπλέον κλίνη (extra bed), η οποία μπορεί να είναι πτυσσόμενο κρεβάτι, καναπές-κρεβάτι ή άλλος αντίστοιχος τύπος πρόσθετης κλίνης, σύμφωνα με τις προδιαγραφές του εκάστοτε καταλύματος.",
        ),
        p(
          "Η σειρά πραγματοποίησης των επισκέψεων, εκδρομών, ξεναγήσεων και λοιπών δραστηριοτήτων του προγράμματος ενδέχεται να τροποποιηθεί ή να πραγματοποιηθεί με διαφορετική ή αντίστροφη ροή από την αρχικά ανακοινωθείσα, εφόσον αυτό κριθεί απαραίτητο για λειτουργικούς λόγους ή για την καλύτερη εξυπηρέτηση των συμμετεχόντων. Σε κάθε περίπτωση, δεν παραλείπεται καμία από τις προβλεπόμενες παροχές ή ξεναγήσεις του προγράμματος. Η Εταιρεία διατηρεί το δικαίωμα αντικατάστασης των αναγραφόμενων ξενοδοχείων με άλλα της ίδιας ή ανώτερης κατηγορίας, χωρίς προηγούμενη ειδοποίηση, εφόσον αυτό καταστεί αναγκαίο για λόγους οργάνωσης ή διαθεσιμότητας.",
        ),
        p(
          "Με την ολοκλήρωση του ταξιδιού, η Εταιρεία εκδίδει τα προβλεπόμενα από την ισχύουσα νομοθεσία φορολογικά παραστατικά και τα αποστέλλει στον πελάτη ηλεκτρονικά, είτε στη διεύθυνση ηλεκτρονικού ταχυδρομείου (e-mail) που έχει δηλώσει είτε μέσω εφαρμογών ηλεκτρονικής επικοινωνίας, όπως Viber ή WhatsApp. Για οποιαδήποτε πληροφορία ή διευκρίνιση σχετικά με την έκδοση και αποστολή των παραστατικών, οι πελάτες μπορούν να επικοινωνούν με την Εταιρεία στο τηλέφωνο 210 260 6248.",
        ),
      ],
    },
    {
      id: "privacy",
      title: "9. ΠΟΛΙΤΙΚΗ ΠΡΟΣΤΑΣΙΑΣ ΠΡΟΣΩΠΙΚΩΝ ΔΕΔΟΜΕΝΩΝ",
      blocks: [
        p(
          "Το VALITSA TRAVEL συλλέγει και επεξεργάζεται αποκλειστικά τα απολύτως απαραίτητα προσωπικά δεδομένα που απαιτούνται για την ορθή οργάνωση, κράτηση και υλοποίηση των ταξιδιωτικών υπηρεσιών που παρέχει.",
        ),
        p(
          "Τα στοιχεία αυτά χρησιμοποιούνται μόνο για σκοπούς που σχετίζονται άμεσα με την κράτηση και εκτέλεση του ταξιδιού, όπως ενδεικτικά η έκδοση ακτοπλοϊκών ή αεροπορικών εισιτηρίων, κρατήσεις καταλυμάτων, μεταφορές και λοιπές συναφείς υπηρεσίες. Για παράδειγμα, πληροφορίες όπως η ημερομηνία γέννησης μπορεί να είναι απαραίτητες για την έκδοση συγκεκριμένων εισιτηρίων ή την παροχή ειδικών ταξιδιωτικών υπηρεσιών.",
        ),
        p(
          "Το VALITSA TRAVEL διαβιβάζει τα αναγκαία δεδομένα μόνο στους συνεργαζόμενους παρόχους ή φορείς που εμπλέκονται άμεσα στην ολοκλήρωση της κράτησης και την παροχή των συμφωνημένων υπηρεσιών, αποκλειστικά στο μέτρο που αυτό απαιτείται.",
        ),
        p(
          "Δεν προβαίνει σε πώληση, εμπορική εκμετάλλευση ή μη εξουσιοδοτημένη κοινοποίηση προσωπικών δεδομένων σε τρίτους.",
        ),
        p(
          "Η διαχείριση των προσωπικών δεδομένων πραγματοποιείται με στόχο τη διασφάλιση της εμπιστευτικότητας και ασφάλειάς τους.",
        ),
      ],
    },
    {
      id: "disputes",
      title: "10. ΡΥΘΜΙΣΗ ΔΙΑΦΟΡΩΝ",
      blocks: [
        p(
          "Κάθε συμμετοχή σε οργανωμένο ή ατομικό ταξίδι διέπεται από το Ελληνικό Δίκαιο.",
        ),
        p(
          "Τυχόν διαφορές που ενδέχεται να προκύψουν μεταξύ του ταξιδιώτη και του γραφείου καταβάλλεται προσπάθεια να επιλύονται αρχικά με καλή πίστη και φιλικό διακανονισμό.",
        ),
        p(
          "Εφόσον δεν καταστεί δυνατή η εξωδικαστική επίλυση, αρμόδια ορίζονται τα Δικαστήρια Αθηνών.",
        ),
      ],
    },
    {
      id: "acceptance",
      title: "11. ΑΠΟΔΟΧΗ ΟΡΩΝ ΧΡΗΣΗΣ",
      blocks: [
        p(
          "Με τη χρήση των υπηρεσιών του γραφείου και της ιστοσελίδας valitsatravel.gr, ο πελάτης δηλώνει ότι έχει διαβάσει, κατανοήσει και αποδεχθεί πλήρως τους παρόντες Γενικούς Όρους Χρήσης, τόσο για τον ίδιο όσο και για όλους τους συμμετέχοντες που περιλαμβάνονται στην κράτησή του, για τους οποίους δηλώνει ότι είναι νόμιμα εξουσιοδοτημένος.",
        ),
        p(
          "Οι παρόντες όροι ισχύουν στο σύνολό τους και δεν εφαρμόζονται επιλεκτικά ή μερικώς.",
        ),
        p(
          "Σε περίπτωση μη συμφωνίας με οποιοδήποτε μέρος των Όρων Χρήσης, ο χρήστης οφείλει να μην προχωρήσει σε χρήση της ιστοσελίδας ή των υπηρεσιών του γραφείου.",
        ),
      ],
    },
  ],
};

export const termsEn: TermsContent = {
  documentTitle:
    "GENERAL TERMS OF USE & TERMS OF PARTICIPATION – VALITSA TRAVEL",
  modalTitle: "Terms & Conditions",
  seoDescription:
    "General terms of use and terms of participation for organized trips with Valitsa Travel — valitsatravel.gr",
  sections: [
    {
      id: "participation",
      title: "1. PARTICIPATION IN ORGANIZED TRIPS (INTRODUCTION)",
      blocks: [
        p(
          "Participation in any excursion listed on the website of our travel agency under the trade name VALITSA TRAVEL automatically means that you have read and unconditionally accepted the following terms, which are consistent with EU Directive 90/314/EEC and Presidential Decree 339/1996. We ask that you read them carefully.",
        ),
        p(
          "Registration for an organized trip and seat reservations are valid only after payment of the applicable deposit or full amount required each time, which constitutes the customer's unconditional acceptance of these terms.",
        ),
        p(
          "The right to participate in the trip is secured by full payment of the total price and related charges before departure: at least 14 full days (or 2 weeks) in advance for domestic trips, and at least 21 full days (3 weeks) in advance for international trips.",
        ),
        p(
          "The participating customer who made the booking is deemed to represent their family or group and is obliged to inform all persons represented by them about the trip details and terms. Participants registered through a third party have the same obligations as the representative who enrolled them in the trip.",
        ),
      ],
    },
    {
      id: "agency-liability",
      title: "2. LIABILITY OF OUR AGENCY",
      blocks: [
        p(
          "VALITSA TRAVEL (hereinafter the travel agency or agency) acts as an intermediary between customers—excursion participants (hereinafter participants)—and various tour operators that bear exclusive responsibility for organizing the programs contained on this website/brochure, as well as other entities (ferry companies, airlines) for the purpose of selling organized travel packages.",
        ),
        p(
          "With respect to these entities, our agency, as an exclusive intermediary, does not participate in the design and organization of travel packages and therefore bears no liability in cases of organizational shortcomings arising from these third parties through whom the excursion program is carried out. Such a case is, for example, the smooth operation of ferry schedules (our agency bears no liability for any changes, delays or cancellations of departure, change of vessel, change of sailing schedule, etc.). Ferry (or airline) companies may modify schedules and types of transport (ships/aircraft) without any prior notice. Our agency bears no liability for any delay, change of departure/flight schedule, change of ship/aircraft type, or flight cancellation due to force majeure. VALITSA TRAVEL has only an intermediary role.",
        ),
        p(
          "It is also not liable for irregularities in the execution of the excursion and any difficulties due to events constituting force majeure (wars, adverse weather conditions, strikes, hijackings, natural disasters, etc.), nor for possible accidents, illnesses due to climatic conditions, epidemics, poisonings, criminal acts, theft of items, loss of luggage or money or passports, damage to luggage, etc.",
        ),
      ],
    },
    {
      id: "program-execution",
      title: "3. EXECUTION – APPLICATION OF THE PROGRAM",
      blocks: [
        p(
          "In many cases, due to unstable factors and unforeseen circumstances, the organizer of organized tourist trips is obliged to change and modify the program. A possible change in departure times of transport from morning to afternoon or vice versa, or the boarding time on a coach for a road excursion, is not considered a program change. A change or modification of the program may occur both before the departure of the excursion and during its course.",
        ),
        sub("a) Before departure", [
          p(
            "The trip program may be modified, as stated above, due to unstable factors such as delays or cancellations of transport schedules (aircraft, ships, etc.), hotel changes due to problems in building facilities, or events that occur unexpectedly at the destination (e.g. weather conditions, political events, unrest, etc.).",
          ),
        ]),
        sub("b) During the excursion", [
          p(
            "The excursion leader at any given time has the right, aiming solely at the safety of participants and the best possible execution of the program, when an unforeseen event or irregularity arises from the unstable factors mentioned above (delays or cancellations of transport schedules, wars, political unrest, strikes, weather conditions, etc.) to make modifications to the program.",
          ),
          p(
            "Indicatively, one such case is the prohibition of a ship's departure for the return of participants due to weather conditions and the need for additional time of stay at the accommodation.",
          ),
        ]),
      ],
    },
    {
      id: "seat-bookings",
      title: "4. SEAT RESERVATIONS",
      blocks: [
        p(
          "For any seat reservation for participation in an excursion offered by the agency and listed on the website to be valid, a deposit equal to 30% of the total price must be paid within 3 days of the booking date (day 1 is the booking date), and full payment of the excursion must be completed 14 days before the departure of each excursion.",
        ),
        p(
          "If the organizer applies a different schedule for deposit/final payment of the excursion, this will be communicated to the customer by any appropriate means (email, WhatsApp, Viber, etc.) or stated in the excursion description.",
        ),
      ],
    },
    {
      id: "traveler-obligations",
      title: "5. OBLIGATIONS – LIABILITY OF TRAVELERS",
      blocks: [
        sub("Participation", [
          p(
            "Participation in a group trip requires compliance with the program, instructions of the leader, escort or guide, and timely presence at all predetermined meeting points and departure times (transport, flights, excursions, guided tours, meals, etc.).",
          ),
          p(
            "Delay or failure to arrive on time may result in loss of part or all of a scheduled service, without right to refund or compensation. In such a case, the traveler bears exclusive responsibility and the costs of rejoining the group.",
          ),
          p(
            "The excursion leader or escort also reserves the right to continue the program without delayed participants, to ensure the smooth conduct of the excursion and respect for the group as a whole.",
          ),
        ]),
        sub("Force Majeure", [
          p(
            "In cases of force majeure, such as indicatively bad weather, strikes, delays or cancellations of schedules, the travel agency is not liable for additional expenses that may arise (accommodation, meals, transport, ticket changes, etc.), which are borne by the travelers.",
          ),
        ]),
        sub("Travel Documents", [
          p(
            "Travelers bear exclusive responsibility for possession, legality and validity of all required travel documents (identity card, passport, visa, certificates or other required formalities). Lack or failure to obtain them in time does not constitute grounds for free cancellation and entails the applicable cancellation charges.",
          ),
          p(
            "Currency exchange commission is also the exclusive responsibility of the traveler.",
          ),
        ]),
      ],
    },
    {
      id: "luggage",
      title: "6. LUGGAGE",
      blocks: [
        p(
          "Luggage is carried under the exclusive responsibility and care of travelers throughout the trip, regardless of whether an escort or representative of the agency is present.",
        ),
        p(
          "In case of loss, delay or damage to luggage, the regulations of the respective carrier apply (such as indicatively IATA regulations for air transport) and the applicable international conventions or regulations governing each means of transport or accommodation.",
        ),
        p(
          "The travel agency is not liable for loss, damage or the contents of luggage.",
        ),
      ],
    },
    {
      id: "cancellations",
      title: "7. CANCELLATION OF PARTICIPATION BY THE TRAVELER",
      blocks: [
        p(
          "Every traveler retains the right to cancel their participation in an organized trip or excursion by written notice to the travel agency.",
        ),
        p(
          "Cancellation entails application of the applicable cancellation charges, regardless of booking date or whether part or all of the trip has been paid, as the agency undertakes commitments and financial obligations (penalties) in advance to third-party providers (such as hotels, airlines or ferry companies, transport and other partners).",
        ),
        p(
          "Any cancellation made within the last 21 days before departure is considered last-minute, unless our partner/organizer specifies otherwise in the description of the particular excursion.",
        ),
        p(
          "In case of a different policy of partner/organizer/service provider, the special terms of the specific program prevail, which will be communicated to the traveler promptly whenever requested.",
        ),
        p(
          "Where feasible and permitted by the trip terms, the traveler may transfer their participation to another person, in accordance with the prescribed conditions. Otherwise, the applicable cancellation charges apply as usual.",
        ),
        p(
          "For special terms or offers on air fares, after ticket issuance cancellation fees of up to 100% of the ticket value may apply, regardless of booking or cancellation time.",
        ),
      ],
    },
    {
      id: "miscellaneous",
      title: "8. MISCELLANEOUS",
      blocks: [
        p(
          "Flight times and schedules stated in the Company's brochures and on its website are indicative and may be modified by the airlines. Final departure and arrival times are communicated to travelers through the excursion information note, usually sent two (2) to three (3) days before departure. In the event of changes to schedules, flight times, aircraft types, or delays attributable to airlines or any other carrier for operational, technical, or other reasons beyond the organizer's control, the Company bears no liability.",
        ),
        p(
          "Triple rooms offered at hotels are, as a rule, double rooms with an additional bed (extra bed), which may be a folding bed, sofa bed, or other equivalent type of supplementary bed, in accordance with the specifications of each accommodation.",
        ),
        p(
          "The order in which visits, excursions, guided tours, and other program activities are carried out may be modified or conducted in a different or reverse sequence from that originally announced, where this is deemed necessary for operational reasons or to better serve participants. In every case, none of the services or guided tours provided for in the program is omitted. The Company reserves the right to substitute the hotels listed with others of the same or higher category, without prior notice, where this becomes necessary for organizational or availability reasons.",
        ),
        p(
          "Upon completion of the trip, the Company issues the tax documents required under applicable law and sends them to the customer electronically, either to the email address provided or via electronic communication applications such as Viber or WhatsApp. For any information or clarification regarding the issuance and delivery of documents, customers may contact the Company at 210 260 6248.",
        ),
      ],
    },
    {
      id: "privacy",
      title: "9. PERSONAL DATA PROTECTION POLICY",
      blocks: [
        p(
          "VALITSA TRAVEL collects and processes only the personal data strictly necessary for the proper organization, booking and delivery of the travel services it provides.",
        ),
        p(
          "This data is used only for purposes directly related to booking and execution of the trip, such as indicatively issuing ferry or air tickets, accommodation reservations, transport and other related services. For example, information such as date of birth may be necessary for issuing certain tickets or providing special travel services.",
        ),
        p(
          "VALITSA TRAVEL transfers necessary data only to cooperating providers or entities directly involved in completing the booking and providing the agreed services, exclusively to the extent required.",
        ),
        p(
          "It does not sell, commercially exploit or disclose personal data to third parties without authorization.",
        ),
        p(
          "Personal data is managed with the aim of ensuring their confidentiality and security.",
        ),
      ],
    },
    {
      id: "disputes",
      title: "10. DISPUTE RESOLUTION",
      blocks: [
        p(
          "Every participation in an organized or individual trip is governed by Greek law.",
        ),
        p(
          "Any disputes that may arise between the traveler and the agency shall first be subject to an effort to resolve them in good faith and by amicable settlement.",
        ),
        p(
          "If out-of-court resolution is not possible, the Courts of Athens shall have jurisdiction.",
        ),
      ],
    },
    {
      id: "acceptance",
      title: "11. ACCEPTANCE OF TERMS OF USE",
      blocks: [
        p(
          "By using the agency's services and the website valitsatravel.gr, the customer declares that they have read, understood and fully accepted these General Terms of Use, both for themselves and for all participants included in their booking, for whom they declare they are legally authorized.",
        ),
        p(
          "These terms apply in their entirety and are not applied selectively or partially.",
        ),
        p(
          "If the user does not agree with any part of the Terms of Use, they must not proceed to use the website or the agency's services.",
        ),
      ],
    },
  ],
};
