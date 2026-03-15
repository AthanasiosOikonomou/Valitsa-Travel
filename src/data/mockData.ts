export type TripLang = "en" | "gr";

export interface TripLocalizedContent {
  title: string;
  location: string;
  duration: string;
  tags: string[];
  description: string;
  program: string[];
  included: string[];
  dateRange: string;
  departureCity: string;
}

export interface Trip {
  id: number;
  title: string;
  location: string;
  country: string;
  price: string;
  priceNum: number;
  duration: string;
  durationDays: number;
  type: "Exotic" | "Road Trip" | "Flight";
  image: string;
  tags: string[];
  description: string;
  program: string[];
  included: string[];
  isFeatured: boolean;
  dateRange: string;
  departureCity: string;
  category: string;
  transport: string;
  isBonus?: boolean;
  hasAvailableSeats?: boolean;
  guaranteedDeparture?: boolean;
  i18n?: Record<TripLang, TripLocalizedContent>;
}

const rawTrips: Omit<Trip, "i18n">[] = [
  {
    id: 1,
    title: "Amalfi Coast Private Estate",
    location: "Positano, Italy",
    country: "Italy",
    price: "$12,500",
    priceNum: 12500,
    duration: "7 Days",
    durationDays: 7,
    type: "Exotic",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
    tags: ["Private Chef", "Yacht Access"],
    description:
      "Experience the pinnacle of Mediterranean luxury along Italy's most iconic coastline. Your private cliffside estate overlooks the Tyrrhenian Sea, with a dedicated chef preparing regional cuisine from locally sourced ingredients.",
    program: [
      "Day 1 — Private jet transfer, estate welcome dinner",
      "Day 2 — Amalfi town exploration, limoncello masterclass",
      "Day 3 — Full-day yacht cruise to Capri",
      "Day 4 — Cooking class with Michelin-starred chef",
      "Day 5 — Ravello gardens & concert at Villa Rufolo",
      "Day 6 — Free day, spa & wellness",
      "Day 7 — Farewell brunch, departure",
    ],
    included: [
      "Private estate accommodation",
      "Dedicated chef & butler",
      "Yacht charter (2 days)",
      "Airport transfers",
      "Michelin dining experience",
      "24/7 concierge",
    ],
    isFeatured: true,
    dateRange: "Μάρτιος - Σεπτέμβριος 2026",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    isBonus: true,
    hasAvailableSeats: true,
    guaranteedDeparture: true,
  },
  {
    id: 2,
    title: "Kyoto Zen Sanctuary",
    location: "Kyoto, Japan",
    country: "Japan",
    price: "$8,900",
    priceNum: 8900,
    duration: "10 Days",
    durationDays: 10,
    type: "Exotic",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200",
    tags: ["Cultural", "Wellness"],
    description:
      "Immerse yourself in the timeless beauty of Kyoto, where ancient tradition meets refined luxury. Stay in a restored machiya townhouse with a private zen garden.",
    program: [
      "Day 1 — Arrival, private machiya check-in",
      "Day 2 — Fushimi Inari at dawn, kaiseki dinner",
      "Day 3 — Tea ceremony with Grand Tea Master",
      "Day 4 — Arashiyama bamboo grove, kimono experience",
      "Day 5 — Day trip to Nara, sake tasting",
      "Day 6 — Pottery workshop with living national treasure",
      "Day 7 — Zen monastery overnight stay",
      "Day 8 — Kinkaku-ji & Ryoan-ji, onsen evening",
      "Day 9 — Free exploration, Nishiki Market",
      "Day 10 — Farewell ceremony, departure",
    ],
    included: [
      "Machiya accommodation",
      "Private guide",
      "All cultural experiences",
      "Kaiseki dining (5 nights)",
      "Monastery stay",
      "Shinkansen passes",
    ],
    isFeatured: true,
    dateRange: "Φεβρουάριος - Μάιος 2026",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
    guaranteedDeparture: true,
  },
  {
    id: 3,
    title: "Reykjavik Aurora Dome",
    location: "Iceland",
    country: "Iceland",
    price: "$6,400",
    priceNum: 6400,
    duration: "5 Days",
    durationDays: 5,
    type: "Road Trip",
    image:
      "https://images.prismic.io/perlan/67b9ae3a-0794-464b-b84c-fae8e7f46b3c_Reykjavi%CC%81k+Esjan+Nor%C3%B0urljo%CC%81s+fra%CC%81+A%CC%81lftanesi.++13439-157-5442.png?auto=format&fit=crop&q=80&w=1200",
    tags: ["Adventure", "Luxury"],
    description:
      "Sleep beneath the Northern Lights in a heated glass dome perched on Iceland's volcanic landscape.",
    program: [
      "Day 1 — Reykjavik arrival, Blue Lagoon retreat",
      "Day 2 — Golden Circle tour, aurora dome check-in",
      "Day 3 — Glacier hike & ice cave exploration",
      "Day 4 — Snorkeling Silfra fissure, geothermal cooking",
      "Day 5 — Black sand beach sunrise, departure",
    ],
    included: [
      "Aurora dome accommodation",
      "Luxury 4x4 vehicle",
      "Private adventure guide",
      "Blue Lagoon access",
      "All meals",
      "Northern Lights guarantee program",
    ],
    isFeatured: true,
    dateRange: "Οκτώβριος - Μάρτιος 2026",
    departureCity: "Θεσσαλονίκη",
    category: "adventure",
    transport: "bus",
    isBonus: true,
    hasAvailableSeats: true,
  },
  {
    id: 4,
    title: "Swiss Alps Heli-Ski",
    location: "Zermatt, Switzerland",
    country: "Switzerland",
    price: "$15,200",
    priceNum: 15200,
    duration: "6 Days",
    durationDays: 6,
    type: "Flight",
    image:
      "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&q=80&w=1200",
    tags: ["Ski-in", "Private Jet"],
    description:
      "The ultimate alpine experience for the discerning adventurer. Arrive by private helicopter to your chalet in Zermatt.",
    program: [
      "Day 1 — Private jet to Geneva, helicopter to Zermatt",
      "Day 2 — Heli-ski orientation, first descent",
      "Day 3 — Full-day heli-skiing, 4 drops",
      "Day 4 — Backcountry touring, mountain lunch",
      "Day 5 — Gornergrat railway, spa afternoon",
      "Day 6 — Final morning ski, helicopter departure",
    ],
    included: [
      "Private chalet (ski-in/ski-out)",
      "Helicopter transfers",
      "4 heli-ski sessions",
      "Mountain guide",
      "All meals & wine",
      "Spa access",
    ],
    isFeatured: false,
    dateRange: "Δεκέμβριος 2026 - Μάρτιος 2027",
    departureCity: "Αθήνα",
    category: "adventure",
    transport: "plane",
    guaranteedDeparture: true,
  },
  {
    id: 5,
    title: "Serengeti Sky Safari",
    location: "Tanzania",
    country: "Tanzania",
    price: "$11,000",
    priceNum: 11000,
    duration: "8 Days",
    durationDays: 8,
    type: "Exotic",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200",
    tags: ["Wildlife", "Glamping"],
    description:
      "Witness the Great Migration from the most exclusive vantage points in the Serengeti.",
    program: [
      "Day 1 — Arusha arrival, Arusha Coffee Lodge",
      "Day 2 — Bush flight to central Serengeti",
      "Day 3–4 — Game drives, big cat tracking",
      "Day 5 — Fly to northern Serengeti, migration viewing",
      "Day 6 — Hot air balloon safari at dawn",
      "Day 7 — Ngorongoro Crater excursion",
      "Day 8 — Final morning drive, departure flight",
    ],
    included: [
      "Luxury tented camps",
      "All bush flights",
      "Private safari vehicle & guide",
      "Balloon safari",
      "Full board & premium drinks",
      "Park fees & conservation levy",
    ],
    isFeatured: false,
    dateRange: "Ιούνιος - Οκτώβριος 2026",
    departureCity: "Λάρνακα",
    category: "wildlife",
    transport: "plane",
    hasAvailableSeats: true,
  },
  {
    id: 6,
    title: "Patagonia End of World",
    location: "Chile",
    country: "Chile",
    price: "$9,800",
    priceNum: 9800,
    duration: "12 Days",
    durationDays: 12,
    type: "Road Trip",
    image:
      "https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&q=80&w=1200",
    tags: ["Expedition", "Remote"],
    description:
      "Journey to the edge of the world through Patagonia's otherworldly landscapes.",
    program: [
      "Day 1 — Santiago arrival, overnight",
      "Day 2 — Flight to Punta Arenas, drive to lodge",
      "Day 3–4 — Torres del Paine treks",
      "Day 5 — Perito Moreno Glacier crossing",
      "Day 6–7 — Estancia experience, horseback riding",
      "Day 8 — Marble Caves boat expedition",
      "Day 9–10 — Carretera Austral driving",
      "Day 11 — Pumalín Park, hot springs",
      "Day 12 — Final drive, departure from Puerto Montt",
    ],
    included: [
      "Boutique lodge & estancia stays",
      "Luxury 4x4 with driver",
      "Private trekking guide",
      "All meals",
      "Glacier equipment",
      "Internal flights",
    ],
    isFeatured: true,
    dateRange: "Νοέμβριος 2026 - Φεβρουάριος 2027",
    departureCity: "Θεσσαλονίκη",
    category: "expedition",
    transport: "bus",
    isBonus: true,
    guaranteedDeparture: true,
    hasAvailableSeats: true,
  },
  {
    id: 7,
    title: "Sounio Sunset Escape",
    location: "Attica, Greece",
    country: "Greece",
    price: "€80",
    priceNum: 80,
    duration: "1 Day",
    durationDays: 1,
    type: "Road Trip",
    image:
      "https://images.unsplash.com/photo-1605153322277-dd0d7f608b4d?auto=format&fit=crop&q=80&w=1200",
    tags: ["History", "Sunset"],
    description:
      "A private coastal drive to the Temple of Poseidon for the most iconic sunset in Attica.",
    program: [
      "14:00 Departure from Athens",
      "15:30 Coastal drive & coffee",
      "18:00 Temple visit",
      "20:00 Seafood dinner",
    ],
    included: ["Private transport", "Entrance fees", "Guide"],
    isFeatured: false,
    dateRange: "Year Round",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "bus",
    hasAvailableSeats: true,
  },
  {
    id: 8,
    title: "Nafplio Weekend",
    location: "Peloponnese, Greece",
    country: "Greece",
    price: "€250",
    priceNum: 250,
    duration: "2 Days",
    durationDays: 2,
    type: "Road Trip",
    image:
      "https://greeking.me/images/blog/images/Hero-images/top-things-to-do-in-nafplio-Heracles-Kritikos-shutterstock.jpg?auto=format&fit=crop&q=80&w=1200",
    tags: ["Romantic", "Architecture"],
    description:
      "Explore the first capital of Greece, walk the Palamidi castle, and enjoy the Bourtzi view.",
    program: [
      "Day 1: Arrival & Palamidi Climb",
      "Day 2: Epidaurus Theater visit & Return",
    ],
    included: ["Boutique Hotel", "Breakfast", "Guide"],
    isFeatured: false,
    dateRange: "Μάιος - Οκτώβριος 2026",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "bus",
    hasAvailableSeats: true,
  },
  {
    id: 9,
    title: "Santorini Caldera Luxury",
    location: "Oia, Greece",
    country: "Greece",
    price: "€1,800",
    priceNum: 1800,
    duration: "4 Days",
    durationDays: 4,
    type: "Flight",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1200",
    tags: ["Luxury", "Honeymoon"],
    description:
      "Stay in a cave suite with a private pool overlooking the volcanic caldera.",
    program: [
      "Day 1: Arrival",
      "Day 2: Private Catamaran Cruise",
      "Day 3: Wine Tasting",
      "Day 4: Departure",
    ],
    included: ["Luxury Suite", "Catamaran Cruise", "Transfers"],
    isFeatured: true,
    dateRange: "Ιούνιος - Σεπτέμβριος 2026",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
  },
  {
    id: 10,
    title: "Meteora Monasteries",
    location: "Kalabaka, Greece",
    country: "Greece",
    price: "€320",
    priceNum: 320,
    duration: "3 Days",
    durationDays: 3,
    type: "Road Trip",
    image:
      "https://idsb.tmgrup.com.tr/ly/uploads/images/2024/01/16/310379.jpg?auto=format&fit=crop&q=80&w=1200",
    tags: ["Spiritual", "UNESCO"],
    description:
      "Visit the floating monasteries of Meteora and hike the ancient hermit trails.",
    program: [
      "Day 1: Athens to Kalabaka",
      "Day 2: Monastery Tour",
      "Day 3: Hiking & Return",
    ],
    included: ["Hotel stay", "Hiking guide", "Transport"],
    isFeatured: false,
    dateRange: "Μάρτιος - Νοέμβριος 2026",
    departureCity: "Αθήνα",
    category: "adventure",
    transport: "bus",
    guaranteedDeparture: true,
  },
  {
    id: 11,
    title: "Crete: The Great South",
    location: "Chania & Rethymno, Greece",
    country: "Greece",
    price: "€1,200",
    priceNum: 1200,
    duration: "10 Days",
    durationDays: 10,
    type: "Flight",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
    tags: ["Beach", "Gastronomy"],
    description:
      "A deep dive into Cretan culture, from Balos Lagoon to the Samaria Gorge.",
    program: [
      "Days 1-3: Chania Old Town",
      "Days 4-6: South Coast Beaches",
      "Days 7-10: Rethymno & Heraklion",
    ],
    included: ["Car rental", "Boutique stays", "Traditional dinners"],
    isFeatured: true,
    dateRange: "Ιούνιος - Σεπτέμβριος 2026",
    departureCity: "Θεσσαλονίκη",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
  },
  {
    id: 12,
    title: "Zagori Stone Villages",
    location: "Epirus, Greece",
    country: "Greece",
    price: "€650",
    priceNum: 650,
    duration: "5 Days",
    durationDays: 5,
    type: "Road Trip",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAvYiDbAdVYMnhSYYR1mw7fIMfDWtb6BIRCQ&s?auto=format&fit=crop&q=80&w=1200",
    tags: ["Nature", "Trekking"],
    description:
      "Experience the Vikos Gorge and the dragon lakes of the Pindus mountains.",
    program: [
      "Day 1: Ioannina",
      "Day 2-3: Vikos Trekking",
      "Day 4: Papigo Exploration",
      "Day 5: Return",
    ],
    included: ["Guesthouse stay", "Mountain guide", "Breakfast"],
    isFeatured: false,
    dateRange: "Απρίλιος - Οκτώβριος 2026",
    departureCity: "Αθήνα",
    category: "adventure",
    transport: "bus",
    isBonus: true,
  },
  {
    id: 13,
    title: "Mount Athos Spiritual Walk",
    location: "Halkidiki, Greece",
    country: "Greece",
    price: "€450",
    priceNum: 450,
    duration: "4 Days",
    durationDays: 4,
    type: "Road Trip",
    image:
      "https://www.greeka.com/seedo/photos/404/halkidiki-mount-athos-top-1-1280.jpg?auto=format&fit=crop&q=80&w=1200",
    tags: ["Religious", "Restricted"],
    description:
      "A pilgrimage to the Holy Mountain. Traditional monastery stays and spiritual guidance.",
    program: [
      "Day 1: Ouranoupolis",
      "Day 2-3: Monastery stays",
      "Day 4: Return",
    ],
    included: ["Permits (Diamonitirion)", "Monastery meals", "Ferry tickets"],
    isFeatured: false,
    dateRange: "Year Round",
    departureCity: "Θεσσαλονίκη",
    category: "cultural",
    transport: "bus",
    guaranteedDeparture: true,
  },
  {
    id: 14,
    title: "Rhodes Knights & Beaches",
    location: "Rhodes, Greece",
    country: "Greece",
    price: "€850",
    priceNum: 850,
    duration: "6 Days",
    durationDays: 6,
    type: "Flight",
    image:
      "https://media.cntraveler.com/photos/684c4cbd5d93e747e811228c/16:9/w_2560%2Cc_limit/best-things-to-do-rhodes-june4-Symi_GettyImages-1055006166.jpg?auto=format&fit=crop&q=80&w=1200",
    tags: ["Medieval", "Sunny"],
    description:
      "Walk the Street of the Knights and soak in the turquoise waters of Lindos.",
    program: [
      "Day 1-2: Old Town",
      "Day 3-4: Lindos Acropolis",
      "Day 5: Valley of Butterflies",
      "Day 6: Departure",
    ],
    included: ["4-star Hotel", "Flights", "Guide"],
    isFeatured: false,
    dateRange: "Μάιος - Οκτώβριος 2026",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
  },
  {
    id: 15,
    title: "Hydra Artist Retreat",
    location: "Hydra, Greece",
    country: "Greece",
    price: "€200",
    priceNum: 200,
    duration: "1 Day",
    durationDays: 1,
    type: "Flight", // Representing the flying dolphins/hydrofoils
    image:
      "https://www.dotwnews.com/uploads/posts_photos/shutterstock_2069796770-hr4rno.jpg?auto=format&fit=crop&q=80&w=1200",
    tags: ["No Cars", "Art"],
    description:
      "A day on the island where cars are banned and donkeys rule the streets.",
    program: [
      "08:00 Ferry from Piraeus",
      "11:00 Swimming",
      "14:00 Harbor Lunch",
      "19:00 Return",
    ],
    included: ["Ferry tickets", "Lunch", "Walking tour"],
    isFeatured: false,
    dateRange: "Year Round",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
  },
  {
    id: 16,
    title: "Pelion: Mountain meets Sea",
    location: "Volos, Greece",
    country: "Greece",
    price: "€700",
    priceNum: 700,
    duration: "5 Days",
    durationDays: 5,
    type: "Road Trip",
    image:
      "https://www.visitgreece.gr/images/1743x752/jpg/files/merakos_001_pelion-makrynitsa_1743x752.jpg?auto=format&fit=crop&q=80&w=1200",
    tags: ["Traditional", "Nature"],
    description:
      "Discover the mythical land of the Centaurs with stone villages and crystal beaches.",
    program: [
      "Day 1: Portaria",
      "Day 2: Makrinitsa",
      "Day 3: Mylopotamos beach",
      "Day 4: Damouchari",
      "Day 5: Return",
    ],
    included: ["Traditional Guesthouse", "Breakfast", "Guided walk"],
    isFeatured: false,
    dateRange: "Σεπτέμβριος - Οκτώβριος 2026",
    departureCity: "Θεσσαλονίκη",
    category: "adventure",
    transport: "bus",
    isBonus: true,
  },
];

