import { useState, useEffect } from 'react';

interface PercentageInputProps {
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  max?: number;
}

/**
 * A percentage input that validates the value does not exceed max (default 100).
 * Shows an inline warning when the value exceeds the limit.
 */
export const PercentageInput = ({
  value,
  onChange,
  className = '',
  placeholder,
  readOnly = false,
  max = 100,
}: PercentageInputProps) => {
  const [showWarning, setShowWarning] = useState(false);

  const numericValue = parseFloat(String(value).replace(/,/g, '')) || 0;

  useEffect(() => {
    if (numericValue > max) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [numericValue, max]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const parsed = parseFloat(newValue.replace(/,/g, '')) || 0;

    if (parsed > max) {
      setShowWarning(true);
      // Still allow typing but show warning - don't block
      onChange(newValue);
    } else {
      setShowWarning(false);
      onChange(newValue);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        readOnly={readOnly}
        className={`${className} ${showWarning ? '!border-red-400 !ring-1 !ring-red-200' : ''}`}
        placeholder={placeholder}
      />
      {showWarning && (
        <div className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>ค่าต้องไม่เกิน {max}%</span>
        </div>
      )}
    </div>
  );
};
