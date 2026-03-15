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
      "Day 1 — Portaria, Hania, Makrinitsa & Volos || Morning departure for Pelion with scenic stops along the mountain road. We explore elegant Portaria, continue through the chestnut-covered slopes of Hania, enjoy panoramic views from Makrinitsa, and end the day in Volos for dinner and overnight stay.",
      "Day 2 — Milies, Vizitsa & Tsagarada || After breakfast we discover some of Pelion's most atmospheric villages, walking through stone alleys, shaded squares, and old mansions. The day moves at a relaxed pace with time for coffee, local sweets, and short scenic stops between villages.",
      "Day 3 — Mylopotamos Beach & East Pelion Coast || We head toward the eastern coast where Pelion meets the Aegean in dramatic fashion. Swimming time, seaside lunch, and moments of rest by the turquoise waters create a slower, summer-style day before returning for the evening.",
      "Day 4 — Damouchari, Fakistra & coastal exploration || Today's route combines hidden coves, lush paths, and one of the most cinematic corners of Pelion. We visit Damouchari and the nearby coastline, with free time for photos, a walk by the sea, or a relaxed drink in a tranquil setting.",
      "Day 5 — Volos stroll & return || Before departure we enjoy free time in Volos for a final walk on the waterfront and optional tsipouro meze. Return journey in the afternoon with comfortable stops on the way back.",
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

const richEnglishProgramOverrides: Partial<Record<number, string[]>> = {
  1: [
    "Day 1 — Private arrival in Positano || A seamless transfer brings you to your cliffside estate above the Amalfi Coast. The afternoon is left for settling in before a candlelit welcome dinner with sea views and a first taste of the region.",
    "Day 2 — Amalfi town & limoncello traditions || We spend the day among elegant lanes, artisan boutiques, and sunlit piazzas in Amalfi. A private limoncello experience adds a local touch before an easy evening back at the estate.",
    "Day 3 — Capri by yacht || A full day at sea reveals hidden coves, dramatic rock formations, and the unmistakable glamour of Capri. Swim stops, light bites on board, and time on the island create the signature Mediterranean day.",
    "Day 4 — Culinary atelier with Michelin flair || Today's experience centers on taste, technique, and the finest local ingredients. Under expert guidance, guests enjoy an intimate cooking session followed by a leisurely gourmet lunch.",
    "Day 5 — Ravello gardens & music above the coast || Ravello brings a quieter, more refined side of the Amalfi experience with historic villas and sweeping terraces. The day closes with culture and atmosphere high above the sea.",
    "Day 6 — Slow luxury & wellness || The schedule softens to allow complete freedom: spa rituals, time by the pool, or a slow afternoon overlooking the water. It is a day designed around rest, beauty, and personal pace.",
    "Day 7 — Farewell brunch & departure || A final relaxed morning is reserved for brunch and one last look at the coastline. Private departure arrangements follow, ending the stay with the same ease and privacy with which it began.",
  ],
  2: [
    "Day 1 — Arrival in Kyoto || On arrival, you settle into a restored machiya residence where traditional craftsmanship meets serene comfort. The evening is quiet and atmospheric, setting the tone for a deeply refined stay.",
    "Day 2 — Fushimi Inari at dawn || We begin early before the crowds, walking through the vermilion torii in the most peaceful light of the day. Later, a carefully prepared kaiseki dinner introduces Kyoto's culinary precision.",
    "Day 3 — Tea ceremony & inner stillness || This day focuses on the elegance of ritual through a private tea experience guided by a master host. Every gesture, texture, and silence becomes part of the journey.",
    "Day 4 — Arashiyama & kimono experience || Bamboo groves, quiet pathways, and a softer side of Kyoto define the day. A kimono fitting and stroll add a tactile connection to place, tradition, and aesthetic detail.",
    "Day 5 — Nara & sake tasting || We step outside Kyoto for a day shaped by temples, gardens, and the calm rhythm of Nara. The experience ends with a curated sake tasting that highlights regional depth and craftsmanship.",
    "Day 6 — Pottery with a living tradition || Hands-on creation replaces observation as you enter the world of Japanese ceramics. The workshop offers a rare encounter with discipline, beauty, and heritage.",
    "Day 7 — Zen monastery overnight || This is the most contemplative point of the itinerary, with time in a monastic setting removed from city life. Simplicity, silence, and mindful routine define the experience.",
    "Day 8 — Golden Pavilion & onsen evening || The day combines Kyoto's iconic temple imagery with a more restorative close. After cultural visits, the evening shifts into warmth and stillness through a traditional onsen atmosphere.",
    "Day 9 — Markets, alleys, and free discovery || With no rigid schedule, guests experience Kyoto more personally through shops, food stalls, side streets, and spontaneous pauses. It is a day for wandering with intention but without pressure.",
    "Day 10 — Farewell ceremony & departure || The journey closes with a final cultural gesture before checkout and transfer. What remains is a sense of calm, precision, and beauty that lingers beyond the itinerary itself.",
  ],
  3: [
    "Day 1 — Reykjavik arrival & Blue Lagoon || Arrival in Iceland is followed by an immediate transition into geothermal calm. The Blue Lagoon offers a restorative first impression before the northern landscape begins to unfold.",
    "Day 2 — Golden Circle & aurora dome stay || Classic Icelandic landmarks frame the route as we move through geysers, waterfalls, and volcanic plains. By evening, the glass dome offers a front-row seat to the night sky.",
    "Day 3 — Glacier landscapes & ice cave textures || Adventure becomes more physical today with movement across ice, snow, and deep mineral blue formations. The experience is dramatic but carefully guided throughout.",
    "Day 4 — Silfra and geothermal flavors || A day of contrast pairs crystal-clear waters and volcanic geology with warming local cuisine. It feels adventurous, elemental, and unmistakably Icelandic from start to finish.",
    "Day 5 — Black sand coast & departure || The final morning begins by the ocean on Iceland's iconic dark shoreline. After one last scenic stop, departure follows with the feeling of having stepped briefly into another planet.",
  ],
  4: [
    "Day 1 — Geneva arrival & helicopter transfer || The alpine experience begins in polished style, with a private arrival sequence leading smoothly into the mountains. By the time you reach Zermatt, the journey already feels exceptional.",
    "Day 2 — Orientation on snow || The first ski day balances exhilaration with preparation, introducing terrain, safety rhythm, and mountain flow. It sets a confident tone for the days that follow.",
    "Day 3 — Full heli-ski immersion || Helicopter drops unlock remote slopes and open views that define the peak experience of the trip. This is the most adrenaline-driven day, yet still delivered with precision and control.",
    "Day 4 — Backcountry routes & mountain lunch || Beyond the dramatic descents, the itinerary opens space for slower alpine appreciation. A high-altitude lunch becomes part of the atmosphere rather than just a stop.",
    "Day 5 — Scenic rail and spa reset || After intense days in the snow, the program shifts into a more balanced rhythm. Panoramic railway views and an afternoon spa session bring elegance back into focus.",
    "Day 6 — Final runs & departure || A last morning on the slopes closes the trip with energy and clarity. Departure by helicopter leaves the same strong visual impression with which the journey began.",
  ],
  5: [
    "Day 1 — Arusha arrival || The first day allows for a soft landing in East Africa with time to rest, settle, and absorb the change of rhythm. The lodge setting introduces the safari mood with warmth and discretion.",
    "Day 2 — Flight into the Serengeti || A light aircraft transfer reveals the scale of the landscape from above before the safari truly begins. By afternoon, the plains feel immediate, wide, and alive with motion.",
    "Day 3-4 — Big game days on the plains || These are the core wildlife days, built around game drives, expert tracking, and long golden-hour stretches in the reserve. Every outing brings a different mood and a different encounter.",
    "Day 5 — Northern Serengeti migration zone || The route shifts toward the migration corridor where the drama of movement defines the experience. It is a day of anticipation, open horizons, and unforgettable sightings.",
    "Day 6 — Dawn balloon safari || Floating above the savannah at sunrise creates a quieter, more cinematic perspective on the ecosystem below. Breakfast in the bush completes one of the trip's most memorable moments.",
    "Day 7 — Ngorongoro Crater expedition || The crater offers a completely different setting, lush and self-contained, with extraordinary density of wildlife. The change in terrain adds a fresh chapter to the safari story.",
    "Day 8 — Final drive & departure || One last early outing allows time for a final sighting before onward travel. Departure comes with the sense of leaving a living landscape rather than simply ending a trip.",
  ],
  6: [
    "Day 1 — Arrival in Santiago || The journey begins in the Chilean capital with time to recover and prepare for the scale of Patagonia ahead. It is a simple opening, designed to ease you into an expedition rhythm.",
    "Day 2 — Punta Arenas to the lodge || A domestic flight and overland transfer shift the scenery dramatically from city to wilderness. By evening, the lodge feels completely remote and deeply connected to the landscape.",
    "Day 3-4 — Torres del Paine immersion || These days are shaped by iconic peaks, windswept trails, and vast glacial light. The program balances movement and awe, always keeping the experience immersive but comfortable.",
    "Day 5 — Perito Moreno crossing || This is one of the most visually powerful days of the itinerary, centered on ice, silence, and scale. The crossing feels both adventurous and cinematic.",
    "Day 6-7 — Estancia life & horseback routes || Patagonia slows down through ranch culture, open land, and a more grounded connection to the region. Riding, local hospitality, and expansive views define the mood.",
    "Day 8 — Marble Caves by water || The route leads to one of Patagonia's most surreal natural formations, explored from the water. Light, color, and rock create an almost abstract landscape.",
    "Day 9-10 — Carretera Austral || Scenic driving becomes part of the experience itself, passing rivers, forests, and dramatic mountain lines. These days emphasize the feeling of traveling through a truly untamed region.",
    "Day 11 — Pumalin and hot springs || Nature remains central, but the pace becomes softer with forested scenery and restorative thermal waters. It is a welcome contrast before the journey closes.",
    "Day 12 — Final road and departure || The last day is reflective, built around the final stretch south and the gradual transition back toward departure. Patagonia leaves its impression in scale, silence, and texture.",
  ],
  7: [
    "14:00 — Departure from Athens || We leave the city and follow the coastal road toward Sounio with relaxed scenic stops along the way. The mood is unhurried from the very beginning, designed as a refined half-day escape.",
    "15:30 — Riviera coffee stop || A pause by the sea allows time for coffee, conversation, and the changing light of the Athenian Riviera. It is a small moment, but one that sets the atmosphere for the evening ahead.",
    "18:00 — Temple of Poseidon visit || At golden hour we reach the temple, where history and landscape meet in one of Attica's most iconic settings. Time is given for photographs, quiet walking, and simply taking in the view.",
    "20:00 — Seafood dinner by the coast || The day closes with a leisurely dinner in a seaside setting, where fresh flavors and the last light over the water complete the experience with elegance.",
  ],
  8: [
    "Day 1 — Nafplio arrival & Palamidi || Arrival in Nafplio is followed by a first walk through one of Greece's most graceful seaside towns. Later, the ascent to Palamidi rewards the day with sweeping views and a strong sense of place.",
    "Day 2 — Epidaurus and return || The second day combines classical heritage with a slower Peloponnesian rhythm. After visiting the ancient theater and surrounding area, the return journey feels cultured yet light.",
  ],
  9: [
    "Day 1 — Arrival above the caldera || From the first transfer into Oia, the island reveals its sculpted volcanic beauty. Check-in to the suite is followed by time to unwind in privacy above the water.",
    "Day 2 — Private catamaran day || The sea becomes the center of the experience with a curated cruise around the caldera. Swimming stops, volcanic scenery, and sunset light define the day.",
    "Day 3 — Wine, views, and slow island time || Santorini's vineyards and tasting spaces introduce a more nuanced side of the island beyond the postcard image. The rest of the day remains intentionally open and indulgent.",
    "Day 4 — Farewell morning & departure || A final breakfast with panoramic views closes the stay on a calm note. Departure follows with the island's light and horizon still lingering in memory.",
  ],
  10: [
    "Day 1 — Route to Kalabaka || The journey north gradually replaces city movement with a more contemplative landscape. Arrival beneath the towering rock formations immediately sets Meteora apart from any ordinary getaway.",
    "Day 2 — Monasteries and sacred views || The heart of the trip unfolds through visits to the monasteries, each suspended between earth and sky. The atmosphere is spiritual, architectural, and visually striking at every turn.",
    "Day 3 — Hermit trails & return || Before returning, the region is experienced on foot through paths that reveal a quieter side of Meteora. The final hours feel reflective and deeply connected to the landscape.",
  ],
  11: [
    "Days 1-3 — Chania old town & western Crete || The opening phase centers on Chania's Venetian beauty, waterfront atmosphere, and layered food culture. It is the perfect introduction to Crete's warmth and character.",
    "Days 4-6 — Southern beaches and open horizons || The route moves toward the island's wilder southern edge, where beaches, sea colors, and road trips shape the rhythm. These days feel freer, brighter, and more elemental.",
    "Days 7-10 — Rethymno, Heraklion, and cultural depth || The final chapter broadens the experience through historic cities, local gastronomy, and a fuller sense of Cretan identity. It brings together relaxation, movement, and culture in equal measure.",
  ],
  12: [
    "Day 1 — Arrival in Ioannina || The first day introduces Epirus through lakeside atmosphere, old-town textures, and a slower mountain rhythm. It is a calm gateway into the landscapes of Zagori.",
    "Day 2-3 — Vikos trails and stone villages || These are the essential Zagori days, filled with dramatic viewpoints, arched bridges, and walking routes through one of Greece's most distinctive regions. Nature and architecture stay in constant dialogue.",
    "Day 4 — Papigo exploration || Papigo offers a more intimate experience of the area through village life, mountain scenery, and relaxed pacing. Time is left for wandering rather than rushing.",
    "Day 5 — Return journey || The final day keeps the mood light, allowing one last look at the landscape before departure. It closes the trip with the same quiet elegance that defines the region.",
  ],
  13: [
    "Day 1 — Arrival in Ouranoupolis || The pilgrimage begins at the threshold of Mount Athos, where practical preparations meet a distinct spiritual atmosphere. The town itself already signals a transition away from ordinary travel.",
    "Day 2-3 — Monastic stay and reflection || Time inside the monastic world follows a very different rhythm, shaped by prayer, silence, architecture, and simplicity. The experience is profound, personal, and intentionally removed from noise.",
    "Day 4 — Departure and return || The return journey offers space to process the experience rather than rush away from it. What remains is less about sightseeing and more about inward calm.",
  ],
  14: [
    "Day 1-2 — Medieval Rhodes || The opening days are spent inside the old town where stone streets, fortified walls, and layered history create a rich first impression. The experience balances heritage with relaxed island atmosphere.",
    "Day 3-4 — Lindos and the Aegean coast || Lindos brings bright light, whitewashed architecture, and some of the island's most iconic sea views. It is the most postcard-like portion of the itinerary, but still feels refined.",
    "Day 5 — Valley of Butterflies || A quieter natural setting changes the tempo with shaded paths and softer scenery. This day works as a breath between the island's more intense visual highlights.",
    "Day 6 — Departure || A final easy morning precedes the return journey. Rhodes leaves a lingering blend of sun, stone, and history.",
  ],
  15: [
    "08:00 — Departure from Piraeus || The crossing to Hydra begins the experience gently, with city life gradually falling away behind the sea. The absence of cars is felt almost immediately on arrival.",
    "11:00 — Swim and island time || Late morning is left for a first immersion in the island's slower rhythm, whether by the water or along the harbor. Hydra works best when there is space simply to be present in it.",
    "14:00 — Lunch by the harbor || The midday stop centers on atmosphere as much as food, with harbor views and a relaxed pace. It is one of those simple moments that defines the island's charm.",
    "19:00 — Return to Athens || The day ends with a quiet departure, carrying back the lightness and elegance that make Hydra distinct. Even a short stay feels like a reset.",
  ],
  17: [
    "Day 1 — Arrival in Paris || Arrival is followed by time to settle into the city at your own rhythm, whether through a first boulevard walk or a quiet evening nearby. Paris introduces itself through atmosphere before agenda.",
    "Day 2 — Louvre and Left Bank elegance || A private Louvre visit turns one of the world's most visited museums into a more intimate cultural experience. The rest of the day unfolds through classic Parisian streets and café pauses.",
    "Day 3 — Champagne countryside || The route leaves the capital for vineyard landscapes, historic cellars, and tastings shaped by precision and heritage. It adds refinement and contrast to the city stay.",
    "Day 4 — Montmartre and artistic Paris || This day embraces a more bohemian side of Paris, with elevated views, creative history, and wandering through atmospheric lanes. It feels cinematic without losing sophistication.",
    "Day 5 — Departure || A final Paris morning closes the trip with ease. Departure comes gently, as the city often leaves its strongest impression in small details rather than grand gestures.",
  ],
  18: [
    "Days 1-5 — Amazon immersion || The opening stage moves deep into the rainforest through river travel, guided excursions, and close contact with one of the world's richest ecosystems. The experience is vivid, humid, and wholly immersive.",
    "Days 6-10 — Cusco and the Sacred Valley || After the jungle, the altitude and Andean heritage create a completely different mood. These days combine culture, archaeology, and spectacular mountain presence.",
    "Days 11-13 — Machu Picchu trek || The route toward Machu Picchu carries the sense of progression and reward that defines great expedition travel. It is physically engaging, but emotionally even stronger.",
    "Days 14-15 — Lima finale || The final chapter softens into urban energy, gastronomy, and coastal contrast. It completes the trip by linking wilderness, history, and contemporary Peru in one arc.",
  ],
  19: [
    "Day 1 — Arrival in Cairo || The first encounter with Cairo is energetic, layered, and full of contrast. Time is kept gentle on arrival so the city can be absorbed before the historic highlights begin.",
    "Day 2 — Pyramids and Sphinx || This is the landmark day, centered on direct access to Egypt's most enduring symbols. The scale of the site creates a sense of wonder that no image fully prepares you for.",
    "Day 3-6 — Nile sailing in style || Once on the dahabiya, the journey becomes slower, more elegant, and deeply scenic. Temple visits, river light, and refined onboard life shape the experience.",
    "Day 7 — Luxor and the Valley of the Kings || The archaeological intensity reaches a high point with one of Egypt's most impressive historical landscapes. It is a day of depth, symbolism, and extraordinary setting.",
    "Day 8 — Departure || The final morning brings the itinerary back into motion for departure. The trip closes with Egypt remembered as both monumental and unexpectedly graceful.",
  ],
  20: [
    "Day 1 — Times Square arrival || The city announces itself immediately through speed, scale, and light. Arrival day is about settling in while absorbing Manhattan's unmistakable energy.",
    "Day 2 — Central Park and Upper Manhattan || A slower, more elegant side of New York appears through greenery, architecture, and classic avenues. The balance between movement and calm defines the day.",
    "Day 3 — Museum day || Cultural depth takes center stage with time dedicated to one of the city's world-class institutions. The experience feels curated rather than rushed, leaving space to enjoy the city around it too.",
    "Day 4 — Brooklyn perspectives || Crossing into Brooklyn changes the visual language of the trip, adding neighborhood texture, skyline views, and a more local rhythm. It broadens the story of New York beyond Midtown icons.",
    "Day 5 — Helicopter over Manhattan || The city is reintroduced from above in one of the most dramatic ways possible. It is a concise but unforgettable experience that changes your sense of the skyline entirely.",
    "Day 6 — Fifth Avenue and shopping time || This day is intentionally flexible, built around style, browsing, and personal pace. It can feel glamorous, playful, or simply indulgent depending on mood.",
    "Day 7 — Departure || A final morning in Manhattan closes the stay with one more look at the city's vertical rhythm. Departure feels less like an ending and more like stepping out of a film set.",
  ],
};

