import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { timezones } from "@/lib/utils";

interface TimeZoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const TimeZoneSelect: React.FC<TimeZoneSelectProps> = ({
  value,
  onChange,
  label = "Time Zone",
  className
}) => {
  return (
    <div className={className}>
      {label && <Label className="mb-2 block text-sm font-medium text-gray-700">{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time zone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map(timezone => (
            <SelectItem key={timezone.value} value={timezone.value}>
              {timezone.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
