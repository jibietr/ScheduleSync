import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { addMonths, subMonths, startOfMonth, format } from "date-fns";

interface CalendarDayPickerProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  availableDates?: Date[];
  className?: string;
  highlightToday?: boolean;
}

export const CalendarDayPicker: React.FC<CalendarDayPickerProps> = ({
  selectedDate,
  onDateSelect,
  availableDates = [],
  className,
  highlightToday = true
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Convert available dates to strings for easier comparison
  const availableDateStrings = availableDates.map(date => 
    date.toISOString().split('T')[0]
  );

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <Button 
          variant="ghost" 
          onClick={handlePreviousMonth}
          size="icon"
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button 
          variant="ghost" 
          onClick={handleNextMonth}
          size="icon"
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        className="p-0"
        modifiers={{
          available: (date) => {
            const dateString = date.toISOString().split('T')[0];
            return availableDateStrings.includes(dateString);
          }
        }}
        modifiersClassNames={{
          available: "bg-primary-50 text-primary-700 font-medium border border-primary-300 hover:bg-primary-100",
          today: highlightToday ? "bg-primary-50 text-primary-700 font-medium border border-primary-300" : ""
        }}
        disabled={(date) => {
          const dateString = date.toISOString().split('T')[0];
          return !availableDateStrings.includes(dateString);
        }}
      />
    </div>
  );
};