const richGreekProgramOverrides: Partial<Record<number, string[]>> = {
  1: [
    "Ημέρα 1 — Άφιξη στο Ποζιτάνο και υποδοχή στην έπαυλη || Ιδιωτική μεταφορά σας οδηγεί στην εντυπωσιακή έπαυλη με θέα στην Ακτή Αμάλφι. Το απόγευμα κυλά χαλαρά, πριν από ένα εκλεπτυσμένο δείπνο υποδοχής που ανοίγει ιδανικά το ταξίδι.",
    "Ημέρα 2 — Αμάλφι και αρώματα λιμοντσέλο || Η μέρα είναι αφιερωμένη στα σοκάκια, τις μικρές πλατείες και την αυθεντική κομψότητα του Αμάλφι. Μια ιδιωτική εμπειρία λιμοντσέλο δίνει τοπικό χαρακτήρα πριν την ήρεμη επιστροφή.",
    "Ημέρα 3 — Κρουαζιέρα στο Κάπρι με yacht || Ζούμε μια ολόκληρη ημέρα πάνω στη θάλασσα, ανάμεσα σε σπηλιές, βραχώδεις σχηματισμούς και λαμπερά νερά. Οι στάσεις για μπάνιο και ο χρόνος στο νησί δημιουργούν την πιο iconic στιγμή του ταξιδιού.",
    "Ημέρα 4 — Γαστρονομική εμπειρία υψηλού επιπέδου || Το σημερινό πρόγραμμα περιστρέφεται γύρω από την ιταλική γεύση, την τεχνική και τις εκλεκτές πρώτες ύλες. Η μαγειρική εμπειρία ολοκληρώνεται με γεύμα που μοιάζει με ιδιωτική γιορτή.",
    "Ημέρα 5 — Ραβέλλο, κήποι και πολιτισμός || Το Ραβέλλο αποκαλύπτει μια πιο εκλεπτυσμένη και ήσυχη πλευρά της ακτής, με κήπους, βίλες και ατμοσφαιρικές θέες. Η ημέρα κλείνει με πολιτιστική πινελιά και υπέροχη αίσθηση ύψους και φωτός.",
    "Ημέρα 6 — Ευεξία και αργός ρυθμός || Δεν υπάρχει βιασύνη σήμερα, μόνο χρόνος για spa, ξεκούραση, ιδιωτικές στιγμές και θέα στη θάλασσα. Είναι η ημέρα της απόλυτης χαλάρωσης και της προσωπικής απόλαυσης.",
    "Ημέρα 7 — Αποχαιρετιστήριο brunch και αναχώρηση || Το τελευταίο πρωινό κρατά ήρεμο ρυθμό με brunch και μία ακόμη ματιά στην ακτογραμμή. Η αναχώρηση οργανώνεται με την ίδια άνεση και ιδιωτικότητα που χαρακτήρισε όλη τη διαμονή.",
  ],
  2: [
    "Ημέρα 1 — Άφιξη στο Κιότο || Με την άφιξη εγκαθίσταστε σε μια αναπαλαιωμένη machiya, όπου η ιαπωνική παράδοση συναντά την ηρεμία και την αισθητική λεπτότητα. Το βράδυ κινείται σε χαμηλούς τόνους και σας εισάγει ιδανικά στο πνεύμα του ταξιδιού.",
    "Ημέρα 2 — Fushimi Inari την αυγή || Ξεκινάμε νωρίς για να ζήσουμε το ιερό μονοπάτι στην πιο γαλήνια στιγμή της ημέρας. Το βράδυ ολοκληρώνεται με ένα εκλεπτυσμένο δείπνο kaiseki που αποτυπώνει τη γαστρονομική ψυχή του Κιότο.",
    "Ημέρα 3 — Τελετή τσαγιού και εσωτερική ηρεμία || Η μέρα εστιάζει στην κομψότητα της τελετουργίας μέσα από μια ιδιωτική εμπειρία τσαγιού. Κάθε κίνηση, σιωπή και λεπτομέρεια αποκτά νόημα και βάθος.",
    "Ημέρα 4 — Arashiyama και εμπειρία kimono || Τοπία με μπαμπού, ήρεμα μονοπάτια και πιο ανάλαφρη πλευρά του Κιότο συνθέτουν τη σημερινή εικόνα. Η εμπειρία kimono δίνει ακόμη πιο απτή επαφή με την παράδοση.",
    "Ημέρα 5 — Νάρα και γευσιγνωσία sake || Η εκδρομή εκτός πόλης φέρνει ναούς, κήπους και έναν διαφορετικό ρυθμό πιο ήρεμο και στοχαστικό. Η ημέρα κλείνει με μια εκλεπτυσμένη γνωριμία με τον κόσμο του sake.",
    "Ημέρα 6 — Κεραμική και ζωντανή παράδοση || Σήμερα δεν παρατηρούμε απλώς την τέχνη, αλλά ερχόμαστε σε άμεση επαφή μαζί της. Το εργαστήριο κεραμικής αποκαλύπτει πειθαρχία, ομορφιά και χειροποίητη λεπτότητα.",
    "Ημέρα 7 — Διανυκτέρευση σε zen μοναστήρι || Αυτή είναι η πιο εσωστρεφής και ήσυχη στιγμή του προγράμματος, μακριά από τον ρυθμό της πόλης. Η απλότητα, η σιωπή και η καθημερινή τελετουργία δίνουν άλλο βάθος στο ταξίδι.",
    "Ημέρα 8 — Χρυσό Περίπτερο και βραδιά onsen || Η μέρα ενώνει την πιο εμβληματική εικόνα του Κιότο με μια απολύτως χαλαρωτική κατάληξη. Μετά τις επισκέψεις, η εμπειρία περνά στη ζεστασιά και την ηρεμία ενός onsen.",
    "Ημέρα 9 — Ελεύθερη εξερεύνηση στην πόλη || Χωρίς αυστηρό πρόγραμμα, ανακαλύπτετε μικρά μαγαζιά, αγορές, γεύσεις και γωνιές που δίνουν στον καθένα μια πιο προσωπική σχέση με το Κιότο. Είναι μια μέρα περιπλάνησης χωρίς πίεση.",
    "Ημέρα 10 — Αποχαιρετιστήρια τελετή και αναχώρηση || Το ταξίδι ολοκληρώνεται με μία τελευταία πολιτιστική εμπειρία πριν την αναχώρηση. Αυτό που μένει είναι μια αίσθηση αρμονίας, λεπτότητας και βαθιάς ηρεμίας.",
  ],
  3: [
    "Ημέρα 1 — Άφιξη στο Ρέικιαβικ και Blue Lagoon || Η Ισλανδία σας καλωσορίζει με μια άμεση μετάβαση σε γεωθερμική χαλάρωση. Το Blue Lagoon λειτουργεί σαν ιδανική εισαγωγή πριν αποκαλυφθεί η άγρια ομορφιά του τοπίου.",
    "Ημέρα 2 — Golden Circle και διαμονή σε aurora dome || Θερμοπίδακες, καταρράκτες και ηφαιστειακά πεδία συνθέτουν τη διαδρομή της ημέρας. Το βράδυ ολοκληρώνεται μέσα στο γυάλινο dome με θέα στον νυχτερινό ουρανό.",
    "Ημέρα 3 — Παγετώνας και ice cave || Η σημερινή εμπειρία είναι πιο έντονη και σωματική, ανάμεσα σε πάγο, χιόνι και βαθιές αποχρώσεις του μπλε. Κάθε βήμα δίνει την αίσθηση ότι βρίσκεστε σε άλλο πλανήτη.",
    "Ημέρα 4 — Silfra και γεωθερμικές γεύσεις || Η μέρα παίζει με αντιθέσεις, από τα κρυστάλλινα νερά μέχρι τη θερμότητα της ισλανδικής γης και της τοπικής κουζίνας. Είναι μια εμπειρία αυθεντικά στοιχειακή και αξέχαστη.",
    "Ημέρα 5 — Μαύρη αμμουδιά και αναχώρηση || Το τελευταίο πρωινό ξεκινά δίπλα στον ωκεανό, σε ένα από τα πιο χαρακτηριστικά τοπία της χώρας. Ύστερα από μια τελευταία στάση, ακολουθεί η αναχώρηση με έντονες εικόνες και εντυπώσεις.",
  ],
  4: [
    "Ημέρα 1 — Άφιξη στη Γενεύη και ελικόπτερο για Ζερμάτ || Η αλπική εμπειρία ξεκινά με άψογη οργάνωση και αίσθηση αποκλειστικότητας από την πρώτη στιγμή. Μέχρι να φτάσετε στο σαλέ, το ταξίδι έχει ήδη αποκτήσει premium χαρακτήρα.",
    "Ημέρα 2 — Πρώτη επαφή με το heli-ski || Η σημερινή ημέρα συνδυάζει προετοιμασία, ρυθμό και την πρώτη γεύση από το αλπικό πεδίο. Χτίζει αυτοπεποίθηση και προσμονή για όσα ακολουθούν.",
    "Ημέρα 3 — Ολοήμερη εμπειρία heli-ski || Οι απομακρυσμένες πλαγιές και οι διαδοχικές καταβάσεις προσφέρουν το πιο δυναμικό κομμάτι του ταξιδιού. Η αδρεναλίνη συνοδεύεται διαρκώς από ακρίβεια και υψηλό επίπεδο οργάνωσης.",
    "Ημέρα 4 — Backcountry διαδρομές και γεύμα στο βουνό || Πέρα από τη δράση, η ημέρα αφήνει χώρο για πιο βαθιά σύνδεση με το αλπικό τοπίο. Το γεύμα στο βουνό γίνεται εμπειρία από μόνο του, μέσα σε μοναδική ατμόσφαιρα.",
    "Ημέρα 5 — Πανοραμικός σιδηρόδρομος και spa || Μετά τις έντονες ημέρες στο χιόνι, ο ρυθμός γίνεται πιο ισορροπημένος και απολαυστικός. Η θέα από το τρένο και η απογευματινή χαλάρωση στο spa φέρνουν ξανά στο προσκήνιο την κομψότητα του προγράμματος.",
    "Ημέρα 6 — Τελικές καταβάσεις και αναχώρηση || Οι τελευταίες ώρες στο βουνό κλείνουν το ταξίδι με ένταση και καθαρή εικόνα του τοπίου. Η αναχώρηση με ελικόπτερο αφήνει εξίσου δυνατή εντύπωση με την άφιξη.",
  ],
  5: [
    "Ημέρα 1 — Άφιξη στην Αρούσα || Η πρώτη ημέρα δίνει χρόνο για ξεκούραση και προσαρμογή στον ρυθμό της Ανατολικής Αφρικής. Το lodge προσφέρει μια ήρεμη και κομψή εισαγωγή πριν ξεκινήσει η σαφάρι εμπειρία.",
    "Ημέρα 2 — Πτήση προς το Σερενγκέτι || Η μεταφορά με μικρό αεροσκάφος αποκαλύπτει από ψηλά τη μεγάλη κλίμακα του τοπίου. Από το απόγευμα κιόλας, η σαβάνα γίνεται ολόκληρος ο κόσμος σας.",
    "Ημέρα 3-4 — Ημέρες σαφάρι και εντοπισμού άγριας ζωής || Αυτές είναι οι βασικές ημέρες του προγράμματος, γεμάτες game drives, παρατήρηση και καθοδήγηση από έμπειρους συνοδούς. Κάθε έξοδος φέρνει νέα ένταση, νέα εικόνα και νέα ενέργεια.",
    "Ημέρα 5 — Βόρειο Σερενγκέτι και διαδρομή της μετανάστευσης || Η σημερινή μετακίνηση μάς φέρνει σε ένα από τα πιο συγκλονιστικά σημεία του οικοσυστήματος. Ο ορίζοντας, η κίνηση των κοπαδιών και η αίσθηση αναμονής δημιουργούν ανεπανάληπτη εμπειρία.",
    "Ημέρα 6 — Safari με αερόστατο την αυγή || Από ψηλά, η σαβάνα μοιάζει πιο ήσυχη και ακόμη πιο επιβλητική. Το πρωινό στην ύπαιθρο ολοκληρώνει μία από τις πιο κινηματογραφικές στιγμές όλου του ταξιδιού.",
    "Ημέρα 7 — Εκδρομή στον κρατήρα Νγκορονγκόρο || Το τοπίο αλλάζει εντελώς και προσφέρει μια νέα, πυκνή και εντυπωσιακή όψη της αφρικανικής άγριας ζωής. Η ημέρα αυτή δίνει διαφορετικό βάθος στο σαφάρι.",
    "Ημέρα 8 — Τελικό πρωινό drive και αναχώρηση || Πριν την αναχώρηση υπάρχει χρόνος για μια τελευταία έξοδο στην πεδιάδα. Το ταξίδι κλείνει με εικόνες που μοιάζουν ζωντανές και διαρκώς σε κίνηση.",
  ],
  6: [
    "Ημέρα 1 — Άφιξη στο Σαντιάγο || Το ταξίδι ξεκινά σε ήπιους ρυθμούς, δίνοντας χρόνο για προσαρμογή πριν ανοίξει μπροστά σας η κλίμακα της Παταγονίας. Είναι μια εισαγωγική ημέρα που προετοιμάζει σωστά το σώμα και το βλέμμα.",
    "Ημέρα 2 — Punta Arenas και μετάβαση στο lodge || Η εσωτερική πτήση και η οδική διαδρομή μεταμορφώνουν το σκηνικό από πόλη σε πλήρη απομόνωση. Από το βράδυ κιόλας, η αίσθηση της άγριας φύσης γίνεται απόλυτη.",
    "Ημέρα 3-4 — Torres del Paine || Οι επόμενες δύο ημέρες είναι γεμάτες κορυφές, παγετώνες, αέρα και τεράστια ανοιχτά τοπία. Το πρόγραμμα ισορροπεί ανάμεσα στην εξερεύνηση και τη βαθιά οπτική απόλαυση της περιοχής.",
    "Ημέρα 5 — Πέρασμα από τον Perito Moreno || Η ημέρα αυτή είναι από τις πιο δυνατές οπτικά, με κεντρικό πρωταγωνιστή τον πάγο, τη σιωπή και την αίσθηση κλίμακας. Είναι μια εμπειρία που μένει έντονα στη μνήμη.",
    "Ημέρα 6-7 — Estancia, ιππασία και τοπικός ρυθμός || Η Παταγονία εδώ γίνεται πιο γήινη και πιο ανθρώπινη, μέσα από την αγροτική ζωή, τα ανοιχτά πεδία και τις διαδρομές με άλογα. Η περιοχή αποκαλύπτεται με πιο αργό και αυθεντικό τρόπο.",
    "Ημέρα 8 — Marble Caves από το νερό || Το τοπίο αποκτά σχεδόν αφηρημένο χαρακτήρα μέσα από χρώματα, αντανάκλαση και βραχώδεις σχηματισμούς. Η εξερεύνηση με βάρκα είναι μία από τις πιο ιδιαίτερες στιγμές της διαδρομής.",
    "Ημέρα 9-10 — Carretera Austral || Οι δύο αυτές ημέρες είναι ένα συνεχές road journey μέσα από ποτάμια, βουνά και δάση. Η διαδρομή γίνεται βασικό μέρος της εμπειρίας και όχι απλώς μέσο μετακίνησης.",
    "Ημέρα 11 — Pumalin και θερμές πηγές || Η ένταση μαλακώνει και δίνει τη θέση της σε μια πιο θεραπευτική ημέρα με φύση και ζεστό νερό. Είναι μια ευχάριστη παύση πριν το τελικό κλείσιμο του ταξιδιού.",
    "Ημέρα 12 — Τελική διαδρομή και αναχώρηση || Η τελευταία ημέρα έχει πιο στοχαστικό χαρακτήρα, καθώς η επιστροφή περνά ξανά μέσα από την απεραντοσύνη του νότου. Η Παταγονία μένει ως αίσθηση χώρου, σιωπής και ελευθερίας.",
  ],
  7: [
    "14:00 — Αναχώρηση από Αθήνα || Αφήνουμε την πόλη πίσω και ακολουθούμε την παραλιακή διαδρομή προς το Σούνιο με άνεση και χαλαρότητα. Από την πρώτη στιγμή η εμπειρία έχει χαρακτήρα κομψής μισής απόδρασης.",
    "15:30 — Στάση για καφέ στη Ριβιέρα || Μια μικρή παύση δίπλα στη θάλασσα δίνει χώρο για καφέ, κουβέντα και απόλαυση του φωτός της Αθηναϊκής Ριβιέρας. Είναι μια απλή αλλά ιδιαίτερα ατμοσφαιρική στιγμή.",
    "18:00 — Επίσκεψη στον Ναό του Ποσειδώνα || Φτάνουμε την ιδανική ώρα ώστε το φως να αγκαλιάζει τον ναό και τη θάλασσα. Υπάρχει χρόνος για φωτογραφίες, περίπατο και ήσυχη απόλαυση του τοπίου.",
    "20:00 — Δείπνο δίπλα στο κύμα || Η ημέρα ολοκληρώνεται με χαλαρό δείπνο σε παραθαλάσσιο σκηνικό, όπου οι γεύσεις και η θέα λειτουργούν σαν φυσικό φινάλε της εξόρμησης.",
  ],
  8: [
    "Ημέρα 1 — Άφιξη στο Ναύπλιο και Παλαμήδι || Το Ναύπλιο σας υποδέχεται με ρομαντική ατμόσφαιρα, κομψά σοκάκια και θαλασσινή αύρα. Η ανάβαση στο Παλαμήδι προσφέρει δυνατή πρώτη εικόνα και εξαιρετική θέα.",
    "Ημέρα 2 — Επίδαυρος και επιστροφή || Η δεύτερη ημέρα ενώνει τον πολιτισμό με τον ήρεμο ρυθμό της Πελοποννήσου. Μετά την επίσκεψη στο θέατρο και τη γύρω περιοχή, ακολουθεί επιστροφή με γεμάτη αλλά ανάλαφρη αίσθηση.",
  ],
  9: [
    "Ημέρα 1 — Άφιξη πάνω από την καλντέρα || Από τη στιγμή της άφιξης στην Οία, η Σαντορίνη αποκαλύπτει τη γλυπτική ομορφιά και το μοναδικό της φως. Η εγκατάσταση στη suite συνοδεύεται από ιδιωτικότητα και ηρεμία.",
    "Ημέρα 2 — Ιδιωτική κρουαζιέρα με καταμαράν || Η θάλασσα γίνεται το κέντρο της εμπειρίας, με στάσεις για μπάνιο, ηφαιστειακά τοπία και ανοιχτούς ορίζοντες. Η μέρα έχει αίσθηση απολύτως καλοκαιρινή και εκλεπτυσμένη.",
    "Ημέρα 3 — Κρασί, θέα και αργός νησιώτικος ρυθμός || Οι αμπελώνες και οι χώροι γευσιγνωσίας αποκαλύπτουν μια πιο ώριμη πλευρά της Σαντορίνης. Το υπόλοιπο της ημέρας παραμένει ελεύθερο και απολαυστικό.",
    "Ημέρα 4 — Τελευταίο πρωινό και αναχώρηση || Το ταξίδι κλείνει με ήσυχο πρωινό και μια ακόμη ματιά στην καλντέρα. Η αναχώρηση αφήνει πίσω της εικόνες φωτός, λευκού και θάλασσας.",
  ],
  10: [
    "Ημέρα 1 — Διαδρομή προς Καλαμπάκα || Η πορεία προς τα Μετέωρα αλλάζει σταδιακά το σκηνικό από αστικό σε πιο ήσυχο και επιβλητικό. Η άφιξη κάτω από τους βράχους δημιουργεί αμέσως αίσθηση δέους.",
    "Ημέρα 2 — Μονές και πανοραμικές εικόνες || Η ουσία του ταξιδιού ξεδιπλώνεται μέσα από τις μονές, όπου η αρχιτεκτονική και το πνευματικό στοιχείο συνυπάρχουν μοναδικά. Κάθε στάση είναι και μια νέα οπτική εμπειρία.",
    "Ημέρα 3 — Μονοπάτια ερημιτών και επιστροφή || Πριν την επιστροφή, η περιοχή αποκαλύπτεται πεζοπορικά και πιο ήσυχα μέσα από φυσικές διαδρομές. Το φινάλε έχει στοχαστικό και ουσιαστικό χαρακτήρα.",
  ],
  11: [
    "Ημέρες 1-3 — Παλιά Πόλη Χανίων και δυτική Κρήτη || Το πρώτο μέρος του ταξιδιού είναι αφιερωμένο στη βενετσιάνικη ατμόσφαιρα των Χανίων, στη γαστρονομία και στη ζεστή ενέργεια της δυτικής Κρήτης. Είναι μια ιδανική εισαγωγή στον χαρακτήρα του νησιού.",
    "Ημέρες 4-6 — Νότιες παραλίες και ελευθερία διαδρομής || Στη συνέχεια, το πρόγραμμα περνά στις πιο άγριες και φωτεινές ακτές της νότιας πλευράς. Οι ημέρες αυτές έχουν περισσότερο καλοκαιρινό, ανοιχτό και ανέμελο χαρακτήρα.",
    "Ημέρες 7-10 — Ρέθυμνο, Ηράκλειο και πολιτιστικό βάθος || Το τελευταίο μέρος του ταξιδιού ενώνει ιστορικές πόλεις, τοπικές γεύσεις και μια πιο ολοκληρωμένη γνωριμία με την κρητική ταυτότητα. Το αποτέλεσμα είναι ισορροπημένο ανάμεσα σε ξεκούραση και ουσία.",
  ],
  12: [
    "Ημέρα 1 — Άφιξη στα Ιωάννινα || Η πρώτη ημέρα σάς εισάγει στην Ήπειρο μέσα από λίμνη, παλιά πόλη και πιο αργό ρυθμό. Είναι η σωστή αρχή για να περάσετε σταδιακά στο τοπίο του Ζαγορίου.",
    "Ημέρα 2-3 — Φαράγγι του Βίκου και χωριά || Αυτές είναι οι βασικές ημέρες της εμπειρίας, με θέες, πέτρινα γεφύρια και διαδρομές μέσα σε μία από τις πιο ιδιαίτερες περιοχές της Ελλάδας. Η φύση και η αρχιτεκτονική λειτουργούν διαρκώς μαζί.",
    "Ημέρα 4 — Πάπιγκο || Το Πάπιγκο προσφέρει μια πιο ήπια και κοντινή επαφή με τον τόπο μέσα από βόλτες, εικόνες του βουνού και πιο χαλαρό ρυθμό. Η ημέρα αφήνει χώρο για πραγματική απόλαυση του σκηνικού.",
    "Ημέρα 5 — Επιστροφή || Η τελευταία ημέρα κρατά την ατμόσφαιρα ήρεμη και ελαφριά, πριν από τον δρόμο της επιστροφής. Το Ζαγόρι μένει ως εμπειρία γαλήνης, τοπίου και πέτρας.",
  ],
  13: [
    "Ημέρα 1 — Άφιξη στην Ουρανούπολη || Το προσκυνηματικό ταξίδι αρχίζει στο κατώφλι του Αγίου Όρους, εκεί όπου η προετοιμασία συναντά ήδη μια διαφορετική εσωτερική ατμόσφαιρα. Από νωρίς φαίνεται ότι δεν πρόκειται για μια συνηθισμένη εκδρομή.",
    "Ημέρα 2-3 — Παραμονή σε μονές και εσωτερικός ρυθμός || Ο χρόνος μέσα στον μοναστικό κόσμο ακολουθεί άλλους κανόνες, με σιωπή, προσευχή, απλότητα και πνευματική συγκέντρωση. Η εμπειρία είναι περισσότερο βιωματική παρά περιηγητική.",
    "Ημέρα 4 — Αναχώρηση και επιστροφή || Η επιστροφή δίνει χώρο να καταλαγιάσει και να αποτυπωθεί ό,τι βιώθηκε. Το σημαντικό που μένει δεν είναι οι εικόνες, αλλά η εσωτερική ηρεμία.",
  ],
  14: [
    "Ημέρα 1-2 — Μεσαιωνική Ρόδος || Οι πρώτες ημέρες κινούνται μέσα στην παλιά πόλη, σε δρόμους με πέτρα, τείχη και ιστορική ατμόσφαιρα. Η εμπειρία είναι γεμάτη χαρακτήρα αλλά παραμένει ξεκούραστη και νησιώτικη.",
    "Ημέρα 3-4 — Λίνδος και αιγαιοπελαγίτικο φως || Η Λίνδος φέρνει λευκή αρχιτεκτονική, καθαρές γραμμές και από τις ωραιότερες εικόνες της Ρόδου. Το κομμάτι αυτό του προγράμματος είναι το πιο λαμπερό και φωτογενές.",
    "Ημέρα 5 — Κοιλάδα με τις Πεταλούδες || Μια πιο πράσινη και ήσυχη στάση αλλάζει προσωρινά τον ρυθμό και δίνει ανάσα στο ταξίδι. Η ημέρα λειτουργεί σαν φυσική παύση ανάμεσα στα πιο έντονα highlights.",
    "Ημέρα 6 — Αναχώρηση || Ένα τελευταίο ήρεμο πρωινό ολοκληρώνει τη διαμονή πριν την επιστροφή. Η Ρόδος μένει στη μνήμη ως συνδυασμός ήλιου, ιστορίας και νησιώτικης χάρης.",
  ],
  15: [
    "08:00 — Αναχώρηση από Πειραιά || Η διαδρομή προς την Ύδρα ξεκινά ήπια, αφήνοντας σταδιακά πίσω τον αστικό ρυθμό. Η άφιξη στο νησί κάνει αμέσως αισθητή την ξεχωριστή του ησυχία.",
    "11:00 — Μπάνιο και χρόνος στο νησί || Το υπόλοιπο της πρωινής ώρας αφιερώνεται στη θάλασσα ή σε χαλαρή παραμονή στο λιμάνι. Η Ύδρα λειτουργεί καλύτερα όταν δεν βιάζεσαι να την καταναλώσεις.",
    "14:00 — Γεύμα στο λιμάνι || Το μεσημέρι κυλά δίπλα στο νερό, με φόντο τα αρχοντικά και τον ιδιαίτερο ρυθμό του νησιού. Είναι μια απλή στιγμή που συμπυκνώνει όλη τη γοητεία της Ύδρας.",
    "19:00 — Επιστροφή || Η αναχώρηση γίνεται ήσυχα, κρατώντας μαζί της την ελαφρότητα και την κομψότητα που κάνει το νησί τόσο ξεχωριστό. Ακόμη και μια μονοήμερη παραμονή μοιάζει σαν μικρή επανεκκίνηση.",
  ],
  17: [
    "Ημέρα 1 — Άφιξη στο Παρίσι || Με την άφιξη υπάρχει χρόνος να γνωρίσετε την πόλη χωρίς πίεση, μέσα από μια πρώτη βόλτα ή ένα ήσυχο βράδυ στη γειτονιά σας. Το Παρίσι αποκαλύπτεται πρώτα μέσα από ατμόσφαιρα και όχι πρόγραμμα.",
    "Ημέρα 2 — Λούβρο και κομψότητα της Αριστερής Όχθης || Η ιδιωτική επίσκεψη στο Λούβρο δίνει πιο ουσιαστικό και ήρεμο χαρακτήρα σε ένα εμβληματικό μουσείο. Η συνέχεια της ημέρας περνά μέσα από βόλτες, καφέ και παριζιάνικη κομψότητα.",
    "Ημέρα 3 — Σαμπάνια και αμπελώνες || Αφήνουμε για λίγο την πόλη και περνάμε σε αμπελουργικά τοπία, ιστορικά κελάρια και γευσιγνωσία με ακρίβεια και φινέτσα. Η εκδρομή αυτή δίνει έξτρα βάθος και αίσθηση πολυτέλειας στο ταξίδι.",
    "Ημέρα 4 — Μονμάρτη και καλλιτεχνικό Παρίσι || Η σημερινή μέρα φωτίζει μια πιο μποέμ πλευρά της πόλης, με ανηφορικά σοκάκια, θέες και ατμόσφαιρα παλιού Παρισιού. Είναι μια πιο κινηματογραφική αλλά πάντα κομψή εμπειρία.",
    "Ημέρα 5 — Αναχώρηση || Το τελευταίο παριζιάνικο πρωινό κλείνει το ταξίδι ήρεμα και με γεύση συνέχειας. Συχνά το Παρίσι αφήνει την πιο έντονη ανάμνηση μέσα από μικρές λεπτομέρειες.",
  ],
  18: [
    "Ημέρες 1-5 — Βαθιά εμπειρία στον Αμαζόνιο || Το πρώτο σκέλος του ταξιδιού οδηγεί βαθιά στη ζούγκλα, με ποτάμιες διαδρομές, εξορμήσεις και συνεχή επαφή με ένα από τα πιο ζωντανά οικοσυστήματα του πλανήτη. Η εμπειρία είναι πυκνή, αισθητηριακή και απόλυτα καθηλωτική.",
    "Ημέρες 6-10 — Κούσκο και Sacred Valley || Μετά τη ζούγκλα, το σκηνικό αλλάζει εντελώς και περνά στο υψόμετρο, την ιστορία και τον πολιτισμό των Άνδεων. Οι ημέρες αυτές έχουν μεγαλύτερο αρχαιολογικό και πολιτιστικό βάθος.",
    "Ημέρες 11-13 — Trek προς το Μάτσου Πίτσου || Η πορεία προς το Μάτσου Πίτσου έχει αίσθηση σταδιακής κορύφωσης και ανταμοιβής. Είναι το πιο έντονο και συμβολικό κομμάτι ολόκληρης της εμπειρίας.",
    "Ημέρες 14-15 — Λίμα και ολοκλήρωση || Το ταξίδι κλείνει με πιο αστικό και γαστρονομικό τόνο, δίνοντας αντίστιξη στη φύση και την ιστορία που προηγήθηκαν. Έτσι ολοκληρώνεται ένα πρόγραμμα με εντυπωσιακό εύρος.",
  ],
  19: [
    "Ημέρα 1 — Άφιξη στο Κάιρο || Η πρώτη γνωριμία με το Κάιρο είναι έντονη, ζωντανή και γεμάτη αντιθέσεις. Η ημέρα κρατιέται ελαφριά ώστε να υπάρξει σωστή είσοδος στον παλμό της πόλης.",
    "Ημέρα 2 — Πυραμίδες και Σφίγγα || Αυτή είναι η ημέρα των μεγάλων εικόνων, μπροστά σε σύμβολα που ξεπερνούν κάθε φωτογραφία ή προσδοκία. Η αίσθηση κλίμακας και ιστορίας είναι πραγματικά επιβλητική.",
    "Ημέρα 3-6 — Πολυτελής πλεύση στον Νείλο || Από τη στιγμή που επιβιβάζεστε στη dahabiya, το ταξίδι αλλάζει ρυθμό και γίνεται πιο αργό, κομψό και σκηνικό. Ο ποταμός, οι επισκέψεις και η διαμονή πάνω στο νερό συνθέτουν μια εξαιρετικά ιδιαίτερη εμπειρία.",
    "Ημέρα 7 — Λούξορ και Κοιλάδα των Βασιλέων || Η αρχαιολογική ένταση κορυφώνεται σε ένα από τα πιο σπουδαία ιστορικά σημεία της Αιγύπτου. Είναι μια ημέρα γεμάτη συμβολισμό, βάθος και μνημειακή δύναμη.",
    "Ημέρα 8 — Αναχώρηση || Το τελευταίο πρωινό επαναφέρει ομαλά το ταξίδι στην κίνηση της επιστροφής. Η Αίγυπτος μένει ως εμπειρία που συνδυάζει το μνημειακό με το απρόσμενα εκλεπτυσμένο.",
  ],
  20: [
    "Ημέρα 1 — Άφιξη στην Times Square || Η Νέα Υόρκη δηλώνει αμέσως την παρουσία της με φως, ένταση και ασταμάτητη ενέργεια. Η πρώτη ημέρα είναι μια προσαρμογή στον ρυθμό της πόλης, χωρίς να χάνει τον ενθουσιασμό της.",
    "Ημέρα 2 — Central Park και Upper Manhattan || Μια πιο κομψή και ήρεμη όψη της Νέας Υόρκης αποκαλύπτεται μέσα από πράσινο, κλασικά κτίρια και μεγάλες λεωφόρους. Η ημέρα ισορροπεί ιδανικά ανάμεσα στην κίνηση και την ανάσα.",
    "Ημέρα 3 — Ημέρα μουσείου || Ο πολιτισμός παίρνει τον κεντρικό ρόλο μέσα από έναν από τους μεγάλους θεσμούς της πόλης. Το πρόγραμμα αφήνει χώρο για ουσιαστική εμπειρία και όχι βιαστική επίσκεψη.",
    "Ημέρα 4 — Brooklyn και νέες οπτικές || Περνώντας στο Brooklyn, το ταξίδι αλλάζει ύφος και αποκτά πιο γειτονιακή, τοπική και δημιουργική αίσθηση. Τα skyline views δίνουν νέα ανάγνωση της πόλης.",
    "Ημέρα 5 — Πτήση με ελικόπτερο πάνω από το Μανχάταν || Η Νέα Υόρκη ξανασυστήνεται από ψηλά, μέσα από μία από τις πιο εντυπωσιακές εμπειρίες του ταξιδιού. Είναι σύντομη αλλά εξαιρετικά δυνατή στιγμή.",
    "Ημέρα 6 — Αγορές και προσωπικός ρυθμός || Η σημερινή ημέρα μένει πιο ανοιχτή, δίνοντας χώρο για στυλ, περιήγηση και προσωπικές επιλογές. Μπορεί να γίνει glamorous, χαλαρή ή καθαρά απολαυστική.",
    "Ημέρα 7 — Αναχώρηση || Το τελευταίο πρωινό στο Μανχάταν κλείνει το ταξίδι με μία ακόμη ματιά στην κάθετη ενέργεια της πόλης. Η αναχώρηση μοιάζει περισσότερο με έξοδο από κινηματογραφικό σκηνικό παρά με απλό τέλος.",
  ],
};

