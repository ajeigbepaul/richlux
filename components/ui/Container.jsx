import React from "react";

function Container({ children, size = "xl", className = "" }) {
  const maxWidth = size === "lg" ? "max-w-5xl" : "max-w-7xl";
  return (
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export default Container;
