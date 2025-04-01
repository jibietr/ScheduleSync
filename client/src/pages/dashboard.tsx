import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Statistics } from "@/components/dashboard/statistics";
import { MeetingList } from "@/components/dashboard/meeting-list";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define calendar event interface
interface CalendarEvent {
  id: number;
  userId: number;
  startTime: Date | string;
  endTime: Date | string;
  summary: string | null;
  externalId: string | null;
  createdAt: Date | null;
  lastSynced: Date | null;
}

const Dashboard: React.FC = () => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch bookings data (using userId = 1 for demo)
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/bookings", { userId: 1 }],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(`/api/bookings?userId=1`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    }
  });
  
  // Fetch calendar events
  const { data: calendarEvents = [], isLoading: calendarLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar-events", { userId: 1 }],
    queryFn: async () => {
      const now = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(now.getMonth() + 6);
      
      const response = await fetch(`/api/calendar-events?userId=1&startDate=${now.toISOString()}&endDate=${sixMonthsFromNow.toISOString()}`);
      if (!response.ok) throw new Error("Failed to fetch calendar events");
      const events = await response.json();
      console.log("Calendar events:", events);
      return events;
    }
  });

  // Calculate stats
  const upcomingCount = data?.upcoming.length || 0;
  const weeklyCount = calculateWeeklyBookings(data?.upcoming, data?.past);
  const availabilityPercentage = calculateAvailabilityPercentage(data?.upcoming);

  // Mutation for canceling a booking
  const cancelMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest("PUT", `/api/bookings/${bookingId}/status`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Cancelled",
        description: "The meeting has been cancelled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel the booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCancelBooking = (id: number) => {
    setSelectedBookingId(id);
    setCancelDialogOpen(true);
  };

  const confirmCancellation = () => {
    if (selectedBookingId) {
      cancelMutation.mutate(selectedBookingId);
      setCancelDialogOpen(false);
    }
  };

  const handleReschedule = (id: number) => {
    // In a real app, this would navigate to a reschedule page
    toast({
      title: "Feature Coming Soon",
      description: "Rescheduling functionality will be available soon.",
    });
  };

  const handleViewNotes = (id: number) => {
    // In a real app, this would open meeting notes
    toast({
      title: "Feature Coming Soon",
      description: "Meeting notes functionality will be available soon.",
    });
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium">Error loading dashboard data</p>
        <p className="text-gray-600 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back. Here's an overview of your scheduled meetings.</p>
      </div>
      
      {isLoading || calendarLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 mt-8 rounded-lg" />
        </>
      ) : (
        <>
          <Statistics 
            upcomingCount={upcomingCount} 
            weeklyCount={weeklyCount} 
            availabilityPercentage={availabilityPercentage} 
          />
          
          <MeetingList 
            upcomingMeetings={data?.upcoming || []}
            pastMeetings={data?.past || []}
            importedEvents={calendarEvents.map((event: CalendarEvent) => {
              console.log("Calendar events:", calendarEvents);
              return {
                startTime: new Date(event.startTime),
                endTime: new Date(event.endTime),
                summary: event.summary
              };
            })}
            onReschedule={handleReschedule}
            onCancel={handleCancelBooking}
            onViewNotes={handleViewNotes}
          />
        </>
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this meeting? This action cannot be undone
              and the invitee will be notified about the cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancellation}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Yes, cancel meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Helper functions for calculating statistics
function calculateWeeklyBookings(upcoming: any[] = [], past: any[] = []): number {
  const now = new Date();
  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(now.getDate() + 7);
  
  return upcoming.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate <= oneWeekFromNow;
  }).length;
}

function calculateAvailabilityPercentage(upcoming: any[] = []): number {
  // This is a simplified calculation - in a real app this would be more complex
  // based on user's availability preferences vs. booked slots
  const baseAvailability = 100;
  const bookingImpact = upcoming.length * 4; // Each booking reduces availability by 4%
  return Math.max(0, Math.min(100, baseAvailability - bookingImpact));
}

export default Dashboard;