const richEnglishIncludedOverrides: Partial<Record<number, string[]>> = {
  1: [
    "Private estate accommodation with panoramic sea views",
    "Dedicated chef and butler service throughout the stay",
    "Two curated yacht days along the Amalfi coastline",
    "Private airport transfers and seamless local transport",
    "Signature Michelin-level dining experience",
    "Round-the-clock concierge support",
  ],
  2: [
    "Restored machiya stay with serene traditional character",
    "Private cultural guide for key experiences",
    "Curated access to all included ceremonies and workshops",
    "Kaiseki dinners across five evenings",
    "One overnight experience in a Zen monastery",
    "Shinkansen travel passes for intercity comfort",
  ],
  3: [
    "Heated aurora dome accommodation",
    "Luxury 4x4 transport for all ground exploration",
    "Private adventure guiding across the route",
    "Blue Lagoon access included on arrival",
    "Meals throughout the itinerary",
    "Northern Lights assurance program",
  ],
  4: [
    "Private ski-in, ski-out chalet stay",
    "All helicopter mountain transfers",
    "Four heli-ski sessions with expert coordination",
    "Professional mountain guide support",
    "Dining and wine included throughout",
    "Spa access for alpine recovery",
  ],
  5: [
    "Luxury tented safari accommodation",
    "All internal bush flights",
    "Private safari vehicle with dedicated guide",
    "Sunrise balloon safari experience",
    "Full board with premium drinks",
    "Park fees and conservation levy covered",
  ],
  6: [
    "Boutique lodges and estancia stays",
    "Luxury 4x4 vehicle with driver",
    "Private trekking guide across major routes",
    "Meals included throughout the journey",
    "Glacier equipment for expedition segments",
    "All necessary internal flights",
  ],
  7: [
    "Private road transport from and to Athens",
    "Temple entrance fees included",
    "Guided accompaniment during the visit",
  ],
  8: [
    "Boutique hotel accommodation",
    "Daily breakfast included",
    "Guided cultural accompaniment",
  ],
  9: [
    "Luxury suite stay in Oia",
    "Private catamaran cruise around the caldera",
    "All island transfers included",
  ],
  10: [
    "Hotel accommodation in Kalabaka",
    "Guided hiking support where applicable",
    "Transport throughout the itinerary",
  ],
  11: [
    "Car rental for flexible island exploration",
    "Boutique-style stays across Crete",
    "Traditional dinners that highlight local cuisine",
  ],
  12: [
    "Guesthouse accommodation in Zagori",
    "Mountain guide for the core trekking days",
    "Breakfast included each morning",
  ],
  13: [
    "Required entry permits arranged",
    "Monastery meals during the stay",
    "Ferry tickets for access and return",
  ],
  14: [
    "4-star hotel accommodation",
    "Flights included in the package",
    "Guided visits to key highlights",
  ],
  15: [
    "Round-trip ferry tickets",
    "Harbor-side lunch included",
    "Walking tour of Hydra's main quarters",
  ],
  16: [
    "Traditional guesthouse accommodation",
    "Breakfast each morning",
    "Guided walk through selected village routes",
  ],
  17: [
    "5-star hotel stay in Paris",
    "Champagne-region experience and cellar visit",
    "Flights included",
  ],
  18: [
    "Luxury riverboat accommodation in the Amazon",
    "Train connection to Machu Picchu",
    "Guides throughout the core route",
    "Meals included throughout the itinerary",
  ],
  19: [
    "Private Egyptologist for major visits",
    "5-star Nile cruise experience",
    "Domestic flights included",
  ],
  20: [
    "Manhattan hotel accommodation",
    "Broadway tickets included",
    "Helicopter ride over Manhattan",
  ],
};

