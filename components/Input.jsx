"use client"
import React from "react";

function Input({ type, placeholder, className, value, name, onChange,max }) {
  return (
    <input
      type={type}
      maxLength={max?max:""}
      placeholder={placeholder}
      className={className}
      value={value}
      name={name}
      onChange={onChange}
      required
    />
  );
}

export default Input;
