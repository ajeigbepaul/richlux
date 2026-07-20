// Hand-curated because naija-state-local-government/geo-ng's Oyo data only
// has generic ward numbers ("WARD 1 N2"), not recognizable neighborhood
// names -- unlike Lagos, where geo-ng's data is already good. Keyed exactly
// to the LGA name strings naija-state-local-government returns (note it
// calls what's commonly known as "Ibadan North" -- "Ibadan-Central" instead;
// that's this package's naming, not a typo here).
//
// Only the Ibadan-metro LGAs (where Richlux actually operates) are curated
// with real neighborhoods below. Every other Oyo LGA is smaller/more rural
// and isn't confidently known at that granularity -- getAreasForLocation()
// in utils/nigeriaLocations.js falls back to the LGA's own name as its one
// "area" option for those, rather than guess. Worth reviewing/expanding this
// list over time.
export const OYO_AREAS_BY_LGA = {
  "Ibadan-Central": [
    "Bodija",
    "Agbowo",
    "Sango",
    "University of Ibadan (UI)",
    "Mokola",
    "Ekotedo",
    "Yemetu",
    "Sasa",
  ],
  "Ibadan-North-East": ["Iwo Road", "Aremo", "Beere", "Oke-Aremo", "Idikan"],
  "Ibadan-North-West": ["Ring Road", "Dugbe", "Onireke", "Jericho", "Inalende"],
  "Ibadan-South-East": ["Molete", "Oke-Ado", "Felele", "Orita-Aperin", "Kudeti"],
  "Ibadan-South-West": ["Challenge", "Oluyole Estate", "Apata", "Idi-Ishin", "Odo-Ona"],
  Akinyele: ["Moniya", "Ojoo", "Awotan", "Ajibode"],
  Egbeda: ["Egbeda", "Erunmu", "Olodo"],
  Lagelu: ["Iyana Offa", "Ogunremi", "Lalupon"],
  "Ona-Ara": ["Akanran", "Olorunda-Ibadan"],
  Oluyole: ["Idi-Ayunre", "New Ife Road", "Alalubosa"],
  Ido: ["Ido", "Apete", "Ologuneru"],
};
