import React from "react";
function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select className="w-full text-orange-400 p-1" value={value} onChange={onChange} placeholder="choose bed">
      <option>{placeholder}</option>
      {options.map((optionitem, idx) => (
        <option key={idx} value={optionitem?.value} className="p-0">
          {optionitem.name}
        </option>
      ))}
    </select>
  );
}

export default SelectInput;
