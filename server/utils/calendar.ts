import ical from 'node-ical';
import { InsertCalendarEvent, type User } from '@shared/schema';
import { storage } from '../storage';

export interface CalendarEvent {
  summary: string;
  start: Date;
  end: Date;
  uid?: string;
}

export async function fetchCalendarEvents(icsUrl: string): Promise<CalendarEvent[]> {
  try {
    const events = await ical.async.fromURL(icsUrl);
    const calendarEvents: CalendarEvent[] = [];

    for (const [key, event] of Object.entries(events)) {
      if (event.type !== 'VEVENT') continue;
      if (!event.start || !event.end) continue;

      calendarEvents.push({
        summary: event.summary || 'Busy',
        start: event.start,
        end: event.end,
        uid: event.uid
      });
    }

    return calendarEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error('Failed to fetch calendar events');
  }
}

export async function syncCalendarEvents(user: User): Promise<number> {
  if (!user.calendarUrl) {
    throw new Error('No calendar URL provided');
  }

  try {
    // Clear existing events
    await storage.deleteCalendarEventsByUserId(user.id);

    // Fetch new events
    const events = await fetchCalendarEvents(user.calendarUrl);
    let count = 0;

    // Save new events
    for (const event of events) {
      await storage.createCalendarEvent({
        userId: user.id,
        externalId: event.uid,
        summary: event.summary,
        startTime: event.start,
        endTime: event.end
      });
      count++;
    }

    return count;
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    throw error;
  }
}

export function isTimeSlotAvailable(
  startTime: Date, 
  endTime: Date, 
  existingEvents: { startTime: Date, endTime: Date }[]
): boolean {
  for (const event of existingEvents) {
    // Check if the proposed time slot overlaps with any existing event
    if (
      (startTime >= event.startTime && startTime < event.endTime) ||
      (endTime > event.startTime && endTime <= event.endTime) ||
      (startTime <= event.startTime && endTime >= event.endTime)
    ) {
      return false;
    }
  }
  return true;
}

export function generateAvailableTimeSlots(
  date: Date,
  daysOfWeek: number[],
  startTimeStr: string,
  endTimeStr: string,
  duration: number,
  existingEvents: { startTime: Date, endTime: Date }[]
): Date[] {
  const dayOfWeek = date.getDay();
  // Convert Sunday (0) to 7 for easier comparison with our daysOfWeek array (1-7)
  const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  
  // If the day is not in the available days, return empty array
  if (!daysOfWeek.includes(adjustedDayOfWeek)) {
    return [];
  }

  const [startHour, startMinute] = startTimeStr.split(':').map(Number);
  const [endHour, endMinute] = endTimeStr.split(':').map(Number);

  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  const slots: Date[] = [];
  const slotDuration = duration; // in minutes
  const currentSlot = new Date(startTime);

  while (currentSlot.getTime() + slotDuration * 60 * 1000 <= endTime.getTime()) {
    const slotEnd = new Date(currentSlot.getTime() + slotDuration * 60 * 1000);
    
    if (isTimeSlotAvailable(currentSlot, slotEnd, existingEvents)) {
      slots.push(new Date(currentSlot));
    }
    
    // Move to next slot
    currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
  }

  return slots;
}
