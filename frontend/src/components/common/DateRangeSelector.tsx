"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateRangeSelectorProps {
  value: {
    from: Date | undefined
    to: Date | undefined
  }
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void
  forGeneratePlan?: boolean
}

const DateRangeSelector = ({ value, onChange, forGeneratePlan = false }: DateRangeSelectorProps) => {
  const [date, setDate] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: value?.from,
    to: value?.to,
  })

  // Update local state when props change
  useEffect(() => {
    if (value?.from !== date.from || value?.to !== date.to) {
      setDate({
        from: value?.from,
        to: value?.to,
      })
    }
  }, [value?.from, value?.to])

  // Handle date selection
  const handleSelect = (selectedDate: any) => {
    const newDate = {
      ...date,
      ...selectedDate,
    }

    setDate(newDate)

    // Only call onChange when both dates are selected or when clearing
    if ((newDate.from && newDate.to) || (!newDate.from && !newDate.to)) {
      onChange(newDate)
    }
  }

  // Format the date range for display
  const formatDateRange = () => {
    if (date.from && date.to) {
      return `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
    }
    return "Select date range"
  }

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date.from && !date.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from}
            selected={{
              from: date.from,
              to: date.to,
            }}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={forGeneratePlan ? { before: new Date() } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateRangeSelector

