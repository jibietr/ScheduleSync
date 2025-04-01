import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { formatShortDate, formatTimeRange } from "@/lib/utils";
import { Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Meeting {
  id: number;
  inviteeName: string;
  additionalInfo: string | null;
  startTime: Date;
  endTime: Date;
  timezone: string;
  status: string;
}

interface MeetingListProps {
  upcomingMeetings: Meeting[];
  pastMeetings: Meeting[];
  importedEvents?: { startTime: Date; endTime: Date; summary: string | null }[];
  onReschedule: (id: number) => void;
  onCancel: (id: number) => void;
  onViewNotes: (id: number) => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  upcomingMeetings,
  pastMeetings,
  importedEvents = [],
  onReschedule,
  onCancel,
  onViewNotes
}) => {
  return (
    <Tabs defaultValue="upcoming" className="mt-8">
      <TabsList className="border-b border-gray-200 w-full flex space-x-8 -mb-px bg-transparent">
        <TabsTrigger 
          value="upcoming"
          className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Upcoming Meetings
        </TabsTrigger>
        <TabsTrigger 
          value="past"
          className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Past Meetings
        </TabsTrigger>
        <TabsTrigger 
          value="imported"
          className="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          Imported Calendar
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="mt-6">
        {upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No upcoming meetings</h3>
              <p className="mt-1 text-sm text-gray-500">
                When someone books a meeting with you, it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-gray-200">
              {upcomingMeetings.map((meeting) => (
                <li key={meeting.id} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary-100 text-primary-700 p-2 rounded-full">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">30 Minute Meeting with {meeting.inviteeName}</p>
                          <p className="text-sm text-gray-500">{meeting.additionalInfo}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {formatShortDate(meeting.startTime)} • {formatTimeRange(meeting.startTime, meeting.endTime)} ({meeting.timezone})
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div>
                          <Button 
                            variant="link" 
                            className="text-primary-600 hover:text-primary-900 mr-3 p-0"
                            onClick={() => onReschedule(meeting.id)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="link" 
                            className="text-red-600 hover:text-red-900 p-0"
                            onClick={() => onCancel(meeting.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </TabsContent>
      
      <TabsContent value="past" className="mt-6">
        {pastMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No past meetings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your completed meetings will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-gray-200">
              {pastMeetings.map((meeting) => (
                <li key={meeting.id} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-gray-100 text-gray-700 p-2 rounded-full">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">30 Minute Meeting with {meeting.inviteeName}</p>
                          <p className="text-sm text-gray-500">{meeting.additionalInfo}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Completed
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {formatShortDate(meeting.startTime)} • {formatTimeRange(meeting.startTime, meeting.endTime)} ({meeting.timezone})
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div>
                          <Button 
                            variant="link" 
                            className="text-primary-600 hover:text-primary-900 p-0"
                            onClick={() => onViewNotes(meeting.id)}
                          >
                            View notes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="imported" className="mt-6">
        {importedEvents.length === 0 ? (
          <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No imported calendar events</h3>
              <p className="mt-1 text-sm text-gray-500">
                Events from your imported calendar will appear here once you set up calendar integration in your profile.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-gray-200">
              {importedEvents.map((event, index) => (
                <li key={index} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{event.summary || 'Calendar Event'}</p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Imported
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          {formatShortDate(event.startTime)} • {formatTimeRange(event.startTime, event.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};