// International Trips to complete the set of 10
const rawInternationalTrips: Omit<Trip, "i18n">[] = [
  // ... including your existing IDs 1-6 ...
  {
    id: 17,
    title: "Paris & Champagne",
    location: "Paris, France",
    country: "France",
    price: "$3,200",
    priceNum: 3200,
    duration: "5 Days",
    durationDays: 5,
    type: "Flight",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1200",
    tags: ["Fashion", "Wine"],
    description:
      "The City of Light with a private tour of the Moët & Chandon cellars.",
    program: [
      "Day 1: Arrival",
      "Day 2: Louvre Private Tour",
      "Day 3: Champagne Day Trip",
      "Day 4: Montmartre",
      "Day 5: Departure",
    ],
    included: ["5-star Hotel", "Champagne Tour", "Flights"],
    isFeatured: false,
    dateRange: "Year Round",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
  },
  {
    id: 18,
    title: "Amazon Rainforest Odyssey",
    location: "Peru",
    country: "Peru",
    price: "$7,500",
    priceNum: 7500,
    duration: "15 Days",
    durationDays: 15,
    type: "Exotic",
    image:
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&q=80&w=1200",
    tags: ["Wilderness", "Survival"],
    description:
      "Deep jungle immersion followed by the majesty of Machu Picchu.",
    program: [
      "Days 1-5: Amazon Cruise",
      "Days 6-10: Cusco & Sacred Valley",
      "Days 11-13: Machu Picchu Trek",
      "Day 14-15: Lima",
    ],
    included: [
      "Luxury Riverboat",
      "Train to Machu Picchu",
      "Guides",
      "All meals",
    ],
    isFeatured: true,
    dateRange: "Μάιος - Σεπτέμβριος 2026",
    departureCity: "Αθήνα",
    category: "expedition",
    transport: "plane",
    isBonus: true,
  },
  {
    id: 19,
    title: "Cairo & Nile Luxury",
    location: "Egypt",
    country: "Egypt",
    price: "$4,800",
    priceNum: 4800,
    duration: "8 Days",
    durationDays: 8,
    type: "Exotic",
    image:
      "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=1200",
    tags: ["Ancient", "River Cruise"],
    description:
      "Private access to the Great Pyramids and a luxury dahabiya cruise down the Nile.",
    program: [
      "Day 1: Cairo",
      "Day 2: Pyramids & Sphinx",
      "Day 3-6: Nile Cruise",
      "Day 7: Luxor Valley of Kings",
      "Day 8: Departure",
    ],
    included: ["Private Egyptologist", "5-star Cruise", "Domestic flights"],
    isFeatured: false,
    dateRange: "Οκτώβριος - Απρίλιος 2026",
    departureCity: "Λάρνακα",
    category: "cultural",
    transport: "plane",
    guaranteedDeparture: true,
  },
  {
    id: 20,
    title: "New York City Lights",
    location: "New York, USA",
    country: "USA",
    price: "$5,500",
    priceNum: 5500,
    duration: "7 Days",
    durationDays: 7,
    type: "Flight",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200",
    tags: ["City", "Shopping"],
    description:
      "From Broadway shows to a private helicopter tour over Manhattan.",
    program: [
      "Day 1: Times Square",
      "Day 2: Central Park",
      "Day 3: Museum Day",
      "Day 4: Brooklyn Exploration",
      "Day 5: Helicopter tour",
      "Day 6: Shopping",
      "Day 7: Departure",
    ],
    included: ["Manhattan Hotel", "Broadway tickets", "Helicopter ride"],
    isFeatured: true,
    dateRange: "Δεκέμβριος 2026",
    departureCity: "Αθήνα",
    category: "cultural",
    transport: "plane",
    hasAvailableSeats: true,
  },
];

