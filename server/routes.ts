import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { syncCalendarEvents, generateAvailableTimeSlots, fetchCalendarEvents } from "./utils/calendar";
import { sendEmail, generateBookingConfirmationEmail, generateCancellationEmail } from "./utils/email";
import { z } from "zod";
import { insertMeetingTemplateSchema, insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await storage.getUser(Number(id));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.get("/api/user/username/:username", async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.put("/api/user/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;
    const userId = Number(id);
    
    const oldUser = await storage.getUser(userId);
    if (!oldUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update the user
    const user = await storage.updateUser(userId, userData);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // If calendar URL has changed and is not empty, trigger a sync automatically
    if (userData.calendarUrl && userData.calendarUrl !== oldUser.calendarUrl) {
      try {
        await syncCalendarEvents(user);
      } catch (error) {
        console.error("Error syncing calendar after URL update:", error);
        // Continue with the response even if sync fails
      }
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Calendar sync
  app.post("/api/user/:id/sync-calendar", async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await storage.getUser(Number(id));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (!user.calendarUrl) {
      return res.status(400).json({ message: "No calendar URL provided" });
    }
    
    try {
      const count = await syncCalendarEvents(user);
      res.json({ message: `Successfully synced ${count} events`, syncedAt: new Date() });
    } catch (error) {
      res.status(500).json({ message: "Failed to sync calendar events" });
    }
  });

  // Test ics URL
  app.post("/api/test-ics-url", async (req: Request, res: Response) => {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: "No URL provided" });
    }
    
    try {
      const events = await fetchCalendarEvents(url);
      res.json({ 
        success: true, 
        message: `Successfully fetched ${events.length} events`, 
        count: events.length 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        message: "Failed to fetch calendar events. Please check the URL and try again."
      });
    }
  });

  // Meeting Templates
  app.get("/api/templates", async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const templates = await storage.getMeetingTemplatesByUserId(userId);
    res.json(templates);
  });

  app.get("/api/templates/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await storage.getMeetingTemplate(Number(id));
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  });

  app.get("/api/:username/:slug", async (req: Request, res: Response) => {
    const { username, slug } = req.params;
    const template = await storage.getMeetingTemplateBySlug(username, slug);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    const user = await storage.getUser(template.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      template,
      user: userWithoutPassword
    });
  });

  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertMeetingTemplateSchema.parse(req.body);
      const template = await storage.createMeetingTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const templateData = req.body;
    
    const template = await storage.updateMeetingTemplate(Number(id), templateData);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  });

  app.delete("/api/templates/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const success = await storage.deleteMeetingTemplate(Number(id));
    
    if (!success) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json({ message: "Template deleted successfully" });
  });

  // Available Slots
  app.get("/api/available-slots", async (req: Request, res: Response) => {
    const { username, slug, date, timezone } = req.query;
    
    if (!username || !slug || !date) {
      return res.status(400).json({ message: "Username, slug, and date are required" });
    }
    
    const template = await storage.getMeetingTemplateBySlug(username as string, slug as string);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    const selectedDate = new Date(date as string);
    
    // Get all bookings for this template
    const bookings = await storage.getBookingsByTemplateId(template.id);
    
    // Get all calendar events for this user for the selected date
    const user = await storage.getUser(template.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const calendarEvents = await storage.getCalendarEvents(user.id, dayStart, dayEnd);
    
    // Combine bookings and calendar events as busy times
    const busyTimes = [
      ...bookings.filter(b => b.status !== "cancelled").map(b => ({
        startTime: b.startTime,
        endTime: b.endTime
      })),
      ...calendarEvents.map(e => ({
        startTime: e.startTime,
        endTime: e.endTime
      }))
    ];
    
    // Generate available time slots
    const availableSlots = generateAvailableTimeSlots(
      selectedDate,
      template.daysOfWeek,
      template.startTime,
      template.endTime,
      template.duration,
      busyTimes
    );
    
    res.json(availableSlots);
  });

  // Bookings
  app.get("/api/bookings", async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const upcoming = await storage.getUpcomingBookings(userId);
    const past = await storage.getPastBookings(userId);
    
    res.json({ upcoming, past });
  });
  
  // Calendar Events
  app.get("/api/calendar-events", async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Get all calendar events for the next 30 days
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    
    const events = await storage.getCalendarEvents(userId, startDate, endDate);
    
    res.json(events);
  });
  
  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const booking = await storage.getBooking(Number(id));
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  });
  
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      
      // Get template and user for email notifications
      const template = await storage.getMeetingTemplate(booking.templateId);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const user = await storage.getUser(template.userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Send confirmation emails
      if (template.notifyOnBooking) {
        const emails = generateBookingConfirmationEmail(booking, template, user);
        for (const email of emails) {
          await sendEmail(email);
        }
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });
  
  app.put("/api/bookings/:id/status", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !["confirmed", "cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const booking = await storage.updateBookingStatus(Number(id), status);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // If the booking was cancelled, send cancellation emails
    if (status === "cancelled") {
      const template = await storage.getMeetingTemplate(booking.templateId);
      
      if (template && template.notifyCancellation) {
        const user = await storage.getUser(template.userId);
        
        if (user) {
          const emails = generateCancellationEmail(booking, template, user);
          for (const email of emails) {
            await sendEmail(email);
          }
        }
      }
    }
    
    res.json(booking);
  });

  const httpServer = createServer(app);
  return httpServer;
}
