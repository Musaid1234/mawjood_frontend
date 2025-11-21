"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  'aria-label'?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, 'aria-label': ariaLabel, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          aria-label={ariaLabel}
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-gray-300 dark:border-gray-600",
            "flex items-center justify-center",
            "transition-colors",
            "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            checked && "bg-primary border-primary",
            !checked && "bg-white dark:bg-gray-800",
            className
          )}
          onClick={() => {
            if (!props.disabled && onCheckedChange) {
              onCheckedChange(!checked);
            }
          }}
        >
          {checked && (
            <Check className="h-3 w-3 text-white" />
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox }

