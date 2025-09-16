/**
 * Calendar utility functions for generating ICS files and calendar URLs
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: Date;
  endAt?: Date;
  location?: string;
  url?: string;
}

/**
 * Generate ICS (iCalendar) content for an event
 */
export const generateICS = (event: CalendarEvent): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startDate = formatDate(event.startAt);
  const endDate = event.endAt ? formatDate(event.endAt) : startDate;
  
  const description = event.description || '';
  const location = event.location || '';
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kocky's Bar & Grill//Event Calendar//EN
BEGIN:VEVENT
UID:${event.id}@kockys.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
STATUS:CONFIRMED
${event.url ? `URL:${event.url}` : ''}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGoogle(event.startAt)}/${formatDateForGoogle(event.endAt || event.startAt)}`,
    details: event.description || '',
    location: event.location || ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Apple Calendar URL (opens in Calendar app)
 */
export const generateAppleCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    title: event.title,
    start: event.startAt.toISOString(),
    end: (event.endAt || event.startAt).toISOString(),
    description: event.description || '',
    location: event.location || ''
  });
  
  return `webcal://calendar.google.com/calendar/event?${params.toString()}`;
};

/**
 * Generate Outlook Calendar URL
 */
export const generateOutlookCalendarUrl = (event: CalendarEvent): string => {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startAt.toISOString(),
    enddt: (event.endAt || event.startAt).toISOString(),
    body: event.description || '',
    location: event.location || ''
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Format date for Google Calendar (YYYYMMDDTHHMMSSZ)
 */
const formatDateForGoogle = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Get all calendar URLs for an event
 */
export const getCalendarUrls = (event: CalendarEvent) => {
  return {
    google: generateGoogleCalendarUrl(event),
    apple: generateAppleCalendarUrl(event),
    outlook: generateOutlookCalendarUrl(event),
    ics: generateICS(event)
  };
};