const greekToEnglishCityMap: Record<string, string> = {
  Αθήνα: "Athens",
  Θεσσαλονίκη: "Thessaloniki",
  Λάρνακα: "Larnaca",
};

const greekToEnglishDateMap: Record<string, string> = {
  Μάρτιος: "March",
  Σεπτέμβριος: "September",
  Φεβρουάριος: "February",
  Μάιος: "May",
  Οκτώβριος: "October",
  Δεκέμβριος: "December",
  Απρίλιος: "April",
  Νοέμβριος: "November",
  Ιούνιος: "June",
  Ιούλιος: "July",
  Αύγουστος: "August",
  Ιανουάριος: "January",
  "Year Round": "Year Round",
};

const englishToGreekDateMap: Record<string, string> = {
  March: "Μάρτιος",
  September: "Σεπτέμβριος",
  February: "Φεβρουάριος",
  May: "Μάιος",
  October: "Οκτώβριος",
  December: "Δεκέμβριος",
  April: "Απρίλιος",
  November: "Νοέμβριος",
  June: "Ιούνιος",
  July: "Ιούλιος",
  August: "Αύγουστος",
  January: "Ιανουάριος",
  "Year Round": "Όλο τον Χρόνο",
};

const greekTripOverrides: Record<number, Partial<TripLocalizedContent>> = {
  1: {
    title: "Ιδιωτική Έπαυλη στην Ακτή Αμάλφι",
    location: "Ποζιτάνο, Ιταλία",
    tags: ["Ιδιωτικός Σεφ", "Πρόσβαση με Yacht"],
    description:
      "Ζήστε την απόλυτη μεσογειακή πολυτέλεια στην πιο εμβληματική ακτογραμμή της Ιταλίας. Η ιδιωτική σας έπαυλη πάνω στον γκρεμό βλέπει στο Τυρρηνικό Πέλαγος, με προσωπικό σεφ που ετοιμάζει τοπικές γεύσεις από εκλεκτές πρώτες ύλες.",
    program: [
      "Ημέρα 1 — Μεταφορά με ιδιωτικό jet, δείπνο υποδοχής στην έπαυλη",
      "Ημέρα 2 — Εξερεύνηση Αμάλφι, μάθημα λιμοντσέλο",
      "Ημέρα 3 — Ολοήμερη κρουαζιέρα με yacht στο Κάπρι",
      "Ημέρα 4 — Μάθημα μαγειρικής με βραβευμένο σεφ Michelin",
      "Ημέρα 5 — Κήποι του Ραβέλλο και συναυλία στη Villa Rufolo",
      "Ημέρα 6 — Ελεύθερη μέρα, spa και ευεξία",
      "Ημέρα 7 — Αποχαιρετιστήριο brunch, αναχώρηση",
    ],
    included: [
      "Διαμονή σε ιδιωτική έπαυλη",
      "Προσωπικός σεφ και μπάτλερ",
      "Ναύλωση yacht (2 ημέρες)",
      "Μεταφορές από και προς το αεροδρόμιο",
      "Γεύμα σε εστιατόριο Michelin",
      "24/7 concierge service",
    ],
  },
  2: {
    title: "Zen Καταφύγιο στο Κιότο",
    location: "Κιότο, Ιαπωνία",
    tags: ["Πολιτισμός", "Ευεξία"],
    description:
      "Βυθιστείτε στη διαχρονική ομορφιά του Κιότο, εκεί όπου η αρχαία παράδοση συναντά τη λεπτή πολυτέλεια. Διαμονή σε αναπαλαιωμένη machiya κατοικία με ιδιωτικό zen κήπο.",
    program: [
      "Ημέρα 1 — Άφιξη, ιδιωτικό check-in στη machiya",
      "Ημέρα 2 — Fushimi Inari την αυγή, δείπνο kaiseki",
      "Ημέρα 3 — Τελετή τσαγιού με Grand Tea Master",
      "Ημέρα 4 — Άλσος μπαμπού Arashiyama, εμπειρία kimono",
      "Ημέρα 5 — Εκδρομή στη Νάρα, γευσιγνωσία sake",
      "Ημέρα 6 — Εργαστήριο κεραμικής με living national treasure",
      "Ημέρα 7 — Διανυκτέρευση σε zen μοναστήρι",
      "Ημέρα 8 — Kinkaku-ji & Ryoan-ji, βραδιά σε onsen",
      "Ημέρα 9 — Ελεύθερη εξερεύνηση, Nishiki Market",
      "Ημέρα 10 — Αποχαιρετιστήρια τελετή, αναχώρηση",
    ],
    included: [
      "Διαμονή σε machiya",
      "Ιδιωτικός ξεναγός",
      "Όλες οι πολιτιστικές εμπειρίες",
      "Δείπνα kaiseki (5 βράδια)",
      "Διαμονή σε μοναστήρι",
      "Πάσα Shinkansen",
    ],
  },
  3: {
    title: "Aurora Dome στο Ρέικιαβικ",
    location: "Ισλανδία",
    tags: ["Περιπέτεια", "Πολυτέλεια"],
    description:
      "Κοιμηθείτε κάτω από το Βόρειο Σέλας σε θερμαινόμενο γυάλινο dome, τοποθετημένο στο ηφαιστειακό τοπίο της Ισλανδίας.",
    program: [
      "Ημέρα 1 — Άφιξη στο Ρέικιαβικ, χαλάρωση στο Blue Lagoon",
      "Ημέρα 2 — Golden Circle tour, check-in στο aurora dome",
      "Ημέρα 3 — Πεζοπορία σε παγετώνα και εξερεύνηση ice cave",
      "Ημέρα 4 — Κατάδυση στο Silfra, γεωθερμική μαγειρική εμπειρία",
      "Ημέρα 5 — Ανατολή σε μαύρη αμμουδιά, αναχώρηση",
    ],
    included: [
      "Διαμονή σε aurora dome",
      "Πολυτελές 4x4 όχημα",
      "Ιδιωτικός adventure guide",
      "Είσοδος στο Blue Lagoon",
      "Όλα τα γεύματα",
      "Πρόγραμμα εγγύησης Βόρειου Σέλαος",
    ],
  },
  4: {
    title: "Heli-Ski στις Ελβετικές Άλπεις",
    location: "Ζερμάτ, Ελβετία",
    tags: ["Ski-in", "Ιδιωτικό Jet"],
    description:
      "Η απόλυτη αλπική εμπειρία για τον απαιτητικό ταξιδιώτη. Άφιξη με ιδιωτικό ελικόπτερο στο σαλέ σας στο Ζερμάτ.",
    program: [
      "Ημέρα 1 — Ιδιωτικό jet στη Γενεύη, ελικόπτερο για Ζερμάτ",
      "Ημέρα 2 — Εισαγωγή στο heli-ski, πρώτη κατάβαση",
      "Ημέρα 3 — Ολοήμερο heli-ski, 4 drops",
      "Ημέρα 4 — Backcountry touring, γεύμα στο βουνό",
      "Ημέρα 5 — Gornergrat railway, απόγευμα spa",
      "Ημέρα 6 — Τελικό πρωινό ski, αναχώρηση με ελικόπτερο",
    ],
    included: [
      "Ιδιωτικό chalet (ski-in/ski-out)",
      "Μεταφορές με ελικόπτερο",
      "4 συνεδρίες heli-ski",
      "Ορεινός οδηγός",
      "Όλα τα γεύματα και κρασί",
      "Πρόσβαση σε spa",
    ],
  },
  5: {
    title: "Sky Safari στο Σερενγκέτι",
    location: "Τανζανία",
    tags: ["Άγρια Ζωή", "Glamping"],
    description:
      "Παρακολουθήστε τη Μεγάλη Μετανάστευση από τα πιο αποκλειστικά σημεία θέας στο Σερενγκέτι.",
    program: [
      "Ημέρα 1 — Άφιξη στην Αρούσα, Arusha Coffee Lodge",
      "Ημέρα 2 — Bush flight στο κεντρικό Σερενγκέτι",
      "Ημέρα 3-4 — Game drives, εντοπισμός μεγάλων αιλουροειδών",
      "Ημέρα 5 — Πτήση στο βόρειο Σερενγκέτι, παρατήρηση μετανάστευσης",
      "Ημέρα 6 — Safari με αερόστατο την αυγή",
      "Ημέρα 7 — Εκδρομή στον κρατήρα Νγκορονγκόρο",
      "Ημέρα 8 — Τελικό πρωινό game drive, αναχώρηση",
    ],
    included: [
      "Luxury tented camps",
      "Όλες οι bush flights",
      "Ιδιωτικό safari vehicle και guide",
      "Safari με αερόστατο",
      "Πλήρης διατροφή και premium ποτά",
      "Τέλη πάρκων και conservation levy",
    ],
  },
  6: {
    title: "Παταγονία: Το Τέλος του Κόσμου",
    location: "Χιλή",
    tags: ["Εξερεύνηση", "Απομακρυσμένο"],
    description:
      "Ταξιδέψτε στην άκρη του κόσμου μέσα από τα εξωπραγματικά τοπία της Παταγονίας.",
    program: [
      "Ημέρα 1 — Άφιξη στο Σαντιάγο, διανυκτέρευση",
      "Ημέρα 2 — Πτήση στην Punta Arenas, οδική μεταφορά στο lodge",
      "Ημέρα 3-4 — Πεζοπορίες στο Torres del Paine",
      "Ημέρα 5 — Διάσχιση του παγετώνα Perito Moreno",
      "Ημέρα 6-7 — Εμπειρία estancia, ιππασία",
      "Ημέρα 8 — Boat expedition στις Marble Caves",
      "Ημέρα 9-10 — Διαδρομή στην Carretera Austral",
      "Ημέρα 11 — Pumalín Park, θερμές πηγές",
      "Ημέρα 12 — Τελική διαδρομή, αναχώρηση από Puerto Montt",
    ],
    included: [
      "Διαμονή σε boutique lodge και estancia",
      "Πολυτελές 4x4 με οδηγό",
      "Ιδιωτικός trekking guide",
      "Όλα τα γεύματα",
      "Εξοπλισμός παγετώνα",
      "Εσωτερικές πτήσεις",
    ],
  },
  7: {
    title: "Απόδραση στο Σούνιο με Ηλιοβασίλεμα",
    location: "Αττική, Ελλάδα",
    tags: ["Ιστορία", "Ηλιοβασίλεμα"],
    description:
      "Μια ιδιωτική παραθαλάσσια διαδρομή μέχρι τον Ναό του Ποσειδώνα για το πιο εμβληματικό ηλιοβασίλεμα της Αττικής.",
    program: [
      "14:00 Αναχώρηση από Αθήνα",
      "15:30 Παραλιακή διαδρομή και καφές",
      "18:00 Επίσκεψη στον ναό",
      "20:00 Δείπνο με θαλασσινά",
    ],
    included: ["Ιδιωτική μεταφορά", "Εισιτήρια εισόδου", "Ξεναγός"],
  },
  8: {
    title: "Σαββατοκύριακο στο Ναύπλιο",
    location: "Πελοπόννησος, Ελλάδα",
    tags: ["Ρομαντικό", "Αρχιτεκτονική"],
    description:
      "Εξερευνήστε την πρώτη πρωτεύουσα της Ελλάδας, ανεβείτε στο Παλαμήδι και απολαύστε τη θέα προς το Μπούρτζι.",
    program: [
      "Ημέρα 1 — Άφιξη και ανάβαση στο Παλαμήδι",
      "Ημέρα 2 — Επίσκεψη στην Επίδαυρο και επιστροφή",
    ],
    included: ["Boutique hotel", "Πρωινό", "Ξεναγός"],
  },
  9: {
    title: "Πολυτελής Καλντέρα Σαντορίνης",
    location: "Οία, Ελλάδα",
    tags: ["Πολυτέλεια", "Μήνας του Μέλιτος"],
    description:
      "Μείνετε σε cave suite με ιδιωτική πισίνα και θέα στην ηφαιστειακή καλντέρα.",
    program: [
      "Ημέρα 1 — Άφιξη",
      "Ημέρα 2 — Ιδιωτική κρουαζιέρα με καταμαράν",
      "Ημέρα 3 — Γευσιγνωσία κρασιού",
      "Ημέρα 4 — Αναχώρηση",
    ],
    included: ["Luxury suite", "Κρουαζιέρα με καταμαράν", "Μεταφορές"],
  },
  10: {
    title: "Μοναστήρια των Μετεώρων",
    location: "Καλαμπάκα, Ελλάδα",
    tags: ["Πνευματικότητα", "UNESCO"],
    description:
      "Επισκεφθείτε τα αιωρούμενα μοναστήρια των Μετεώρων και περπατήστε στα αρχαία μονοπάτια των ερημιτών.",
    program: [
      "Ημέρα 1 — Αθήνα προς Καλαμπάκα",
      "Ημέρα 2 — Περιήγηση στα μοναστήρια",
      "Ημέρα 3 — Πεζοπορία και επιστροφή",
    ],
    included: ["Διαμονή σε ξενοδοχείο", "Οδηγός πεζοπορίας", "Μεταφορά"],
  },
  11: {
    title: "Κρήτη: Ο Μεγάλος Νότος",
    location: "Χανιά & Ρέθυμνο, Ελλάδα",
    tags: ["Παραλία", "Γαστρονομία"],
    description:
      "Μια βαθιά γνωριμία με την κρητική κουλτούρα, από το Μπάλος μέχρι το φαράγγι της Σαμαριάς.",
    program: [
      "Ημέρες 1-3 — Παλιά Πόλη Χανίων",
      "Ημέρες 4-6 — Παραλίες νότιας ακτής",
      "Ημέρες 7-10 — Ρέθυμνο και Ηράκλειο",
    ],
    included: [
      "Ενοικίαση αυτοκινήτου",
      "Boutique διαμονές",
      "Παραδοσιακά δείπνα",
    ],
  },
  12: {
    title: "Πέτρινα Χωριά Ζαγορίου",
    location: "Ήπειρος, Ελλάδα",
    tags: ["Φύση", "Πεζοπορία"],
    description:
      "Ανακαλύψτε το φαράγγι του Βίκου και τις δρακόλιμνες της Πίνδου.",
    program: [
      "Ημέρα 1 — Ιωάννινα",
      "Ημέρα 2-3 — Πεζοπορία στο Βίκο",
      "Ημέρα 4 — Εξερεύνηση στο Πάπιγκο",
      "Ημέρα 5 — Επιστροφή",
    ],
    included: ["Ξενώνας", "Ορεινός οδηγός", "Πρωινό"],
  },
  13: {
    title: "Πνευματική Διαδρομή στο Άγιο Όρος",
    location: "Χαλκιδική, Ελλάδα",
    tags: ["Θρησκευτικό", "Περιορισμένη Πρόσβαση"],
    description:
      "Ένα προσκύνημα στο Άγιο Όρος με παραδοσιακή φιλοξενία σε μονές και πνευματική καθοδήγηση.",
    program: [
      "Ημέρα 1 — Ουρανούπολη",
      "Ημέρα 2-3 — Διαμονή σε μονές",
      "Ημέρα 4 — Επιστροφή",
    ],
    included: [
      "Άδειες εισόδου (Διαμονητήριο)",
      "Γεύματα μονής",
      "Ακτοπλοϊκά εισιτήρια",
    ],
  },
  14: {
    title: "Ρόδος: Ιππότες και Παραλίες",
    location: "Ρόδος, Ελλάδα",
    tags: ["Μεσαιωνικό", "Ηλιόλουστο"],
    description:
      "Περπατήστε στην Οδό των Ιπποτών και απολαύστε τα γαλαζοπράσινα νερά της Λίνδου.",
    program: [
      "Ημέρα 1-2 — Παλιά Πόλη",
      "Ημέρα 3-4 — Ακρόπολη Λίνδου",
      "Ημέρα 5 — Κοιλάδα με τις Πεταλούδες",
      "Ημέρα 6 — Αναχώρηση",
    ],
    included: ["Ξενοδοχείο 4 αστέρων", "Πτήσεις", "Ξεναγός"],
  },
  15: {
    title: "Καλλιτεχνική Απόδραση στην Ύδρα",
    location: "Ύδρα, Ελλάδα",
    tags: ["Χωρίς Αυτοκίνητα", "Τέχνη"],
    description:
      "Μια μέρα στο νησί όπου δεν κυκλοφορούν αυτοκίνητα και τα γαϊδουράκια πρωταγωνιστούν στα σοκάκια.",
    program: [
      "08:00 Αναχώρηση με πλοίο από Πειραιά",
      "11:00 Μπάνιο",
      "14:00 Γεύμα στο λιμάνι",
      "19:00 Επιστροφή",
    ],
    included: ["Ακτοπλοϊκά εισιτήρια", "Γεύμα", "Περιπατητική ξενάγηση"],
  },
  16: {
    title: "Πήλιο: Βουνό και Θάλασσα",
    location: "Βόλος, Ελλάδα",
    tags: ["Παραδοσιακό", "Φύση"],
    description:
      "Ανακαλύψτε τη μυθική γη των Κενταύρων με πέτρινα χωριά και κρυστάλλινες παραλίες.",
    program: [
      "Ημέρα 1 — Πορταριά",
      "Ημέρα 2 — Μακρινίτσα",
      "Ημέρα 3 — Παραλία Μυλοπόταμος",
      "Ημέρα 4 — Νταμούχαρη",
      "Ημέρα 5 — Επιστροφή",
    ],
    included: ["Παραδοσιακός ξενώνας", "Πρωινό", "Καθοδηγούμενος περίπατος"],
  },
  17: {
    title: "Παρίσι & Σαμπάνια",
    location: "Παρίσι, Γαλλία",
    tags: ["Μόδα", "Κρασί"],
    description:
      "Η Πόλη του Φωτός με ιδιωτική περιήγηση στα κελάρια της Moet & Chandon.",
    program: [
      "Ημέρα 1 — Άφιξη",
      "Ημέρα 2 — Ιδιωτική ξενάγηση στο Λούβρο",
      "Ημέρα 3 — Ημερήσια εκδρομή στη Σαμπάνια",
      "Ημέρα 4 — Μονμάρτη",
      "Ημέρα 5 — Αναχώρηση",
    ],
    included: ["Ξενοδοχείο 5 αστέρων", "Tour στη Σαμπάνια", "Πτήσεις"],
  },
  18: {
    title: "Οδύσσεια στο Δάσος του Αμαζονίου",
    location: "Περού",
    tags: ["Άγρια Φύση", "Επιβίωση"],
    description:
      "Βαθιά εμπειρία στη ζούγκλα που συνδυάζεται με το μεγαλείο του Μάτσου Πίτσου.",
    program: [
      "Ημέρες 1-5 — Κρουαζιέρα στον Αμαζόνιο",
      "Ημέρες 6-10 — Κούσκο και Sacred Valley",
      "Ημέρες 11-13 — Trek στο Μάτσου Πίτσου",
      "Ημέρες 14-15 — Λίμα",
    ],
    included: [
      "Πολυτελές riverboat",
      "Τρένο για Μάτσου Πίτσου",
      "Ξεναγοί",
      "Όλα τα γεύματα",
    ],
  },
  19: {
    title: "Κάιρο & Πολυτέλεια στον Νείλο",
    location: "Αίγυπτος",
    tags: ["Αρχαίος Κόσμος", "Κρουαζιέρα Ποταμού"],
    description:
      "Ιδιωτική πρόσβαση στις Μεγάλες Πυραμίδες και πολυτελής dahabiya κρουαζιέρα στον Νείλο.",
    program: [
      "Ημέρα 1 — Κάιρο",
      "Ημέρα 2 — Πυραμίδες και Σφίγγα",
      "Ημέρα 3-6 — Κρουαζιέρα στον Νείλο",
      "Ημέρα 7 — Λούξορ, Κοιλάδα των Βασιλέων",
      "Ημέρα 8 — Αναχώρηση",
    ],
    included: [
      "Ιδιωτικός αιγυπτιολόγος",
      "Κρουαζιέρα 5 αστέρων",
      "Εσωτερικές πτήσεις",
    ],
  },
  20: {
    title: "Τα Φώτα της Νέας Υόρκης",
    location: "Νέα Υόρκη, ΗΠΑ",
    tags: ["Πόλη", "Shopping"],
    description:
      "Από παραστάσεις στο Broadway μέχρι ιδιωτική βόλτα με ελικόπτερο πάνω από το Μανχάταν.",
    program: [
      "Ημέρα 1 — Times Square",
      "Ημέρα 2 — Central Park",
      "Ημέρα 3 — Museum Day",
      "Ημέρα 4 — Εξερεύνηση στο Brooklyn",
      "Ημέρα 5 — Βόλτα με ελικόπτερο",
      "Ημέρα 6 — Αγορές",
      "Ημέρα 7 — Αναχώρηση",
    ],
    included: [
      "Ξενοδοχείο στο Μανχάταν",
      "Εισιτήρια Broadway",
      "Βόλτα με ελικόπτερο",
    ],
  },
};

