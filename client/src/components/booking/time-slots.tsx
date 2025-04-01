import React from "react";
import { Button } from "@/components/ui/button";
import { formatTimeOnly } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TimeSlotsProps {
  date: Date | undefined;
  slots: Date[];
  selectedSlot: Date | undefined;
  onSelectSlot: (slot: Date) => void;
  className?: string;
}

export const TimeSlots: React.FC<TimeSlotsProps> = ({
  date,
  slots,
  selectedSlot,
  onSelectSlot,
  className
}) => {
  if (!date) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">Please select a date first</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">No available time slots for the selected date</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-base font-medium text-gray-900 mb-4">
        Available Times for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {slots.map((slot, index) => (
          <Button
            key={index}
            variant="outline"
            className={cn(
              "transition-all hover:shadow-md py-2 px-4 text-sm font-medium",
              selectedSlot && selectedSlot.getTime() === slot.getTime()
                ? "bg-primary-100 text-primary-700 border-primary-300"
                : "text-primary-700 bg-primary-50 border-primary-300 hover:bg-primary-100"
            )}
            onClick={() => onSelectSlot(slot)}
          >
            {formatTimeOnly(slot)}
          </Button>
        ))}
      </div>
    </div>
  );
};
