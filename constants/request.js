// Plain constants (no mongoose import) so client components can use these
// enums without pulling a server-only dependency into the browser bundle.
// `category` on a UserRequest reuses LISTING_CATEGORIES from
// constants/listing.js directly rather than duplicating it here.

export const MOVE_IN_TIMEFRAMES = [
  "immediate",
  "within-1-month",
  "1-3-months",
  "flexible",
];

export const MOVE_IN_TIMEFRAME_LABELS = {
  immediate: "Immediately",
  "within-1-month": "Within 1 month",
  "1-3-months": "1–3 months",
  flexible: "Flexible",
};

export const USER_REQUEST_STATUSES = ["open", "closed"];

export const CONTACT_METHODS = ["call", "whatsapp", "email"];

export const CONTACT_METHOD_LABELS = {
  call: "Phone call",
  whatsapp: "WhatsApp",
  email: "Email",
};

export const CONTACT_TIMES = ["morning", "afternoon", "evening", "anytime"];

export const CONTACT_TIME_LABELS = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  anytime: "Anytime",
};

export const FURNISHING_OPTIONS = [
  "furnished",
  "semi-furnished",
  "unfurnished",
  "no-preference",
];

export const FURNISHING_LABELS = {
  furnished: "Furnished",
  "semi-furnished": "Semi-furnished",
  unfurnished: "Unfurnished",
  "no-preference": "No preference",
};

export const SUGGESTED_AMENITIES = [
  "24-hr power/generator",
  "Borehole water supply",
  "Gated/security estate",
  "Air conditioning",
  "Swimming pool",
  "Gym",
  "Elevator",
  "Pet-friendly",
  "Serviced apartment",
];

export const APARTMENT_TYPES = [
  "Flat",
  "Mini-flat",
  "Self-contained",
  "Bungalow",
  "Duplex",
  "Terrace",
  "Block of Flats",
  "Land",
];

export const OFFER_STATUSES = ["pending", "accepted", "declined", "withdrawn"];
