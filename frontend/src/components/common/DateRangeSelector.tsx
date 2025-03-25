import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addDays, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangeSelectorProps {
  value: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onChange: (value: { from: Date | undefined; to: Date | undefined }) => void;
  forGeneratePlan?: boolean;
  maxDays?: number;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  forGeneratePlan = false,
  maxDays = 10
}) => {
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: value?.from,
    to: value?.to,
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Update local state when props change
  useEffect(() => {
    if (value?.from !== date.from || value?.to !== date.to) {
      setDate({
        from: value?.from,
        to: value?.to,
      });
    }
  }, [value?.from, value?.to]);

  // Generate days for the current month
  const generateMonthDays = (month: Date) => {
    const days: Date[] = [];
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Pad with previous month's days
    const startingDay = firstDay.getDay();
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDay = new Date(firstDay);
      prevMonthDay.setDate(firstDay.getDate() - startingDay + i);
      days.push(prevMonthDay);
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(month.getFullYear(), month.getMonth(), i);
      days.push(day);
    }

    // Pad with next month's days to complete the grid
    const totalDays = 42; // 6 weeks
    while (days.length < totalDays) {
      const nextMonthDay = new Date(lastDay);
      nextMonthDay.setDate(lastDay.getDate() + days.length - lastDay.getDate() + 1);
      days.push(nextMonthDay);
    }

    return days;
  };

  // Handle date selection with max days limit
  const handleDateSelect = (selectedDay: Date) => {
    let newFrom = date.from;
    let newTo = date.to;

    if (!newFrom || (newFrom && newTo)) {
      // If no from date or both dates are set, start a new selection
      newFrom = selectedDay;
      newTo = undefined;
    } else {
      // Set to date
      if (selectedDay >= newFrom) {
        newTo = selectedDay;

        // Check max days
        const daysDifference = differenceInDays(newTo, newFrom);
        if (daysDifference > maxDays) {
          newTo = addDays(newFrom, maxDays);
          alert(`Date range limited to ${maxDays} days.`);
        }
      } else {
        // If selected day is before from date, swap
        newTo = newFrom;
        newFrom = selectedDay;
      }
    }

    const newDate = { from: newFrom, to: newTo };
    setDate(newDate);

    // Call onChange when both dates are selected or when clearing
    if ((newDate.from && newDate.to) || (!newDate.from && !newDate.to)) {
      onChange(newDate);
    }
  };

  // Check if a day should be disabled
  const isDayDisabled = (day: Date) => {
    // Disable dates before today if forGeneratePlan is true
    if (forGeneratePlan && day < new Date(new Date().setHours(0, 0, 0, 0))) {
      return true;
    }

    // Disable days from different months if not in the current view
    if (day.getMonth() !== currentMonth.getMonth()) {
      return true;
    }

    // Check max days selection
    if (date.from && !date.to) {
      const daysDifference = differenceInDays(day, date.from);
      return daysDifference > maxDays;
    }

    return false;
  };

  // Check if a day is selected or part of the selected range
  const isDaySelected = (day: Date) => {
    if (!date.from) return false;

    if (!date.to) {
      return day.toDateString() === date.from.toDateString();
    }

    return day >= date.from && day <= date.to;
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (date.from && date.to) {
      return `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date.from && !date.to && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 flex items-center justify-between border-b">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const newMonth = subMonths(currentMonth, 1);
              setCurrentMonth(newMonth);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const newMonth = addMonths(currentMonth, 1);
              setCurrentMonth(newMonth);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 p-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-muted-foreground">{day}</div>
          ))}
          {generateMonthDays(currentMonth).map((day, index) => (
            <button
              key={index}
              onClick={() => !isDayDisabled(day) && handleDateSelect(day)}
              className={cn(
                "p-1 text-sm hover:bg-accent hover:text-accent-foreground",
                isDayDisabled(day) && "text-muted-foreground opacity-50 cursor-not-allowed",
                isDaySelected(day) && "bg-primary text-primary-foreground",
                day.getMonth() !== currentMonth.getMonth() && "text-muted-foreground opacity-40"
              )}
            >
              {day.getDate()}
            </button>
          ))}
        </div>
        <div className="p-3 border-t text-xs text-muted-foreground">
          Maximum selection: {maxDays} days
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeSelector;