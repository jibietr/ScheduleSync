import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatShortDate, formatTimeRange } from "@/lib/utils";
import { Check, Calendar, Video } from "lucide-react";

interface ConfirmationProps {
  booking: {
    id: number;
    inviteeName: string;
    inviteeEmail: string;
    startTime: Date;
    endTime: Date;
    additionalInfo?: string;
    status: string;
    timezone: string;
  };
  template: {
    name: string;
    location: string;
  };
  host: {
    firstName: string;
    lastName: string;
  };
  onAddToCalendar: () => void;
  onBackToHome: () => void;
  onCancelBooking: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({
  booking,
  template,
  host,
  onAddToCalendar,
  onBackToHome,
  onCancelBooking
}) => {
  const locationIcon = {
    zoom: <Video className="text-blue-600" />,
    "google-meet": <Video className="text-blue-600" />,
    "ms-teams": <Video className="text-blue-600" />,
    phone: <span className="text-blue-600">📞</span>,
    custom: <span className="text-blue-600">📍</span>
  };

  const getLocationText = (location: string) => {
    switch (location) {
      case "zoom": return "Zoom Meeting";
      case "google-meet": return "Google Meet";
      case "ms-teams": return "Microsoft Teams";
      case "phone": return "Phone Call";
      default: return location;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardContent className="pt-6 px-4 py-5 sm:p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Booking Confirmed</h3>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                You're scheduled with {host.firstName} {host.lastName}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                A calendar invitation has been sent to your email address.
              </p>
            </div>
            
            <div className="mt-6 border-t border-b border-gray-200 py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary-100 text-primary-700 p-2 rounded-full">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="ml-4 text-left">
                  <p className="text-base font-medium text-gray-900">{template.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatShortDate(booking.startTime)} • {formatTimeRange(booking.startTime, booking.endTime)} ({booking.timezone})
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                  {locationIcon[template.location as keyof typeof locationIcon] || <span>📍</span>}
                </div>
                <div className="ml-4 text-left">
                  <p className="text-base font-medium text-gray-900">{getLocationText(template.location)}</p>
                  <p className="text-sm text-gray-500">
                    Meeting link will be sent in the calendar invitation
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Button onClick={onAddToCalendar} className="w-full">
                  <Calendar className="mr-2 h-4 w-4" /> Add to Calendar
                </Button>
                <Button onClick={onBackToHome} variant="outline" className="w-full">
                  <span className="mr-2">↩</span> Back to Home
                </Button>
              </div>
              <div className="mt-4 text-center">
                <Button onClick={onCancelBooking} variant="ghost" className="text-red-700 hover:bg-red-50 text-xs">
                  <span className="mr-1">✕</span> Cancel Booking
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
