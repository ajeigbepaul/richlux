import React from "react";

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
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-ink-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        maxLength={max ? max : ""}
        placeholder={placeholder}
        className={
          className ||
          "w-full px-3 py-2 rounded-md border border-ink-300 focus:outline-none focus:ring-2 focus:ring-brand-400"
        }
        value={value}
        name={name}
        onChange={onChange}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
