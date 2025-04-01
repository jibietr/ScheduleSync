import React, { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Confirmation } from "@/components/booking/confirmation";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const ConfirmationPage: React.FC = () => {
  const [matched, params] = useRoute("/confirmation/:bookingId");
  const [_, navigate] = useLocation();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch booking data
  const { data: booking, isLoading: bookingLoading, error: bookingError } = useQuery({
    queryKey: [`/api/bookings/${params?.bookingId}`],
    enabled: !!params?.bookingId,
  });

  // Fetch template data if booking is loaded
  const { data: template, isLoading: templateLoading } = useQuery({
    queryKey: [`/api/templates/${booking?.templateId}`],
    enabled: !!booking?.templateId,
  });

  // Fetch user data if template is loaded
  const { data: host, isLoading: hostLoading } = useQuery({
    queryKey: [`/api/user/${template?.userId}`],
    enabled: !!template?.userId,
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/bookings/${params?.bookingId}/status`, { status: "cancelled" });
    },
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      // Refresh the page or redirect to a different page
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCalendar = () => {
    // In a real app, this would generate an .ics file or direct to Google Calendar
    toast({
      title: "Feature Coming Soon",
      description: "Calendar integration will be available soon.",
    });
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleCancelBooking = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancellation = () => {
    cancelBookingMutation.mutate();
    setCancelDialogOpen(false);
  };

  if (bookingError || !matched) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-8">The booking you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isLoading = bookingLoading || templateLoading || hostLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Confirmation 
        booking={{
          id: booking.id,
          inviteeName: booking.inviteeName,
          inviteeEmail: booking.inviteeEmail,
          startTime: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
          additionalInfo: booking.additionalInfo,
          status: booking.status,
          timezone: booking.timezone,
        }}
        template={{
          name: template.name,
          location: template.location,
        }}
        host={{
          firstName: host.firstName,
          lastName: host.lastName,
        }}
        onAddToCalendar={handleAddToCalendar}
        onBackToHome={handleBackToHome}
        onCancelBooking={handleCancelBooking}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancellation}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmationPage;