const richGreekIncludedOverrides: Partial<Record<number, string[]>> = {
  1: [
    "Διαμονή σε ιδιωτική έπαυλη με πανοραμική θέα στη θάλασσα",
    "Προσωπικός σεφ και υπηρεσία μπάτλερ σε όλη τη διαμονή",
    "Δύο επιλεγμένες ημέρες κρουαζιέρας με yacht στην ακτή",
    "Ιδιωτικές μεταφορές από και προς το αεροδρόμιο",
    "Εμπειρία γαστρονομίας υψηλού επιπέδου",
    "Υποστήριξη concierge όλο το 24ωρο",
  ],
  2: [
    "Διαμονή σε αναπαλαιωμένη machiya με παραδοσιακό χαρακτήρα",
    "Ιδιωτικός ξεναγός για τις βασικές εμπειρίες",
    "Συμμετοχή σε όλες τις προγραμματισμένες πολιτιστικές δράσεις",
    "Δείπνα kaiseki σε πέντε βραδιές",
    "Μία διανυκτέρευση σε zen μοναστήρι",
    "Πάσα μετακινήσεων με Shinkansen",
  ],
  3: [
    "Διαμονή σε θερμαινόμενο aurora dome",
    "Πολυτελές 4x4 για όλες τις χερσαίες μετακινήσεις",
    "Ιδιωτικός συνοδός δραστηριοτήτων",
    "Είσοδος στο Blue Lagoon με την άφιξη",
    "Γεύματα καθ' όλη τη διάρκεια του προγράμματος",
    "Πρόγραμμα εγγύησης Βόρειου Σέλαος",
  ],
  4: [
    "Διαμονή σε ιδιωτικό chalet ski-in, ski-out",
    "Όλες οι μεταφορές με ελικόπτερο",
    "Τέσσερις συνεδρίες heli-ski με πλήρη οργάνωση",
    "Συνοδεία έμπειρου ορεινού οδηγού",
    "Γεύματα και κρασί καθ' όλη τη διαμονή",
    "Πρόσβαση σε spa για αποκατάσταση",
  ],
  5: [
    "Διαμονή σε πολυτελή tented camps",
    "Όλες οι εσωτερικές bush flights",
    "Ιδιωτικό όχημα σαφάρι με προσωπικό οδηγό-ξεναγό",
    "Εμπειρία σαφάρι με αερόστατο",
    "Πλήρης διατροφή με premium ποτά",
    "Καλυμμένα τέλη πάρκων και conservation levy",
  ],
  6: [
    "Διαμονή σε boutique lodges και estancias",
    "Πολυτελές 4x4 με οδηγό",
    "Ιδιωτικός trekking guide στις βασικές διαδρομές",
    "Γεύματα σε όλη τη διάρκεια του ταξιδιού",
    "Εξοπλισμός για τα παγετωνικά περάσματα",
    "Όλες οι απαραίτητες εσωτερικές πτήσεις",
  ],
  7: [
    "Ιδιωτική οδική μεταφορά από και προς την Αθήνα",
    "Εισιτήρια εισόδου στον αρχαιολογικό χώρο",
    "Συνοδεία ξεναγού κατά την επίσκεψη",
  ],
  8: [
    "Διαμονή σε boutique ξενοδοχείο",
    "Πρωινό σε καθημερινή βάση",
    "Ξεναγική συνοδεία στα βασικά σημεία",
  ],
  9: [
    "Διαμονή σε πολυτελή suite στην Οία",
    "Ιδιωτική κρουαζιέρα με καταμαράν στην καλντέρα",
    "Όλες οι μεταφορές στο νησί",
  ],
  10: [
    "Διαμονή σε ξενοδοχείο στην Καλαμπάκα",
    "Οδηγός πεζοπορίας όπου προβλέπεται",
    "Μετακινήσεις σε όλο το πρόγραμμα",
  ],
  11: [
    "Ενοικίαση αυτοκινήτου για άνετη εξερεύνηση της Κρήτης",
    "Boutique διαμονές σε επιλεγμένα σημεία",
    "Παραδοσιακά δείπνα με τοπικό χαρακτήρα",
  ],
  12: [
    "Διαμονή σε ξενώνα στο Ζαγόρι",
    "Ορεινός οδηγός για τις κύριες πεζοπορίες",
    "Πρωινό κάθε πρωί",
  ],
  13: [
    "Έκδοση και οργάνωση των απαιτούμενων αδειών εισόδου",
    "Γεύματα στις μονές κατά την παραμονή",
    "Ακτοπλοϊκά εισιτήρια μετάβασης και επιστροφής",
  ],
  14: [
    "Διαμονή σε ξενοδοχείο 4 αστέρων",
    "Πτήσεις συμπεριλαμβανόμενες στο πακέτο",
    "Ξεναγικές επισκέψεις στα βασικά σημεία",
  ],
  15: [
    "Ακτοπλοϊκά εισιτήρια μετ' επιστροφής",
    "Γεύμα στο λιμάνι της Ύδρας",
    "Περιπατητική ξενάγηση στους βασικούς οικιστικούς πυρήνες",
  ],
  16: [
    "Διαμονή σε παραδοσιακό ξενώνα",
    "Πρωινό κάθε πρωί",
    "Καθοδηγούμενος περίπατος σε επιλεγμένες διαδρομές",
  ],
  17: [
    "Διαμονή σε ξενοδοχείο 5 αστέρων στο Παρίσι",
    "Εμπειρία στη Σαμπάνια με επίσκεψη σε ιστορικά κελάρια",
    "Πτήσεις συμπεριλαμβανόμενες",
  ],
  18: [
    "Διαμονή σε πολυτελές riverboat στον Αμαζόνιο",
    "Σιδηροδρομική σύνδεση προς Μάτσου Πίτσου",
    "Συνοδοί και ξεναγοί σε όλη τη βασική διαδρομή",
    "Γεύματα σε όλη τη διάρκεια του προγράμματος",
  ],
  19: [
    "Ιδιωτικός αιγυπτιολόγος στις βασικές επισκέψεις",
    "Εμπειρία κρουαζιέρας 5 αστέρων στον Νείλο",
    "Εσωτερικές πτήσεις συμπεριλαμβανόμενες",
  ],
  20: [
    "Διαμονή σε ξενοδοχείο στο Μανχάταν",
    "Εισιτήρια για παράσταση στο Broadway",
    "Πτήση με ελικόπτερο πάνω από το Μανχάταν",
  ],
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
      "Ημέρα 1 — Πορταριά, Χάνια, Μακρινίτσα και Βόλος || Πρωινή συγκέντρωση και αναχώρηση με ενδιάμεσες στάσεις προς το Πήλιο. Πρώτη γνωριμία με την αριστοκρατική Πορταριά, πέρασμα από τα Χάνια μέσα σε καταπράσινη διαδρομή και συνέχεια για τη Μακρινίτσα με τη μοναδική θέα προς τον Παγασητικό. Το απόγευμα καταλήγουμε στον Βόλο για βόλτα, δείπνο και διανυκτέρευση.",
      "Ημέρα 2 — Μηλιές, Βυζίτσα και Τσαγκαράδα || Μετά το πρωινό ανακαλύπτουμε μερικά από τα πιο ατμοσφαιρικά χωριά του Πηλίου. Περπατάμε σε καλντερίμια, πλατείες με αιωνόβια πλατάνια και γειτονιές με αρχοντικά, με χρόνο για καφέ, τοπικά γλυκά και χαλαρές στάσεις μέσα στο βουνίσιο τοπίο.",
      "Ημέρα 3 — Μυλοπόταμος και ανατολικό Πήλιο || Η ημέρα είναι αφιερωμένη στην πιο εντυπωσιακή θαλασσινή πλευρά του Πηλίου. Κατεβαίνουμε προς τον Μυλοπόταμο για μπάνιο και ξεκούραση δίπλα στα γαλαζοπράσινα νερά, ενώ στη συνέχεια απολαμβάνουμε φαγητό και χαλαρό ρυθμό πριν την επιστροφή.",
      "Ημέρα 4 — Νταμούχαρη, Φακίστρα και παραλιακή εξερεύνηση || Σήμερα γνωρίζουμε μια από τις πιο κινηματογραφικές γωνιές του Πηλίου. Επισκεπτόμαστε τη Νταμούχαρη και τις γύρω ακτές, με χρόνο για περιπάτους, φωτογραφίες και μια ήρεμη στάση δίπλα στη θάλασσα σε σκηνικό γεμάτο πράσινο και πέτρα.",
      "Ημέρα 5 — Βόλος και επιστροφή || Πριν τον δρόμο της επιστροφής απολαμβάνουμε ελεύθερο χρόνο στον Βόλο για μια τελευταία βόλτα στην παραλία και προαιρετικό τσιπουράδικο. Αναχώρηση το απόγευμα με άνετες ενδιάμεσες στάσεις προς την πόλη αναχώρησης.",
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
      program: richEnglishProgramOverrides[trip.id] ?? [...trip.program],
      included: richEnglishIncludedOverrides[trip.id] ?? [...trip.included],
      dateRange: enDateRange,
      departureCity: enDepartureCity,
    },
    gr: {
      title: grOverrides.title ?? trip.title,
      location: grOverrides.location ?? trip.location,
      duration: toGreekDuration(trip.duration),
      tags: grOverrides.tags ?? [...trip.tags],
      description: grOverrides.description ?? trip.description,
      program: richGreekProgramOverrides[trip.id] ??
        grOverrides.program ?? [...trip.program],
      included: richGreekIncludedOverrides[trip.id] ??
        grOverrides.included ?? [...trip.included],
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
