import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeZoneSelect } from "@/components/ui/time-zone-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysOfWeek, generateTimeOptions, getDurationOptions, getLocationOptions } from "@/lib/utils";

// Schema for the form
const templateFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "URL slug is required" })
    .regex(/^[a-z0-9-]+$/, { message: "URL slug can only contain lowercase letters, numbers, and dashes" }),
  description: z.string().optional(),
  duration: z.coerce.number().min(1, { message: "Duration is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  daysOfWeek: z.array(z.number()).min(1, { message: "Select at least one day" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  timezone: z.string().min(1, { message: "Time zone is required" }),
  bufferBefore: z.coerce.number().min(0).default(0),
  bufferAfter: z.coerce.number().min(0).default(0),
  additionalQuestions: z.string().optional(),
  collectName: z.boolean().default(true),
  collectEmail: z.boolean().default(true),
  collectPhone: z.boolean().default(false),
  notifyOnBooking: z.boolean().default(true),
  notifyCancellation: z.boolean().default(true),
  notifyReminder: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  defaultValues?: Partial<TemplateFormValues>;
  onSubmit: (values: TemplateFormValues) => void;
  isLoading?: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  defaultValues,
  onSubmit,
  isLoading = false
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "30 Minute Meeting",
      slug: "30min",
      description: "",
      duration: 30,
      location: "zoom",
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: "09:00",
      endTime: "17:00",
      timezone: "America/New_York",
      bufferBefore: 0,
      bufferAfter: 0,
      additionalQuestions: "",
      collectName: true,
      collectEmail: true,
      collectPhone: false,
      notifyOnBooking: true,
      notifyCancellation: true,
      notifyReminder: true,
      ...defaultValues
    }
  });

  const handleSubmit = (values: TemplateFormValues) => {
    onSubmit(values);
  };

  const daysOfWeek = getDaysOfWeek();
  const timeOptions = generateTimeOptions();
  const durationOptions = getDurationOptions();
  const locationOptions = getLocationOptions();

  return (
    <div>
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="relative">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div 
              style={{ width: `${(step/3)*100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all"
            ></div>
          </div>
          <div className="flex text-xs justify-between mt-2">
            <div className={step >= 1 ? "text-primary-600 font-semibold" : "text-gray-500"}>
              1. Basic Details
            </div>
            <div className={step >= 2 ? "text-primary-600 font-semibold" : "text-gray-500"}>
              2. Availability
            </div>
            <div className={step >= 3 ? "text-primary-600 font-semibold" : "text-gray-500"}>
              3. Booking Form
            </div>
          </div>
        </div>
      </div>
      
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Meeting Details</h2>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meeting name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="30 Minute Meeting" />
                        </FormControl>
                        <FormDescription>This is what your invitees will see.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Brief description of the meeting..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom URL</FormLabel>
                        <div className="flex rounded-md shadow-sm">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            schedulr.com/janesmith/
                          </span>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="rounded-l-none"
                              placeholder="30min" 
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                  >
                    Continue to Availability
                  </Button>
                </div>
              </CardContent>
            )}
            
            {/* Step 2: Availability */}
            {step === 2 && (
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Availability</h2>
                
                <div className="space-y-6">
                  <div>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Date Range (Optional)</FormLabel>
                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <div className="relative">
                              <Button
                                variant="outline"
                                type="button"
                                className="w-full justify-start text-left font-normal"
                                onClick={() => document.getElementById('startDateCalendar')?.click()}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  <span>{field.value.toLocaleDateString()}</span>
                                ) : (
                                  <span>Pick a start date</span>
                                )}
                              </Button>
                              <Calendar
                                id="startDateCalendar"
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                className="hidden"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <span>to</span>
                      
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <div className="relative">
                              <Button
                                variant="outline"
                                type="button"
                                className="w-full justify-start text-left font-normal"
                                onClick={() => document.getElementById('endDateCalendar')?.click()}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  <span>{field.value.toLocaleDateString()}</span>
                                ) : (
                                  <span>Pick an end date</span>
                                )}
                              </Button>
                              <Calendar
                                id="endDateCalendar"
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                className="hidden"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="daysOfWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Available Days</FormLabel>
                        <div className="grid grid-cols-7 gap-2">
                          {daysOfWeek.map((day) => (
                            <Button
                              key={day.value}
                              type="button"
                              variant="outline"
                              className={`flex-col items-center px-4 py-2 ${
                                field.value.includes(day.value)
                                  ? "bg-primary-50 border-primary-300 text-primary-700"
                                  : ""
                              }`}
                              onClick={() => {
                                const updatedDays = field.value.includes(day.value)
                                  ? field.value.filter(d => d !== day.value)
                                  : [...field.value, day.value];
                                field.onChange(updatedDays);
                              }}
                            >
                              <span>{day.short}</span>
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel className="block text-sm font-medium text-gray-700 mb-2">Available Hours</FormLabel>
                    <div className="flex items-center space-x-4">
                      <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <span>to</span>
                      
                      <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="End time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {timeOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <TimeZoneSelect 
                          label="Time Zone"
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="bufferBefore"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Buffer time before (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bufferAfter"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Buffer time after (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min="0"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)}
                  >
                    Continue to Booking Form
                  </Button>
                </div>
              </CardContent>
            )}
            
            {/* Step 3: Booking Form */}
            {step === 3 && (
              <CardContent className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Booking Form</h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="collectName"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Name</FormLabel>
                            <FormDescription>
                              Collect invitee's name
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="collectEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Email</FormLabel>
                            <FormDescription>
                              Collect invitee's email address
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="collectPhone"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Phone Number</FormLabel>
                            <FormDescription>
                              Collect invitee's phone number
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="additionalQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Questions</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="What would you like to discuss during our meeting?"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Notifications</h3>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="notifyOnBooking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Send email notification when a meeting is booked
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifyCancellation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Send email notification when a meeting is canceled
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notifyReminder"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Send a reminder email 24 hours before the meeting
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating..." : "Create Meeting Template"}
                  </Button>
                </div>
              </CardContent>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};
