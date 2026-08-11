export type SeedCollectionBase = {
  name: string;
  slug: string;
  group: string;
  hours: string;
  location: { lat: number; lng: number; address: string };
  acceptedMaterials: string[];
  settings: { pointsPerReturn: number; plasticSavedPerUnit: number; co2SavedPerUnit: number };
  /** Legacy demo names to migrate onto this real venue. */
  aliases?: string[];
};

const mall = { pointsPerReturn: 12, plasticSavedPerUnit: 0.08, co2SavedPerUnit: 0.15 };
const hub = { pointsPerReturn: 15, plasticSavedPerUnit: 0.1, co2SavedPerUnit: 0.2 };
const market = { pointsPerReturn: 10, plasticSavedPerUnit: 0.05, co2SavedPerUnit: 0.1 };

/**
 * Real, visitable Greater Accra places. Coordinates from published
 * listings (Wikipedia, Mapcarta, Coliba / Waste Resource Map).
 * A ReLoop desk sits at the venue — people can navigate here.
 */
export const SEED_COLLECTION_BASES: SeedCollectionBase[] = [
  {
    name: 'Accra Mall',
    slug: 'green-market-hq',
    aliases: ['Green Market HQ'],
    group: 'East Accra',
    hours: 'Daily 10:00–21:00',
    location: {
      lat: 5.62217,
      lng: -0.17331,
      address: 'Plot C11, Tetteh Quarshie Interchange, Spintex Road',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: mall,
  },
  {
    name: 'Junction Mall',
    slug: 'junction-mall',
    group: 'East Accra',
    hours: 'Daily 10:00–21:00',
    location: {
      lat: 5.61332,
      lng: -0.07206,
      address: 'The Junction Mall, Nungua, Beach Road',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: mall,
  },
  {
    name: 'West Hills Mall',
    slug: 'west-hills-mall',
    group: 'West Accra',
    hours: 'Daily 10:00–21:00',
    location: {
      lat: 5.59964,
      lng: -0.29078,
      address: 'West Hills Mall, Weija / Dunkonah',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: mall,
  },
  {
    name: 'Oxford Street, Osu',
    slug: 'eco-hub-store',
    aliases: ['Eco Hub Store'],
    group: 'Accra Central',
    hours: 'Daily 09:00–21:00',
    location: {
      lat: 5.5604,
      lng: -0.184,
      address: 'Oxford Street, Osu Klottey, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: hub,
  },
  {
    name: 'Marina Mall, Airport City',
    slug: 'sustainability-corner',
    aliases: ['Sustainability Corner'],
    group: 'Airport City',
    hours: 'Daily 10:00–21:00',
    location: {
      lat: 5.6055,
      lng: -0.1748,
      address: 'Marina Mall, Airport City, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: hub,
  },
  {
    name: 'A&C Shopping Village',
    slug: 'ac-shopping-village',
    group: 'East Accra',
    hours: 'Mon–Sat 09:00–20:00 · Sun 12:00–18:30',
    location: {
      lat: 5.636,
      lng: -0.1545,
      address: 'Block 232, Jungle Road, East Legon',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: mall,
  },
  {
    name: 'Achimota Retail Centre',
    slug: 'achimota-retail-centre',
    group: 'North Accra',
    hours: 'Daily 10:00–21:00',
    location: {
      lat: 5.6235,
      lng: -0.232,
      address: 'Achimota Retail Centre, Accra–Nsawam Road',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: mall,
  },
  {
    name: 'University of Ghana, Legon',
    slug: 'ug-legon',
    group: 'North Accra',
    hours: 'Daily 08:00–18:00',
    location: {
      lat: 5.64561,
      lng: -0.18631,
      address: 'Dr. J.B. Danquah Avenue, Legon Campus',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: hub,
  },
  {
    name: 'Kotoka International Airport',
    slug: 'kotoka-airport',
    group: 'Airport City',
    hours: 'Daily 06:00–22:00',
    location: {
      lat: 5.60519,
      lng: -0.16679,
      address: 'Kotoka International Airport, Airport Residential',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: hub,
  },
  {
    name: 'Madina Market',
    slug: 'madina-market',
    group: 'North Accra',
    hours: 'Mon–Sat 07:00–18:00',
    location: {
      lat: 5.6831,
      lng: -0.1675,
      address: 'Madina New Market, Madina',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: market,
  },
  {
    name: 'Kaneshie Market',
    slug: 'kaneshie-market',
    group: 'West Accra',
    hours: 'Mon–Sat 07:00–18:00',
    location: {
      lat: 5.5685,
      lng: -0.232,
      address: 'Kaneshie Market, Winneba Road',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: market,
  },
  {
    name: 'Makola Market',
    slug: 'makola-market',
    group: 'Accra Central',
    hours: 'Mon–Sat 07:00–18:00',
    location: {
      lat: 5.5486,
      lng: -0.2074,
      address: 'Makola Market, Kinbu Road, Accra Central',
    },
    acceptedMaterials: ['Plastic', 'Metal'],
    settings: market,
  },
  {
    name: 'Kwame Nkrumah Circle',
    slug: 'kwame-nkrumah-circle',
    group: 'Accra Central',
    hours: 'Daily 08:00–20:00',
    location: {
      lat: 5.5715,
      lng: -0.2145,
      address: 'Kwame Nkrumah Circle, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: market,
  },
  {
    name: '37 Station',
    slug: '37-station',
    group: 'Airport City',
    hours: 'Daily 08:00–20:00',
    location: {
      lat: 5.5915,
      lng: -0.1825,
      address: '37 Military Hospital / 37 Station, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: market,
  },
  {
    name: 'Black Star Square',
    slug: 'black-star-square',
    group: 'Accra Central',
    hours: 'Daily 08:00–18:00',
    location: {
      lat: 5.5485,
      lng: -0.1924,
      address: 'Independence Square, High Street, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: hub,
  },
  {
    name: 'Labadi Beach',
    slug: 'labadi-beach',
    group: 'East Accra',
    hours: 'Daily 08:00–19:00',
    location: {
      lat: 5.5585,
      lng: -0.1475,
      address: 'Labadi Beach Road, La, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: mall,
  },
  {
    name: 'Korle Bu Teaching Hospital',
    slug: 'korle-bu',
    group: 'West Accra',
    hours: 'Daily 08:00–18:00',
    location: {
      lat: 5.5372,
      lng: -0.2265,
      address: 'Guggisberg Avenue, Korle Bu, Accra',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Electronic'],
    settings: hub,
  },
  {
    name: 'Tema Community 1',
    slug: 'tema-community-1',
    group: 'Tema',
    hours: 'Mon–Sat 08:00–18:00',
    location: {
      lat: 5.6697,
      lng: -0.0169,
      address: 'Community 1 Market, Tema',
    },
    acceptedMaterials: ['Plastic', 'Glass', 'Metal'],
    settings: market,
  },
  {
    name: 'Tema Community 12',
    slug: 'tema-community-12',
    group: 'Tema',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.691,
      lng: 0.005,
      address: 'Community 12, opposite Roshan Montessori, Tema',
    },
    acceptedMaterials: ['Plastic', 'Glass'],
    settings: market,
  },
  {
    name: 'Coliba East Legon Total',
    slug: 'coliba-east-legon',
    group: 'East Accra',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.6423483,
      lng: -0.151875,
      address: 'Total Energies, East Legon, Accra',
    },
    acceptedMaterials: ['Plastic'],
    settings: hub,
  },
  {
    name: 'Osu Mandela Park',
    slug: 'osu-mandela-park',
    group: 'Accra Central',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.5558,
      lng: -0.1815,
      address: 'Mandela Park, Osu, Accra',
    },
    acceptedMaterials: ['Plastic'],
    settings: market,
  },
  {
    name: 'Lapaz NHIS',
    slug: 'lapaz-nhis',
    group: 'West Accra',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.6075,
      lng: -0.2508,
      address: 'Opposite NHIS, Lapaz, Accra',
    },
    acceptedMaterials: ['Plastic'],
    settings: market,
  },
  {
    name: 'Dansoman Glefe',
    slug: 'dansoman-glefe',
    group: 'West Accra',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.5355,
      lng: -0.275,
      address: 'Christ Family Liberty Assembly, Glefe, Dansoman',
    },
    acceptedMaterials: ['Plastic'],
    settings: market,
  },
  {
    name: 'Tesano Total',
    slug: 'tesano-total',
    group: 'North Accra',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.5948,
      lng: -0.2345,
      address: 'Total Energies, Tesano, Accra',
    },
    acceptedMaterials: ['Plastic'],
    settings: market,
  },
  {
    name: 'Adabraka Liberty Avenue',
    slug: 'adabraka-liberty',
    group: 'Accra Central',
    hours: 'Mon–Sat 08:00–16:00',
    location: {
      lat: 5.5608,
      lng: -0.211,
      address: 'Liberty Avenue Total, Adabraka, Accra',
    },
    acceptedMaterials: ['Plastic'],
    settings: market,
  },
];
