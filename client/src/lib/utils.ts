import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: string | Date | null, formatStr: string = "PPpp"): string {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function getDayNameFromNumber(day: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day % 7];
}

export function formatShortDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

export function formatTimeRange(startTime: Date, endTime: Date): string {
  return `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
}

export function formatTimeOnly(time: Date): string {
  return format(time, "h:mm a");
}

export const timezones = [
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Rome", label: "Rome" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" }
];

export function getTimezoneLabel(value: string): string {
  const timezone = timezones.find(tz => tz.value === value);
  return timezone ? timezone.label : value;
}

export function generateTimeOptions(): { value: string; label: string }[] {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      const value = `${h}:${m}`;
      
      // Format for display (12-hour with AM/PM)
      const hourForDisplay = hour % 12 || 12;
      const ampm = hour < 12 ? "AM" : "PM";
      const label = `${hourForDisplay}:${m === "00" ? "00" : m} ${ampm}`;
      
      options.push({ value, label });
    }
  }
  return options;
}

export function getDurationOptions(): { value: number; label: string }[] {
  return [
    { value: 15, label: "15 minutes" },
    { value: 30, label: "30 minutes" },
    { value: 45, label: "45 minutes" },
    { value: 60, label: "60 minutes" },
    { value: 90, label: "1 hour 30 minutes" },
    { value: 120, label: "2 hours" }
  ];
}

export function getLocationOptions(): { value: string; label: string }[] {
  return [
    { value: "zoom", label: "Zoom Video Call (auto-generated)" },
    { value: "google-meet", label: "Google Meet (auto-generated)" },
    { value: "ms-teams", label: "Microsoft Teams (auto-generated)" },
    { value: "phone", label: "Phone Call" },
    { value: "custom", label: "Custom Location" }
  ];
}

export function getDaysOfWeek(): { value: number; label: string; short: string }[] {
  return [
    { value: 1, label: "Monday", short: "MON" },
    { value: 2, label: "Tuesday", short: "TUE" },
    { value: 3, label: "Wednesday", short: "WED" },
    { value: 4, label: "Thursday", short: "THU" },
    { value: 5, label: "Friday", short: "FRI" },
    { value: 6, label: "Saturday", short: "SAT" },
    { value: 7, label: "Sunday", short: "SUN" }
  ];
}
