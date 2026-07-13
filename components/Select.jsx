import React from "react";

function SelectInput({ value, onChange, options, placeholder, label, name, className }) {
  const inputId = name || placeholder;
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
      <select
        id={inputId}
        name={name}
        className={
          className ||
          "w-full px-3 py-2 rounded-md border border-ink-300 text-ink-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
        }
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((optionitem, idx) => (
          <option key={idx} value={optionitem?.value}>
            {optionitem.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectInput;
