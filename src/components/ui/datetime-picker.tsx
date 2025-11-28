"use client";

import * as React from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({ value, onChange, disabled, className }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value || undefined);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setDate(value || undefined);
  }, [value]);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (date) {
        newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      } else {
        newDate.setHours(12, 0, 0, 0);
      }
      setDate(newDate);
      onChange?.(newDate);
    }
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
    if (!date) return;
    
    const newDate = new Date(date);
    if (type === "hour") {
      const hour = parseInt(value);
      const isPM = newDate.getHours() >= 12;
      newDate.setHours(hour === 12 ? (isPM ? 12 : 0) : (isPM ? hour + 12 : hour));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (value === "PM" && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (value === "AM" && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }
    setDate(newDate);
    onChange?.(newDate);
  };

  const selectedHour = date ? (date.getHours() % 12 || 12) : 12;
  const selectedMinute = date ? date.getMinutes() : 0;
  const selectedPeriod = date && date.getHours() >= 12 ? "PM" : "AM";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM dd, yyyy hh:mm aa") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Calendar Section */}
          <div className="border-r">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="p-3"
              modifiersClassNames={{
                selected: "bg-[#1c4233] text-white hover:bg-[#1c4233] hover:text-white font-medium rounded-md",
                today: "bg-gray-100 font-semibold rounded-md",
              }}
              classNames={{
                months: "flex flex-col",
                month: "space-y-4",
                caption: "flex justify-between items-center px-2 mb-2",
                caption_label: "text-sm font-semibold",
                nav: "flex items-center gap-1",
                button_previous: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded",
                button_next: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded",
                month_grid: "w-full border-collapse mt-4",
                weekdays: "flex mb-1",
                weekday: "text-gray-500 rounded-md w-9 font-medium text-xs",
                week: "flex w-full mt-1",
                day: "relative p-0 text-center h-9 w-9 font-normal hover:bg-gray-100 rounded-md transition-colors cursor-pointer",
                day_button: "h-9 w-9 p-0 font-normal hover:bg-gray-100 rounded-md transition-colors",
                outside: "text-gray-300",
                disabled: "text-gray-300 opacity-50",
                hidden: "invisible",
              }}
            />
          </div>

          {/* Time Section */}
          <div className="flex flex-col p-3 gap-3 min-w-[200px]">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 pb-2 border-b">
              <Clock className="h-4 w-4" />
              Select Time
            </div>

            {/* Hour Selection */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Hour</label>
              <div className="grid grid-cols-4 gap-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                    className={cn(
                      "h-8 rounded text-sm font-medium transition-colors",
                      selectedHour === hour
                        ? "bg-[#1c4233] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Selection */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Minute</label>
              <div className="grid grid-cols-4 gap-1">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleTimeChange("minute", minute.toString())}
                    className={cn(
                      "h-8 rounded text-sm font-medium transition-colors",
                      selectedMinute === minute
                        ? "bg-[#1c4233] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    {minute.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM Selection */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Period</label>
              <div className="grid grid-cols-2 gap-2">
                {["AM", "PM"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => handleTimeChange("ampm", period)}
                    className={cn(
                      "h-9 rounded text-sm font-semibold transition-colors",
                      selectedPeriod === period
                        ? "bg-[#1c4233] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

