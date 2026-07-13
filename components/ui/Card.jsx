import React from "react";

function Card({ children, hoverLift = false, className = "", ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-card ${
        hoverLift ? "richtrans" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
