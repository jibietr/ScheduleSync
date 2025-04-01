import { Booking, MeetingTemplate, User } from '@shared/schema';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  // In a real implementation, this would use a library like nodemailer
  // For this demo, we'll simply log the email content
  console.log('Sending email:');
  console.log('To:', emailData.to);
  console.log('Subject:', emailData.subject);
  console.log('Body:', emailData.body);
  
  // Return true to simulate successful sending
  return true;
}

export function generateBookingConfirmationEmail(
  booking: Booking,
  template: MeetingTemplate,
  host: User
): EmailData[] {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const startDate = booking.startTime.toLocaleDateString('en-US', dateOptions);
  const startTime = booking.startTime.toLocaleTimeString('en-US', timeOptions);
  const endTime = booking.endTime.toLocaleTimeString('en-US', timeOptions);
  
  // Email to the invitee
  const inviteeEmail: EmailData = {
    to: booking.inviteeEmail,
    subject: `Confirmed: ${template.name} with ${host.firstName} ${host.lastName}`,
    body: `
      Hello ${booking.inviteeName},
      
      Your meeting has been confirmed.
      
      Meeting Details:
      - Type: ${template.name}
      - Date: ${startDate}
      - Time: ${startTime} - ${endTime} (${booking.timezone})
      - Location: ${getLocationText(template.location)}
      
      If you need to reschedule or cancel, please use the link below:
      [Manage Booking Link]
      
      Thank you,
      ${host.firstName} ${host.lastName}
    `
  };
  
  // Email to the host
  const hostEmail: EmailData = {
    to: host.email,
    subject: `New Booking: ${template.name} with ${booking.inviteeName}`,
    body: `
      Hello ${host.firstName},
      
      You have a new meeting scheduled.
      
      Meeting Details:
      - Type: ${template.name}
      - With: ${booking.inviteeName} (${booking.inviteeEmail})
      - Date: ${startDate}
      - Time: ${startTime} - ${endTime} (${booking.timezone})
      - Location: ${getLocationText(template.location)}
      
      Additional Information: ${booking.additionalInfo || 'None provided'}
      
      You can manage this booking from your dashboard.
      
      Thank you,
      Schedulr
    `
  };
  
  return [inviteeEmail, hostEmail];
}

export function generateCancellationEmail(
  booking: Booking,
  template: MeetingTemplate,
  host: User
): EmailData[] {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const startDate = booking.startTime.toLocaleDateString('en-US', dateOptions);
  const startTime = booking.startTime.toLocaleTimeString('en-US', timeOptions);
  const endTime = booking.endTime.toLocaleTimeString('en-US', timeOptions);
  
  // Email to the invitee
  const inviteeEmail: EmailData = {
    to: booking.inviteeEmail,
    subject: `Cancelled: ${template.name} with ${host.firstName} ${host.lastName}`,
    body: `
      Hello ${booking.inviteeName},
      
      Your meeting has been cancelled.
      
      Cancelled Meeting Details:
      - Type: ${template.name}
      - Date: ${startDate}
      - Time: ${startTime} - ${endTime} (${booking.timezone})
      
      If you would like to schedule another meeting, please use the booking link:
      [Booking Link]
      
      Thank you,
      ${host.firstName} ${host.lastName}
    `
  };
  
  // Email to the host
  const hostEmail: EmailData = {
    to: host.email,
    subject: `Cancelled Booking: ${template.name} with ${booking.inviteeName}`,
    body: `
      Hello ${host.firstName},
      
      A meeting has been cancelled.
      
      Cancelled Meeting Details:
      - Type: ${template.name}
      - With: ${booking.inviteeName} (${booking.inviteeEmail})
      - Date: ${startDate}
      - Time: ${startTime} - ${endTime} (${booking.timezone})
      
      You can view your updated schedule on your dashboard.
      
      Thank you,
      Schedulr
    `
  };
  
  return [inviteeEmail, hostEmail];
}

function getLocationText(location: string): string {
  switch (location) {
    case 'zoom':
      return 'Zoom Video Call (link will be provided)';
    case 'google-meet':
      return 'Google Meet (link will be provided)';
    case 'ms-teams':
      return 'Microsoft Teams (link will be provided)';
    case 'phone':
      return 'Phone Call';
    default:
      return location;
  }
}
