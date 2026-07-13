import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const VARIANTS = {
  primary: "bg-brand-400 text-white hover:bg-brand-500",
  secondary: "border border-brand-400 text-brand-400 hover:bg-brand-50",
  ghost: "text-brand-500 hover:bg-brand-50",
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
      className={`rounded-md font-medium transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
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
