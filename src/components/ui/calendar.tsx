"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
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
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}


