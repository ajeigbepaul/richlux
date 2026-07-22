"use client";

import ClipLoader from "react-spinners/ClipLoader";

// Same ClipLoader already used inside Button.jsx's isLoading state, just
// centered and sized for standalone page/section loading (not a button).
// `color="currentColor"` so wrapping a text-* class recolors it per context.
// No default padding baked in -- pass spacing via className (e.g. "py-10")
// so it never conflicts with a caller's own padding utility.
function Spinner({ size = 32, className = "", label = "Loading" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ClipLoader color="currentColor" loading size={size} aria-label={label} />
    </div>
  );
}

export default Spinner;
