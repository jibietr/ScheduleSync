import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TimeZoneSelect } from "@/components/ui/time-zone-select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schema for the profile form
const profileFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, { message: "Username can only contain lowercase letters, numbers, and dashes" }),
  timezone: z.string().min(1, { message: "Timezone is required" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  initialData: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => void;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData,
  });

  return (
    <Card className="overflow-hidden mb-8">
      <CardContent className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-6">
            <div className="md:flex md:items-center">
              <div className="flex-shrink-0">
                <Avatar className="h-20 w-20 rounded-full">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                    alt="Profile photo" 
                  />
                  <AvatarFallback>
                    {initialData.firstName[0]}{initialData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-4 md:mt-0 md:ml-6">
                <div className="text-sm font-medium text-gray-500">
                  Profile URL
                </div>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    schedulr.com/
                  </span>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormControl>
                        <Input 
                          {...field} 
                          className="rounded-l-none focus:ring-primary-500 focus:border-primary-500 flex-grow block min-w-0 rounded-r-md sm:text-sm border-gray-300" 
                        />
                      </FormControl>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={() => (
                    <FormMessage className="mt-1" />
                  )}
                />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="sm:col-span-4">
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="email"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-3">
                    <TimeZoneSelect 
                      value={field.value} 
                      onChange={field.onChange}
                      label="Time zone"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
