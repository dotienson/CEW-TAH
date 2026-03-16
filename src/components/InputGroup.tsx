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
  disabled?: boolean;
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
  step = 'any',
  disabled = false
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
    <div className="flex flex-col mb-3">
      <label className="mb-1 text-xs font-semibold text-gray-700">{label}</label>
      <div className="flex items-center">
        <input
          type={type}
          inputMode={type === 'text' ? 'decimal' : undefined}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          step={step}
          disabled={disabled}
          className={`flex-1 px-3 py-1.5 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow text-sm ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
        />
        {unit && !onUnitToggle && (
          <span className="px-3 py-1.5 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-500 text-sm shadow-sm">
            {unit}
          </span>
        )}
        {onUnitToggle && unitOptions && currentUnit && (
          <button
            onClick={onUnitToggle}
            disabled={disabled}
            className={`px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-l-0 border-gray-200 rounded-r-lg text-gray-700 text-sm font-medium transition-colors shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {currentUnit}
          </button>
        )}
      </div>
    </div>
  );
};
