export type VenueOption = {
  id: string;
  name: string;
  address: string;
  note: string;
  category: "toyxona" | "restaurant" | "banquet";
  city: string;
  coordinates: [number, number];
};

export const venueOptions: VenueOption[] = [
  {
    id: "navroz-palace",
    name: "Navro'z Palace",
    address: "Toshkent shahri, Chilonzor tumani",
    note: "Klassik zal, markaziy yo'l va katta parking",
    category: "toyxona",
    city: "Toshkent",
    coordinates: [69.2163, 41.2852]
  },
  {
    id: "dunyo-palace",
    name: "Dunyo Palace",
    address: "Toshkent shahri, Yashnobod tumani",
    note: "Premium kirish, keng sahna va foto zonalar",
    category: "toyxona",
    city: "Toshkent",
    coordinates: [69.3499, 41.2928]
  },
  {
    id: "hilton-hall",
    name: "Hilton Hall",
    address: "Toshkent shahri, Yunusobod tumani",
    note: "Zamonaviy interyer, sokin premium muhit",
    category: "banquet",
    city: "Toshkent",
    coordinates: [69.3068, 41.3539]
  },
  {
    id: "yangi-uzbekiston",
    name: "Yangi O'zbekiston Majmuasi",
    address: "Toshkent viloyati, Zangiota tumani",
    note: "Keng maydon, tantanali kirish va sahna",
    category: "banquet",
    city: "Zangiota",
    coordinates: [69.0865, 41.0717]
  },
  {
    id: "grand-opera",
    name: "Grand Opera",
    address: "Toshkent shahri, Shayxontohur tumani",
    note: "Elegant sahna, oq fon va yorug' zal",
    category: "restaurant",
    city: "Toshkent",
    coordinates: [69.2417, 41.3168]
  },
  {
    id: "samarqand-city",
    name: "Samarkand City Hall",
    address: "Samarqand shahri, markaziy hudud",
    note: "Foto uchun qulay, markaziy lokatsiya",
    category: "toyxona",
    city: "Samarqand",
    coordinates: [66.9726, 39.6542]
  }
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function findVenueOption(name: string, address: string) {
  const normalizedName = normalize(name);
  const normalizedAddress = normalize(address);

  return venueOptions.find((venue) => {
    const venueName = normalize(venue.name);
    const venueAddress = normalize(venue.address);
    return venueName === normalizedName || venueAddress === normalizedAddress;
  });
}

export function getVenueById(id: string) {
  return venueOptions.find((venue) => venue.id === id);
}
