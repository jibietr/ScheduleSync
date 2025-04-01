import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Globe } from "lucide-react";
import { getDaysOfWeek, getTimezoneLabel } from "@/lib/utils";

interface TemplateCardProps {
  id: number;
  name: string;
  description?: string;
  slug: string;
  duration: number;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timezone: string;
  username: string;
  isDefault?: boolean;
  onEdit: (id: number) => void;
  onShare: (id: number) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  name,
  description,
  slug,
  duration,
  daysOfWeek,
  startTime,
  endTime,
  timezone,
  username,
  isDefault = false,
  onEdit,
  onShare
}) => {
  const daysLabels = getDaysOfWeek()
    .filter(day => daysOfWeek.includes(day.value))
    .map(day => day.label);

  const formattedDays = daysLabels.length === 7 
    ? "Every day" 
    : daysLabels.length === 5 && daysLabels.every(day => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day))
      ? "Monday - Friday"
      : daysLabels.join(", ");

  // Format the time from 24-hour to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Card className={isDefault ? "border-2 border-primary-300" : ""}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-2 ${isDefault ? "bg-primary-100" : "bg-blue-100"}`}>
            <Clock className={`text-xl ${isDefault ? "text-primary-700" : "text-blue-700"}`} />
          </div>
          <div className="ml-5">
            <h3 className="text-lg font-medium text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">
              {isDefault ? "Default template" : `${duration} minute meeting`}
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-sm">
          <div className="flex items-center text-gray-500 mb-3">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formattedDays}</span>
          </div>
          <div className="flex items-center text-gray-500 mb-3">
            <Clock className="mr-2 h-4 w-4" />
            <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Globe className="mr-2 h-4 w-4" />
            <span>Your time zone ({getTimezoneLabel(timezone)})</span>
          </div>
        </div>
        
        <div className="mt-6 text-right space-x-3">
          <Button 
            variant="link" 
            className="text-primary-600 hover:text-primary-900 text-sm font-medium p-0"
            onClick={() => onEdit(id)}
          >
            Edit
          </Button>
          <Button 
            variant="link" 
            className="text-primary-600 hover:text-primary-900 text-sm font-medium p-0"
            onClick={() => onShare(id)}
          >
            Share
          </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3">
        <div className="text-sm w-full">
          <span className="font-medium text-gray-900">Booking link: </span>
          <a 
            href={`/${username}/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            schedulr.com/{username}/{slug}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};
