// Calendar event generator for Google Calendar links and iCalendar (.ics) downloads

export function generateGoogleCalendarUrl(options: {
  title: string;
  details: string;
  location?: string;
  timeString: string; // HH:mm
  recurrence?: 'DAILY' | 'MONTHLY' | '3_MONTHS';
  specificDate?: string; // YYYY-MM-DD (optional, if omitted uses today)
}): string {
  const { title, details, location = 'Rumah', timeString, recurrence, specificDate } = options;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const baseDate = specificDate ? new Date(specificDate + 'T00:00:00') : new Date();
  baseDate.setHours(hours || 8, minutes || 0, 0, 0);

  const endDate = new Date(baseDate.getTime() + 15 * 60 * 1000); // 15 mins

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const datesParam = `${formatGCalDate(baseDate)}/${formatGCalDate(endDate)}`;

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', title);
  url.searchParams.set('details', details);
  url.searchParams.set('location', location);
  url.searchParams.set('dates', datesParam);

  if (recurrence === 'DAILY') {
    url.searchParams.set('recur', 'RRULE:FREQ=DAILY');
  } else if (recurrence === 'MONTHLY') {
    url.searchParams.set('recur', 'RRULE:FREQ=MONTHLY');
  } else if (recurrence === '3_MONTHS') {
    url.searchParams.set('recur', 'RRULE:FREQ=MONTHLY;INTERVAL=3');
  }

  return url.toString();
}

export function downloadICSFile(filename: string, events: Array<{
  title: string;
  description: string;
  startDate: Date;
  durationMinutes?: number;
  recurrenceRule?: string; // e.g. "RRULE:FREQ=DAILY"
}>) {
  const formatICSDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nyunyu Cat Care//Jadwal Makan & Medis//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach((ev, i) => {
    const startStr = formatICSDate(ev.startDate);
    const endDate = new Date(ev.startDate.getTime() + (ev.durationMinutes || 15) * 60 * 1000);
    const endStr = formatICSDate(endDate);

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:nyunyu-${Date.now()}-${i}@petcare.local`);
    icsContent.push(`DTSTAMP:${formatICSDate(new Date())}`);
    icsContent.push(`DTSTART:${startStr}`);
    icsContent.push(`DTEND:${endStr}`);
    icsContent.push(`SUMMARY:${ev.title.replace(/\n/g, ' ')}`);
    icsContent.push(`DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`);
    if (ev.recurrenceRule) {
      icsContent.push(ev.recurrenceRule);
    }
    icsContent.push('STATUS:CONFIRMED');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
