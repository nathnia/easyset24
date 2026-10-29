export const filterGroups = [
  {
    key: "airline",
    title: "Airline",
    type: "check",
    more: "SWITZERLAND",
    options: [
      "Austrian Airlines",
      "Air France",
      "Lufthansa",
      "Brussels Airlines",
      "ITA Airways",
    ],
  },
  {
    key: "rating",
    title: "Passenger Rating",
    type: "radio",
    more: "Show More",
    options: [
      "All",
      "Outstanding 9+",
      "Very Good 8+",
      "Good 7+",
      "Excellent",
      "Poor",
    ],
  },
  {
    key: "popular",
    title: "Popular Filters",
    type: "check",
    more: "Show More",
    options: [
      "Drink Included",
      "Taxes Included",
      "VIP",
      "Child Friendly",
      "Pet Friendly",
    ],
  },
];

export const airlines = [
  {
    name: "Turkish Airlines",
    logo: "bg-airline-turkish text-white",
    icon: "simple-icons:turkishairlines",
    iconSize: 42,
  },
  { name: "Delta Airlines", logo: "bg-white", icon: "", iconSize: 0 },
  {
    name: "Lufthansa",
    logo: "bg-white text-black",
    icon: "simple-icons:lufthansa",
    iconSize: 56,
  },
];

export const info = {
  from: "Stockholm",
  to: "Istanbul",
  duration: "9h ,45m",
  departure: "12:00",
  stops: ["18:00", "20:00"],
  stopText: "One Stop, 3h Between",
  landing: "10:00",
  fromAirport: "ARN Stockholm",
  viaAirport: "FCO Rome Fiumicino",
  toAirport: "SAW Istanbul Sabiha",
  price: "$75",
  seats: "25 Vacant Seats",
  carbon: "31% less carbon dioxide",
};
