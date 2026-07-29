import React from "react";

function Card({ children, hoverLift = false, className = "", ...props }) {
  return (
    <div
      className={`bg-white dark:bg-surface-800 rounded-2xl shadow-card transition-shadow duration-300 ease-luxury ${
        hoverLift ? "hover:shadow-elevation-md dark:hover:shadow-none" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
