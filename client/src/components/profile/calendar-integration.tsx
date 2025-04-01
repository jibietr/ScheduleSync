import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Schema for the calendar integration form
const calendarFormSchema = z.object({
  calendarUrl: z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0)),
  autoSync: z.boolean().default(true),
});

type CalendarFormValues = z.infer<typeof calendarFormSchema>;

interface CalendarIntegrationProps {
  initialData: {
    calendarUrl: string;
    autoSync: boolean;
  };
  userId: number;
  onUpdate: (values: CalendarFormValues) => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  initialData,
  userId,
  onUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testingUrl, setTestingUrl] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarFormSchema),
    defaultValues: initialData,
  });

  const testCalendarUrl = async () => {
    const url = form.getValues("calendarUrl");
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a calendar URL first",
        variant: "destructive",
      });
      return;
    }

    setTestingUrl(true);
    try {
      const response = await apiRequest("POST", "/api/test-ics-url", { url });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test calendar URL",
        variant: "destructive",
      });
    } finally {
      setTestingUrl(false);
    }
  };

  const syncCalendar = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", `/api/user/${userId}/sync-calendar`, {});
      const data = await response.json();
      
      toast({
        title: "Calendar Synced",
        description: data.message,
      });
      
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync calendar events",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (values: CalendarFormValues) => {
    onUpdate(values);
  };

  return (
    <Card className="overflow-hidden mb-8">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Calendar Integration</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Connect your external calendar to automatically block busy times in your schedule.</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-5 space-y-6">
            <div className="flex flex-col space-y-3">
              <FormField
                control={form.control}
                name="calendarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar URL (.ics)</FormLabel>
                    <div className="mt-1 flex space-x-2">
                      <FormControl>
                        <Input 
                          {...field}
                          placeholder="https://calendar.google.com/calendar/ical/example@gmail.com/private/basic.ics" 
                          className="focus:ring-primary-500 focus:border-primary-500 flex-grow block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={testCalendarUrl}
                        disabled={testingUrl}
                      >
                        Test
                      </Button>
                    </div>
                    <FormDescription>
                      Paste the URL of your calendar's .ics feed. 
                      <a 
                        href="https://support.google.com/calendar/answer/37648" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500 ml-1"
                      >
                        How to find it?
                      </a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-2">
                <Button 
                  type="button" 
                  onClick={syncCalendar}
                  disabled={!initialData.calendarUrl || isLoading}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {isLoading ? "Syncing..." : "Connect Calendar"}
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <FormField
                control={form.control}
                name="autoSync"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Auto-sync calendar</FormLabel>
                      <FormDescription>
                        Update busy times automatically when your external calendar changes
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            {initialData.calendarUrl && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700">Connected Calendars</h4>
                
                <div className="mt-4 bg-gray-50 rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Calendar className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium text-gray-900">External Calendar</h5>
                        <p className="text-xs text-gray-500">
                          {lastSynced ? `Last synced: Today at ${lastSynced}` : "Not synced yet"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-500"
                      onClick={() => {
                        form.setValue("calendarUrl", "");
                        handleSubmit({ ...form.getValues(), calendarUrl: "" });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Disconnect</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
