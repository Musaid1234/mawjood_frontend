import * as React from 'react'
import { Input } from './input'

interface DateTimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function DateTimePicker({ label, className, ...props }: DateTimePickerProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Input type="datetime-local" className={className} {...props} />
    </div>
  )
}


