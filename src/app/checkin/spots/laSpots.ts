// src/app/checkin/spots/laSpots.ts
// Curated LA launch list — "LA Edition, Sponsored by Stevie Williams".
//
// ⚠ COORDINATES: lat/lng below are best-known approximations and MUST be field-
// verified before public launch (coordsVerified:false on every entry). Addresses
// are accurate where a street address exists; several iconic street spots only
// have an area, and a couple are KNOBBED (landmark collectibles, not sessions).

import type { Spot } from "./types";

const SPONSOR = { by: "Stevie Williams", note: "LA Edition featured spot" };

export const LA_SPOTS: Spot[] = [
  // JKwon Plaza pinned to top of the LA list
  {
    id: "spot_jkwon", slug: "jkwon-plaza", name: "JKwon Plaza",
    type: "street", access: "skateable",
    lat: 34.0625, lng: -118.3010, coordsVerified: false,
    address: "Koreatown, Los Angeles, CA", neighborhood: "Koreatown",
    description: "A K-town plaza spot with ledges — a newer addition to the LA street rotation.",
    features: ["ledges", "plaza"],
    nfcTagId: "tag_jkwon", checkInCount: 150, edition: "la",
  },
  // ---- Skateable parks & plazas (sticker + skate) ----
  {
    id: "spot_venice", slug: "venice-beach-skatepark", name: "Venice Beach Skatepark",
    type: "park", access: "skateable",
    lat: 33.9850, lng: -118.4731, coordsVerified: false,
    address: "1800 Ocean Front Walk, Venice, CA 90291", neighborhood: "Venice",
    description: "The most iconic skatepark in LA — oceanfront bowls, a snake run, and a street section right on the sand.",
    features: ["bowls", "snake run", "street"],
    nfcTagId: "tag_venice", checkInCount: 5021, edition: "la", sponsored: SPONSOR,
  },
  {
    id: "spot_stoner", slug: "stoner-skate-plaza", name: "Stoner Skate Plaza",
    type: "plaza", access: "skateable",
    lat: 34.0411, lng: -118.4486, coordsVerified: false,
    address: "1835 Stoner Ave #1801, Los Angeles, CA 90025", neighborhood: "West LA",
    description: "California Skateparks-built street plaza with granite ledges and colored concrete. A west-side favorite.",
    features: ["granite ledges", "banks", "rails"],
    nfcTagId: "tag_stoner", checkInCount: 1284, edition: "la",
  },
  {
    id: "spot_elsereno", slug: "el-sereno-skatepark", name: "El Sereno Skatepark",
    type: "park", access: "skateable",
    lat: 34.0808, lng: -118.1736, coordsVerified: false,
    address: "Klamath St, Los Angeles, CA 90032", neighborhood: "El Sereno",
    description: "A 12,000 sq ft concrete street plaza popular with locals and pros alike.",
    features: ["plaza", "ledges", "banks"],
    nfcTagId: "tag_elsereno", checkInCount: 342, edition: "la",
  },

  // ---- Iconic street spots (collectibles) ----
  {
    id: "spot_wlacourthouse", slug: "west-la-courthouse", name: "West LA Courthouse",
    type: "street", access: "skateable",
    lat: 34.0469, lng: -118.4470, coordsVerified: false,
    address: "1633 Purdue Ave, Los Angeles, CA 90025", neighborhood: "West LA",
    description: "Legendary marble ledges that have been in video parts for decades. A must-collect LA landmark.",
    features: ["marble ledges"],
    nfcTagId: "tag_wlacourthouse", checkInCount: 892, edition: "la", sponsored: SPONSOR,
  },
  {
    id: "spot_usc", slug: "usc-university-ledges", name: "USC University Ledges",
    type: "street", access: "bust",
    lat: 34.0224, lng: -118.2851, coordsVerified: false,
    address: "USC Campus, Los Angeles, CA 90089", neighborhood: "University Park",
    description: "Smooth campus ledges and gaps around USC. Bust factor is high on weekdays — go early or weekends.",
    features: ["ledges", "gaps"],
    nfcTagId: "tag_usc", checkInCount: 640, edition: "la",
  },
  {
    id: "spot_hollywoodhigh", slug: "hollywood-high", name: "Hollywood High",
    type: "street", access: "skateable",
    lat: 34.0992, lng: -118.3401, coordsVerified: false,
    address: "1521 N Highland Ave, Los Angeles, CA 90028", neighborhood: "Hollywood",
    description: "The famous 12 and 16 stair sets — one of the most filmed spots in skateboarding history.",
    features: ["12 stair", "16 stair"],
    nfcTagId: "tag_hollywoodhigh", checkInCount: 1510, edition: "la",
  },
  {
    id: "spot_lahigh", slug: "los-angeles-high-school", name: "Los Angeles High School",
    type: "street", access: "skateable",
    lat: 34.0556, lng: -118.3320, coordsVerified: false,
    address: "4650 W Olympic Blvd, Los Angeles, CA 90019", neighborhood: "Mid-City",
    description: "Known as 'LA High' — an acre of brick banks of varying sizes wrapping the campus.",
    features: ["brick banks"],
    nfcTagId: "tag_lahigh", checkInCount: 760, edition: "la",
  },
  {
    id: "spot_courthouse", slug: "los-angeles-courthouse-ledges", name: "Los Angeles Courthouse Ledges",
    type: "street", access: "skateable",
    lat: 34.0537, lng: -118.2436, coordsVerified: false,
    address: "Downtown, Los Angeles, CA", neighborhood: "Downtown",
    description: "Downtown courthouse ledges — a classic stop on any LA street mission.",
    features: ["ledges"],
    nfcTagId: "tag_courthouse", checkInCount: 540, edition: "la",
  },
  {
    id: "spot_staples", slug: "staples-center", name: "Staples Center (Crypto.com Arena)",
    type: "plaza", access: "bust",
    lat: 34.0430, lng: -118.2673, coordsVerified: false,
    address: "1111 S Figueroa St, Los Angeles, CA 90015", neighborhood: "Downtown",
    description: "The arena plaza — big ledges and gaps with a serious bust factor on event days.",
    features: ["ledges", "gaps", "plaza"],
    nfcTagId: "tag_staples", checkInCount: 430, edition: "la",
  },
  {
    id: "spot_carwash", slug: "carwash-banks", name: "Carwash Banks",
    type: "street", access: "knobbed",
    lat: 34.0488, lng: -118.2570, coordsVerified: false,
    address: "Downtown, Los Angeles, CA", neighborhood: "Downtown",
    description: "Classic DTLA banks — now knobbed. Kept as a landmark collectible: tap in for the history, but it's no longer a session.",
    features: ["banks", "knobbed"],
    nfcTagId: "tag_carwash", checkInCount: 410, edition: "la",
  },
  {
    id: "spot_disneyhall", slug: "disney-hall-music-center", name: "Disney Hall / Music Center",
    type: "plaza", access: "bust",
    lat: 34.0556, lng: -118.2499, coordsVerified: false,
    address: "111 S Grand Ave, Los Angeles, CA 90012", neighborhood: "Downtown",
    description: "Architectural plazas around the Music Center — ledges, gaps, and stairs, heavily secured.",
    features: ["ledges", "stairs", "gaps"],
    nfcTagId: "tag_disneyhall", checkInCount: 360, edition: "la",
  },
  {
    id: "spot_dwp", slug: "department-of-water-and-power", name: "Department of Water and Power",
    type: "plaza", access: "bust",
    lat: 34.0612, lng: -118.2487, coordsVerified: false,
    address: "111 N Hope St, Los Angeles, CA 90012", neighborhood: "Downtown",
    description: "The DWP building plaza — long ledges and open ground, a downtown classic.",
    features: ["ledges", "plaza"],
    nfcTagId: "tag_dwp", checkInCount: 320, edition: "la",
  },
  {
    id: "spot_belmont", slug: "belmont-9-stair", name: "Belmont 9 Stair",
    type: "street", access: "skateable",
    lat: 34.0628, lng: -118.2640, coordsVerified: false,
    address: "Belmont, Los Angeles, CA", neighborhood: "Westlake",
    description: "A well-known 9-stair set that's seen plenty of hammers over the years.",
    features: ["9 stair"],
    nfcTagId: "tag_belmont", checkInCount: 280, edition: "la",
  },
  {
    id: "spot_wilshire15", slug: "wilshire-15", name: "Wilshire 15",
    type: "street", access: "knobbed",
    lat: 34.0619, lng: -118.2891, coordsVerified: false,
    address: "Wilshire Blvd, Los Angeles, CA", neighborhood: "Mid-Wilshire",
    description: "The famous Wilshire 15-stair — now knobbed. A landmark collectible for the history books.",
    features: ["15 stair", "knobbed"],
    nfcTagId: "tag_wilshire15", checkInCount: 300, edition: "la",
  },
  {
    id: "spot_lapl", slug: "los-angeles-public-library", name: "Los Angeles Public Library",
    type: "street", access: "bust",
    lat: 34.0505, lng: -118.2551, coordsVerified: false,
    address: "630 W 5th St, Los Angeles, CA 90071", neighborhood: "Downtown",
    description: "Central Library ledges and steps — a downtown street staple.",
    features: ["ledges", "steps"],
    nfcTagId: "tag_lapl", checkInCount: 260, edition: "la",
  },
  {
    id: "spot_pershing", slug: "pershing-square", name: "Pershing Square",
    type: "plaza", access: "skateable",
    lat: 34.0483, lng: -118.2529, coordsVerified: false,
    address: "532 S Olive St, Los Angeles, CA 90013", neighborhood: "Downtown",
    description: "Downtown's public square — ledges, banks, and open plaza space.",
    features: ["ledges", "banks", "plaza"],
    nfcTagId: "tag_pershing", checkInCount: 240, edition: "la",
  },
  {
    id: "spot_smslappy", slug: "santa-monica-slappy-curbs", name: "Santa Monica Slappy Curbs",
    type: "street", access: "skateable",
    lat: 34.0195, lng: -118.4912, coordsVerified: false,
    address: "Santa Monica, CA", neighborhood: "Santa Monica",
    description: "Perfect painted curbs for slappies — chill, low-bust, all-skill-levels fun.",
    features: ["curbs", "slappies"],
    nfcTagId: "tag_smslappy", checkInCount: 210, edition: "la",
  },
  {
    id: "spot_griffithditch", slug: "griffith-park-ditch", name: "Griffith Park Ditch",
    type: "transition", access: "skateable",
    lat: 34.1361, lng: -118.2940, coordsVerified: false,
    address: "Griffith Park, Los Angeles, CA 90027", neighborhood: "Los Feliz",
    description: "A natural transition ditch tucked in Griffith Park — carve and grind the banks.",
    features: ["ditch", "transition"],
    nfcTagId: "tag_griffithditch", checkInCount: 180, edition: "la",
  },
];

export const LA_SPOTS_BY_ID: Record<string, Spot> =
  Object.fromEntries(LA_SPOTS.map((s) => [s.id, s]));
export const LA_SPOTS_BY_SLUG: Record<string, Spot> =
  Object.fromEntries(LA_SPOTS.map((s) => [s.slug, s]));
