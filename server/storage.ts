import { 
  users, type User, type InsertUser,
  meetingTemplates, type MeetingTemplate, type InsertMeetingTemplate, 
  bookings, type Booking, type InsertBooking,
  calendarEvents, type CalendarEvent, type InsertCalendarEvent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Meeting Template operations
  getMeetingTemplate(id: number): Promise<MeetingTemplate | undefined>;
  getMeetingTemplateBySlug(username: string, slug: string): Promise<MeetingTemplate | undefined>;
  getMeetingTemplatesByUserId(userId: number): Promise<MeetingTemplate[]>;
  createMeetingTemplate(template: InsertMeetingTemplate): Promise<MeetingTemplate>;
  updateMeetingTemplate(id: number, data: Partial<InsertMeetingTemplate>): Promise<MeetingTemplate | undefined>;
  deleteMeetingTemplate(id: number): Promise<boolean>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByTemplateId(templateId: number): Promise<Booking[]>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Calendar Event operations
  getCalendarEvents(userId: number, startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  deleteCalendarEventsByUserId(userId: number): Promise<number>;
  getUpcomingBookings(userId: number): Promise<Booking[]>;
  getPastBookings(userId: number): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetingTemplates: Map<number, MeetingTemplate>;
  private bookings: Map<number, Booking>;
  private calendarEvents: Map<number, CalendarEvent>;
  private currentUserId: number;
  private currentTemplateId: number;
  private currentBookingId: number;
  private currentEventId: number;

  constructor() {
    this.users = new Map();
    this.meetingTemplates = new Map();
    this.bookings = new Map();
    this.calendarEvents = new Map();
    this.currentUserId = 1;
    this.currentTemplateId = 1;
    this.currentBookingId = 1;
    this.currentEventId = 1;

    // Create a default user for demo purposes
    this.createUser({
      username: "janesmith",
      password: "password", // In a real app, this would be hashed
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      timezone: "Europe/Paris",
      calendarUrl: null, // No default calendar URL, will be set by the user
      autoSync: true
    });

    // Create a default meeting template
    this.createMeetingTemplate({
      userId: 1,
      name: "30 Minute Meeting",
      slug: "30min",
      description: "Let's discuss how I can help with your project or answer any questions you might have.",
      duration: 30,
      location: "zoom",
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: "09:00", // 9 AM
      endTime: "17:00",   // 5 PM
      bufferBefore: 0,
      bufferAfter: 0,
      collectName: true,
      collectEmail: true,
      collectPhone: false,
      notifyOnBooking: true,
      notifyCancellation: true,
      notifyReminder: true,
      isDefault: true
    });

    // We're not adding any sample bookings as requested
    
    // We're not adding any sample calendar events either as they should come from the user's actual calendar

    // Additional templates
    this.createMeetingTemplate({
      userId: 1,
      name: "Client Onboarding",
      slug: "onboarding",
      description: "Initial client onboarding session to understand your needs.",
      duration: 45,
      location: "zoom",
      daysOfWeek: [2, 4], // Tuesday and Thursday
      startTime: "10:00", // 10 AM
      endTime: "16:00",   // 4 PM
      bufferBefore: 5,
      bufferAfter: 5,
      collectName: true,
      collectEmail: true,
      collectPhone: true,
      notifyOnBooking: true,
      notifyCancellation: true,
      notifyReminder: true,
      isDefault: false
    });

    this.createMeetingTemplate({
      userId: 1,
      name: "Coffee Chat",
      slug: "coffee",
      description: "Quick chat over virtual coffee.",
      duration: 15,
      location: "zoom",
      daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
      startTime: "09:00", // 9 AM
      endTime: "10:00",   // 10 AM
      bufferBefore: 0,
      bufferAfter: 0,
      collectName: true,
      collectEmail: true,
      collectPhone: false,
      notifyOnBooking: true,
      notifyCancellation: true,
      notifyReminder: false,
      isDefault: false
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Meeting Template operations
  async getMeetingTemplate(id: number): Promise<MeetingTemplate | undefined> {
    return this.meetingTemplates.get(id);
  }

  async getMeetingTemplateBySlug(username: string, slug: string): Promise<MeetingTemplate | undefined> {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    return Array.from(this.meetingTemplates.values()).find(
      (template) => template.userId === user.id && template.slug === slug,
    );
  }

  async getMeetingTemplatesByUserId(userId: number): Promise<MeetingTemplate[]> {
    return Array.from(this.meetingTemplates.values()).filter(
      (template) => template.userId === userId,
    );
  }

  async createMeetingTemplate(template: InsertMeetingTemplate): Promise<MeetingTemplate> {
    const id = this.currentTemplateId++;
    const now = new Date();
    const newTemplate: MeetingTemplate = { ...template, id, createdAt: now };
    this.meetingTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async updateMeetingTemplate(id: number, data: Partial<InsertMeetingTemplate>): Promise<MeetingTemplate | undefined> {
    const template = this.meetingTemplates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = { ...template, ...data };
    this.meetingTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteMeetingTemplate(id: number): Promise<boolean> {
    return this.meetingTemplates.delete(id);
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByTemplateId(templateId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.templateId === templateId,
    );
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    const templates = await this.getMeetingTemplatesByUserId(userId);
    const templateIds = templates.map(t => t.id);
    
    return Array.from(this.bookings.values()).filter(
      (booking) => templateIds.includes(booking.templateId),
    );
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const newBooking: Booking = { ...booking, id, createdAt: now };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Calendar Event operations
  async getCalendarEvents(userId: number, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values()).filter(
      (event) => {
        return event.userId === userId &&
               event.startTime >= startDate &&
               event.endTime <= endDate;
      }
    );
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.currentEventId++;
    const now = new Date();
    const newEvent: CalendarEvent = { ...event, id, createdAt: now, lastSynced: now };
    this.calendarEvents.set(id, newEvent);
    return newEvent;
  }

  async deleteCalendarEventsByUserId(userId: number): Promise<number> {
    let count = 0;
    for (const [id, event] of this.calendarEvents.entries()) {
      if (event.userId === userId) {
        this.calendarEvents.delete(id);
        count++;
      }
    }
    return count;
  }

  // Additional helper methods
  async getUpcomingBookings(userId: number): Promise<Booking[]> {
    const allBookings = await this.getBookingsByUserId(userId);
    const now = new Date();
    
    return allBookings.filter(booking => 
      booking.startTime > now && booking.status === "confirmed"
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  async getPastBookings(userId: number): Promise<Booking[]> {
    const allBookings = await this.getBookingsByUserId(userId);
    const now = new Date();
    
    return allBookings.filter(booking => 
      booking.startTime <= now || booking.status === "completed"
    ).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }
}

export const storage = new MemStorage();
