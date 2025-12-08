import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date range',
  disabled = false,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = (range: DateRange): string => {
    if (!range.from) return placeholder;
    
    if (!range.to) {
      return format(range.from, 'MMM dd, yyyy');
    }
    
    return `${format(range.from, 'MMM dd, yyyy')} - ${format(range.to, 'MMM dd, yyyy')}`;
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm text-gray-700">{label}</Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`w-full justify-start text-left ${
              !value.from ? 'text-gray-500' : 'text-gray-900'
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: value.from,
              to: value.to,
            }}
            onSelect={(range) => {
              onChange({
                from: range?.from,
                to: range?.to,
              });
              // Close popover when both dates are selected
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
          />
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange({ from: undefined, to: undefined });
                  setIsOpen(false);
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {value.from && value.to && (
        <p className="text-xs text-gray-500">
          {Math.ceil((value.to.getTime() - value.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected
        </p>
      )}
    </div>
  );
};

export default DateRangePicker;
