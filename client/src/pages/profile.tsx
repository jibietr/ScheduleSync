import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ProfileForm } from "@/components/profile/profile-form";
import { CalendarIntegration } from "@/components/profile/calendar-integration";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Profile: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch user data (using static userId=1 for demo)
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user/1"],
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest("PUT", `/api/user/1`, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1"] });
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update calendar settings mutation
  const updateCalendarMutation = useMutation({
    mutationFn: async (calendarData: any) => {
      return apiRequest("PUT", `/api/user/1`, calendarData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/1"] });
      toast({
        title: "Calendar Settings Updated",
        description: "Your calendar settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update calendar settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = (formData: any) => {
    updateProfileMutation.mutate(formData);
  };

  const handleCalendarUpdate = (formData: any) => {
    updateCalendarMutation.mutate(formData);
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium">Error loading profile data</p>
        <p className="text-gray-600 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      {isLoading ? (
        <>
          <Skeleton className="h-64 mb-8 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </>
      ) : (
        <>
          <ProfileForm 
            initialData={{
              firstName: user?.firstName || "",
              lastName: user?.lastName || "",
              email: user?.email || "",
              username: user?.username || "",
              timezone: user?.timezone || "America/New_York",
            }}
            onSubmit={handleProfileUpdate}
            isLoading={updateProfileMutation.isPending}
          />
          
          <CalendarIntegration 
            initialData={{
              calendarUrl: user?.calendarUrl || "",
              autoSync: user?.autoSync ?? true,
            }}
            userId={user?.id || 1}
            onUpdate={handleCalendarUpdate}
          />
        </>
      )}
    </div>
  );
};

export default Profile;
