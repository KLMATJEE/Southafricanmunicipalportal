import React, { useState, useEffect } from 'react';
import { validateRSAID } from '@/utils/validators/rsaIdValidator';
import { Check, X } from 'lucide-react';

interface RSAIDInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  label?: string;
  required?: boolean;
}

export const RSAIDInput: React.FC<RSAIDInputProps> = ({
  value,
  onChange,
  onValidationChange,
  label = 'RSA ID Number',
  required = false,
}) => {
  const [validation, setValidation] = useState<ReturnType<typeof validateRSAID> | null>(
    null
  );
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (value.length === 13) {
      const result = validateRSAID(value);
      setValidation(result);
      onValidationChange?.(result.valid);
    } else {
      setValidation(null);
      onValidationChange?.(false);
    }
  }, [value, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 13);
    onChange(input);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const showValidation = touched && value.length > 0;

  return (
    <div className="space-y-2">
      <label className="block text-sm text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="YYMMDDGGGGGSC"
          maxLength={13}
          className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
            showValidation
              ? validation?.valid
                ? 'border-green-500 focus:ring-green-600'
                : 'border-red-500 focus:ring-red-600'
              : 'border-gray-300 focus:ring-green-600'
          }`}
        />

        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validation?.valid ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
          </div>
        )}
      </div>

      {showValidation && validation && (
        <div
          className={`text-xs flex items-center gap-1 ${
            validation.valid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {validation.valid ? (
            <>
              <Check className="w-3 h-3" />
              <span>
                Valid - DOB:{' '}
                {validation.dateOfBirth?.toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                , {validation.gender}
              </span>
            </>
          ) : (
            <>
              <X className="w-3 h-3" />
              <span>{validation.error}</span>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Format: YYMMDD + Gender + Sequence + Citizenship + Checksum
      </p>
    </div>
  );
};

export default RSAIDInput;
