"use client";

import React from "react";
import Select from "@/components/Select";
import { AVAILABLE_STATES } from "@/constants/location";
import { getLgasForState, getAreasForLocation } from "@/utils/nigeriaLocations";

const stateOptions = AVAILABLE_STATES.map((value) => ({ value, name: value }));

// Country -> State -> LGA -> Area cascade, reused everywhere a location is
// captured (the request wizard's present/preferred location, the offer
// form's address card). Country is a plain label, not a dropdown -- the
// business only operates in Nigeria today, so there's nothing else to
// choose.
function LocationSelect({
  state,
  lga,
  area,
  onStateChange,
  onLgaChange,
  onAreaChange = () => {},
  stateLabel = "State",
  lgaLabel = "LGA",
  areaLabel = "Area",
}) {
  const lgaOptions = getLgasForState(state).map((value) => ({ value, name: value }));
  const areaOptions = getAreasForLocation(state, lga).map((value) => ({ value, name: value }));

  const handleStateChange = (e) => {
    onStateChange(e.target.value);
    // A stale LGA/area from the previous state must never linger once the
    // state changes out from under them.
    onLgaChange("");
    onAreaChange("");
  };

  const handleLgaChange = (e) => {
    onLgaChange(e.target.value);
    // Same reasoning -- a stale area from the previous LGA shouldn't linger.
    onAreaChange("");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="w-full">
        <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
          Country
        </label>
        <div className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-ink-100 dark:bg-surface-900 text-ink-700 dark:text-slate-200">
          Nigeria
        </div>
      </div>
      <Select
        label={stateLabel}
        name="state"
        value={state}
        onChange={handleStateChange}
        options={stateOptions}
        placeholder="Select a state"
      />
      <Select
        label={lgaLabel}
        name="lga"
        value={lga}
        onChange={handleLgaChange}
        options={lgaOptions}
        // Before a state is chosen there's nothing to select yet -- just
        // repeat the label instead of a "Select a state first" placeholder
        // that gets clipped mid-word in the select's fixed width.
        placeholder={state ? "Select an LGA" : lgaLabel}
      />
      <Select
        label={areaLabel}
        name="area"
        value={area}
        onChange={(e) => onAreaChange(e.target.value)}
        options={areaOptions}
        placeholder={lga ? "Select an area" : areaLabel}
      />
    </div>
  );
}

export default LocationSelect;
