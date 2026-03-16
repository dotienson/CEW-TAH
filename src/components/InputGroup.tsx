import React from 'react';

interface InputGroupProps {
  label: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (val: string) => void;
  type?: string;
  placeholder?: string;
  unit?: string;
  onUnitToggle?: () => void;
  unitOptions?: string[];
  currentUnit?: string;
  step?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  onValueChange,
  type = 'text',
  placeholder,
  unit,
  onUnitToggle,
  unitOptions,
  currentUnit,
  step = 'any'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      let val = e.target.value.replace(',', '.');
      if (/^-?\d*\.?\d*$/.test(val)) {
        onValueChange(val);
      }
    } else if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col mb-4">
      <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center">
        <input
          type={type}
          inputMode={type === 'text' ? 'decimal' : undefined}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          step={step}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow"
        />
        {unit && !onUnitToggle && (
          <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-500 text-sm shadow-sm">
            {unit}
          </span>
        )}
        {onUnitToggle && unitOptions && currentUnit && (
          <button
            onClick={onUnitToggle}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-200 rounded-r-lg text-gray-700 text-sm font-medium transition-colors shadow-sm"
          >
            {currentUnit}
          </button>
        )}
      </div>
    </div>
  );
};
