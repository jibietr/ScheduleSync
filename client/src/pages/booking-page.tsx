import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDayPicker } from "@/components/booking/calendar-day-picker";
import { TimeSlots } from "@/components/booking/time-slots";
import { BookingForm } from "@/components/booking/booking-form";
import { TimeZoneSelect } from "@/components/ui/time-zone-select";
import { Clock, Video, Phone } from "lucide-react";
import { addDays, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const BookingPage: React.FC = () => {
  const [_, navigate] = useLocation();
  const [matched, params] = useRoute("/:username/:slug");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<Date>();
  const [timezone, setTimezone] = useState<string>("Europe/Paris");
  const { toast } = useToast();

  // Reset selected slot when date changes
  useEffect(() => {
    setSelectedSlot(undefined);
  }, [selectedDate]);

  // Fetch template and user information
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/${params?.username}/${params?.slug}`],
    enabled: !!params?.username && !!params?.slug,
  });

  // Generate date range for available dates (next 60 days)
  const dateRange = Array.from({ length: 60 }, (_, i) => {
    const date = addDays(startOfDay(new Date()), i);
    return date;
  });

  // Fetch available time slots for selected date
  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ["/api/available-slots", { username: params?.username, slug: params?.slug, date: selectedDate?.toISOString() }],
    enabled: !!selectedDate && !!params?.username && !!params?.slug,
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `/api/available-slots?username=${params?.username}&slug=${params?.slug}&date=${selectedDate?.toISOString()}&timezone=${timezone}`
      );
      if (!response.ok) throw new Error("Failed to fetch available slots");
      const data = await response.json();
      return data.map((slot: string) => new Date(slot));
    }
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        navigate(`/confirmation/${data.id}`);
      });
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Failed to create your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitBooking = (formValues: any) => {
    if (!selectedSlot || !data?.template) return;
    
    // Calculate end time based on duration
    const endTime = new Date(selectedSlot.getTime());
    endTime.setMinutes(endTime.getMinutes() + data.template.duration);
    
    const bookingData = {
      templateId: data.template.id,
      inviteeName: formValues.name,
      inviteeEmail: formValues.email,
      inviteePhone: formValues.phone,
      startTime: selectedSlot,
      endTime: endTime,
      additionalInfo: formValues.additionalInfo,
      status: "confirmed",
      timezone: formValues.timezone
    };
    
    createBookingMutation.mutate(bookingData);
  };

  if (error || !matched) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Meeting Not Found</h1>
          <p className="text-gray-600 mb-8">The meeting you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const getLocationIcon = (location: string) => {
    switch (location) {
      case "zoom":
      case "google-meet":
      case "ms-teams":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="md:flex">
            {/* Left column with booking details */}
            <div className="p-6 sm:p-8 md:w-1/3 bg-gray-50">
              {isLoading ? (
                <>
                  <div className="text-center md:text-left">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto md:mx-0" />
                    <Skeleton className="mt-4 h-6 w-32 mx-auto md:mx-0" />
                    <Skeleton className="mt-2 h-4 w-24 mx-auto md:mx-0" />
                  </div>
                  <div className="mt-8">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="mt-2 h-20 w-full" />
                    <div className="mt-6 space-y-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center md:text-left">
                    <Avatar className="h-16 w-16 rounded-full mx-auto md:mx-0">
                      <AvatarImage 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                        alt={`${data?.user?.firstName} ${data?.user?.lastName}`} 
                      />
                      <AvatarFallback>
                        {data?.user?.firstName?.[0]}{data?.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="mt-4 text-xl font-bold text-gray-900">
                      {data?.user?.firstName} {data?.user?.lastName}
                    </h1>
                    <p className="text-gray-500">Product Manager</p>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-lg font-semibold text-gray-900">{data?.template?.name}</h2>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{data?.template?.description}</p>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="flex-shrink-0 mr-2 text-gray-400" />
                        <span>{data?.template?.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {getLocationIcon(data?.template?.location)}
                        <span className="ml-2">{getLocationText(data?.template?.location)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Right column with calendar */}
            <div className="p-6 sm:p-8 md:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Select a Date & Time</h2>
                <div className="flex items-center">
                  <TimeZoneSelect 
                    value={timezone} 
                    onChange={setTimezone}
                    className="w-56"
                  />
                </div>
              </div>
              
              {/* Calendar View */}
              <div className="md:flex md:space-x-6">
                <div className="mb-6 md:mb-0 md:w-1/2">
                  <CalendarDayPicker 
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    availableDates={dateRange}
                  />
                </div>
                
                <div className="md:w-1/2">
                  {selectedDate ? (
                    slotsLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-10" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <TimeSlots 
                        date={selectedDate}
                        slots={slots}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                      />
                    )
                  ) : (
                    <p className="text-center text-gray-500 py-10">
                      Please select a date from the calendar to see available time slots.
                    </p>
                  )}
                  
                  {selectedSlot && data?.template && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
                      <BookingForm 
                        templateId={data.template.id}
                        selectedSlot={selectedSlot}
                        collectName={data.template.collectName}
                        collectEmail={data.template.collectEmail}
                        collectPhone={data.template.collectPhone}
                        additionalQuestions={data.template.additionalQuestions}
                        defaultTimezone={timezone}
                        onSubmit={handleSubmitBooking}
                        isLoading={createBookingMutation.isPending}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;