const replaceWords = (input: string, map: Record<string, string>) => {
  let output = input;
  for (const [from, to] of Object.entries(map)) {
    output = output.split(from).join(to);
  }
  return output;
};

const toGreekDuration = (duration: string) => {
  const manyDays = duration.replace(" Days", " Ημέρες");
  return manyDays.replace(" Day", " Ημέρα");
};

const toEnglishDuration = (duration: string) => {
  const oneDay = duration.replace(" Ημέρα", " Day");
  return oneDay.replace(" Ημέρες", " Days");
};

const buildTripI18n = (
  trip: Omit<Trip, "i18n">,
): Record<TripLang, TripLocalizedContent> => {
  const enDateRange = replaceWords(trip.dateRange, greekToEnglishDateMap);
  const grDateRange = replaceWords(trip.dateRange, englishToGreekDateMap);
  const grOverrides = greekTripOverrides[trip.id] ?? {};

  const enDepartureCity =
    greekToEnglishCityMap[trip.departureCity] ?? trip.departureCity;

  return {
    en: {
      title: trip.title,
      location: trip.location,
      duration: toEnglishDuration(trip.duration),
      tags: [...trip.tags],
      description: trip.description,
      program: [...trip.program],
      included: [...trip.included],
      dateRange: enDateRange,
      departureCity: enDepartureCity,
    },
    gr: {
      title: grOverrides.title ?? trip.title,
      location: grOverrides.location ?? trip.location,
      duration: toGreekDuration(trip.duration),
      tags: grOverrides.tags ?? [...trip.tags],
      description: grOverrides.description ?? trip.description,
      program: grOverrides.program ?? [...trip.program],
      included: grOverrides.included ?? [...trip.included],
      dateRange: grOverrides.dateRange ?? grDateRange,
      departureCity: grOverrides.departureCity ?? trip.departureCity,
    },
  };
};

const withI18n = (trip: Omit<Trip, "i18n">): Trip => ({
  ...trip,
  i18n: buildTripI18n(trip),
});

export const trips: Trip[] = rawTrips.map(withI18n);
export const internationalTrips: Trip[] = rawInternationalTrips.map(withI18n);

export const getLocalizedTripContent = (trip: Trip, lang: TripLang) =>
  trip.i18n?.[lang] ?? {
    title: trip.title,
    location: trip.location,
    duration: trip.duration,
    tags: trip.tags,
    description: trip.description,
    program: trip.program,
    included: trip.included,
    dateRange: trip.dateRange,
    departureCity: trip.departureCity,
  };
