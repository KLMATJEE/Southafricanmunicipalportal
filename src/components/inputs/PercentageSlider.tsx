import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PercentageSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  showInput?: boolean;
  disabled?: boolean;
  description?: string;
}

export const PercentageSlider: React.FC<PercentageSliderProps> = ({
  value,
  onChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  showInput = true,
  disabled = false,
  description,
}) => {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(e.target.value);
    if (!isNaN(inputValue) && inputValue >= min && inputValue <= max) {
      onChange(inputValue);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-sm text-gray-700">{label}</Label>
          {showInput && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={value}
                onChange={handleInputChange}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className="w-20 h-8 text-right px-2"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          )}
        </div>
      )}

      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}%</span>
        <span>{value}%</span>
        <span>{max}%</span>
      </div>

      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};

export default PercentageSlider;
