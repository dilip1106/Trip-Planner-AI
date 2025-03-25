"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format, differenceInDays, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

interface DateRangeSelectorProps {
  value: {
    from: Date | undefined
    to: Date | undefined
  }
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void
  forGeneratePlan?: boolean
  maxDays?: number
}

const DateRangeSelector = ({ value, onChange, forGeneratePlan = false, maxDays = 10 }: DateRangeSelectorProps) => {
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
    // If we have a from date and the user is selecting a to date
    if (selectedDate.from && selectedDate.to) {
      // Calculate the difference in days
      const daysDifference = differenceInDays(selectedDate.to, selectedDate.from)

      // If the range is more than maxDays, adjust the to date
      if (daysDifference > maxDays) {
        const adjustedTo = addDays(selectedDate.from, maxDays)
        selectedDate.to = adjustedTo
        toast({
          title: "Date range limited",
          description: `You can only select up to ${maxDays} days.`,
          variant: "destructive",
        })
      }
    }

    const newDate = {
      ...date,
      ...selectedDate,
    }

    setDate(newDate)

    // Call onChange when both dates are selected or when clearing
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
          <div className="p-3 border-t text-xs text-muted-foreground">Maximum selection: {maxDays} days</div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateRangeSelector

