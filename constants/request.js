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

export const LEASE_DURATION_OPTIONS = ["6-months", "1-year", "2-years", "3-years-plus"];

export const LEASE_DURATION_LABELS = {
  "6-months": "6 months",
  "1-year": "1 year",
  "2-years": "2 years",
  "3-years-plus": "3+ years",
};

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

// Property-management-only: the requester already owns the property and is
// asking Richlux to manage it -- these describe the property's current
// state and the scope of service needed, not what the requester wants to
// move into.
export const OCCUPANCY_STATUSES = ["vacant", "tenanted", "owner-occupied"];

export const OCCUPANCY_STATUS_LABELS = {
  vacant: "Vacant",
  tenanted: "Currently tenanted",
  "owner-occupied": "Owner-occupied",
};

export const MANAGEMENT_SERVICE_TYPES = [
  "full-management",
  "rent-collection",
  "tenant-sourcing",
  "maintenance-only",
];

export const MANAGEMENT_SERVICE_TYPE_LABELS = {
  "full-management": "Full management",
  "rent-collection": "Rent collection only",
  "tenant-sourcing": "Tenant sourcing",
  "maintenance-only": "Maintenance only",
};

// Land-sale-only
export const LAND_TITLE_DOCUMENTS = [
  "c-of-o",
  "governors-consent",
  "deed-of-assignment",
  "excision",
  "gazette",
  "survey-plan-only",
  "not-sure",
];

export const LAND_TITLE_DOCUMENT_LABELS = {
  "c-of-o": "Certificate of Occupancy (C of O)",
  "governors-consent": "Governor's Consent",
  "deed-of-assignment": "Deed of Assignment",
  excision: "Excision",
  gazette: "Gazette",
  "survey-plan-only": "Survey plan only",
  "not-sure": "Not sure",
};

export const LAND_PURPOSES = ["residential", "commercial", "agricultural", "any"];

export const LAND_PURPOSE_LABELS = {
  residential: "Residential",
  commercial: "Commercial",
  agricultural: "Agricultural",
  any: "Any",
};
