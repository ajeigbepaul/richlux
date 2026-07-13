// Plain constants (no mongoose import) so client components can use these
// enums without pulling a server-only dependency into the browser bundle.

export const LISTING_CATEGORIES = [
  "house-sale",
  "property-management",
  "shortlet",
  "rental",
  "land-sale",
];

export const LISTING_CATEGORY_LABELS = {
  "house-sale": "House Sales",
  "property-management": "Management",
  shortlet: "Shortlet",
  rental: "Rentals",
  "land-sale": "Land Sales",
};

export const LISTING_STATUSES = [
  "available",
  "pending",
  "sold",
  "rented",
  "off-market",
];

export const LISTING_PRICE_FREQUENCIES = [
  "one-time",
  "per-night",
  "per-month",
  "per-year",
];

export const USER_ROLES = ["superadmin", "manager", "agent", "user"];
