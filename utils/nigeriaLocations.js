import NaijaStates from "naija-state-local-government";
import { getLgaSubAreas } from "geo-ng";
import { OYO_AREAS_BY_LGA } from "@/constants/ibadanAreas";

// NaijaStates.lgas(state) returns the whole matched state object
// ({ state, senatorial_districts, lgas }), not a bare array -- and throws on
// an empty/invalid state -- so every caller goes through this wrapper
// instead of the raw package API.
export function getLgasForState(state) {
  if (!state) return [];
  try {
    return NaijaStates.lgas(state)?.lgas || [];
  } catch {
    return [];
  }
}

// geo-ng's Lagos LGA names are ALL-CAPS with spaces ("AJEROMI IFELODUN"),
// while naija-state-local-government's (used for the State/LGA selects
// above) are Title-Case and hyphenated ("Ajeromi-Ifelodun") -- normalize,
// then patch the couple of real spelling mismatches between the two
// packages' data.
const LGA_NAME_ALIASES = {
  "IFAKO IJAIYE": "IFAKO IJAYE",
  SHOMOLU: "SOMOLU",
};

function toGeoNgLgaKey(lga) {
  const normalized = lga.toUpperCase().replace(/-/g, " ").trim();
  return LGA_NAME_ALIASES[normalized] || normalized;
}

// Neighborhood-level areas within a chosen LGA -- Lagos comes from geo-ng's
// real data; Oyo comes from constants/ibadanAreas.js since geo-ng only has
// generic ward numbers for Oyo, not recognizable names. Always returns at
// least one option (falling back to the LGA's own name) so the Area select
// is never left with nothing to choose once a state+LGA are picked.
export function getAreasForLocation(state, lga) {
  if (!state || !lga) return [];

  if (state === "Lagos") {
    const areas = getLgaSubAreas("LA", toGeoNgLgaKey(lga));
    return areas?.length ? areas : [lga];
  }

  if (state === "Oyo") {
    const areas = OYO_AREAS_BY_LGA[lga];
    return areas?.length ? areas : [lga];
  }

  return [lga];
}
