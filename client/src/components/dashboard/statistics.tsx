import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, BarChart } from "lucide-react";

interface StatisticsProps {
  upcomingCount: number;
  weeklyCount: number;
  availabilityPercentage: number;
}

export const Statistics: React.FC<StatisticsProps> = ({
  upcomingCount,
  weeklyCount,
  availabilityPercentage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Upcoming</h3>
            <span className="p-1.5 rounded-full bg-primary-100">
              <CalendarDays className="h-4 w-4 text-primary-600" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{upcomingCount}</p>
            <p className="text-sm text-gray-500">Scheduled meetings</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">This Week</h3>
            <span className="p-1.5 rounded-full bg-green-100">
              <Users className="h-4 w-4 text-green-600" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{weeklyCount}</p>
            <p className="text-sm text-gray-500">Total bookings</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Usage</h3>
            <span className="p-1.5 rounded-full bg-blue-100">
              <BarChart className="h-4 w-4 text-blue-600" />
            </span>
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-900">{availabilityPercentage}%</p>
            <p className="text-sm text-gray-500">Available capacity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
