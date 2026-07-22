"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Input({
  type,
  placeholder,
  className,
  value,
  name,
  onChange,
  max,
  label,
  error,
  id,
}) {
  const inputId = id || name;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputClassName =
    className ||
    `w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 ${
      isPassword ? "pr-10" : ""
    }`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          maxLength={max ? max : ""}
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          name={name}
          onChange={onChange}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-500 dark:text-slate-400 hover:text-ink-700 dark:hover:text-slate-200"
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
