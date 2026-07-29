import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const VARIANTS = {
  // brand-700, not the brighter brand-400/500 the rest of the palette uses --
  // white text on brand-400 measured at 2.32:1 contrast, badly failing WCAG
  // AA's 4.5:1 (this is the default state of nearly every button/CTA in the
  // app). brand-700 clears it at ~6.5:1. brand-400/500 stay unchanged
  // everywhere else (icons, badges, links, secondary/ghost variants).
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  // Explicit bg (not just a border on a transparent background) so this
  // reads as a proper surface/card in dark mode -- matching Input fields
  // and every other bg-white dark:bg-surface-800 element -- instead of a
  // near-invisible outline floating on the page background.
  // text-brand-400 on a white background measures 2.32:1, the same failure
  // as the old primary bug above -- brand-700 (light) / brand-400 (dark, on
  // the dark surface-800 bg) matches the ghost variant's pattern below.
  secondary:
    "border border-brand-400 text-brand-700 dark:text-brand-400 bg-white dark:bg-surface-800 hover:bg-brand-50 dark:hover:bg-brand-900/30",
  ghost: "text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  type = "button",
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`rounded-md font-medium transition-all duration-300 ease-luxury hover:shadow-elevation-sm dark:hover:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ClipLoader
          color="#ffffff"
          loading
          cssOverride={{ display: "block", margin: "0 auto" }}
          size={18}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
