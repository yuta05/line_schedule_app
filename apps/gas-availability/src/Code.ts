// Availability GAS (TS minimal)

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  try {
    const calendarId = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID') || '';
    if (!calendarId) return errorJson('Missing CALENDAR_ID');

    if (!e || !e.parameter) return errorJson('No parameters provided.');
    const { startTime, endTime } = e.parameter as { startTime?: string; endTime?: string };
    if (!startTime || !endTime) return errorJson('Missing startTime or endTime parameter.');
    if (!isISO(startTime) || !isISO(endTime)) return errorJson('Invalid date format.');

    const timeZone = getTimeZone('Asia/Tokyo');
    const start = toZone(startTime, timeZone);
    const end = toZone(endTime, timeZone);

    const cal = CalendarApp.getCalendarById(calendarId);
    if (!cal) return errorJson('Calendar not found.');

    const events = cal.getEvents(start, end) || [];
    const availability = events.map(ev => ({
      title: ev.getTitle() || '',
      startTime: ev.getStartTime().toISOString(),
      endTime: ev.getEndTime().toISOString(),
      location: ev.getLocation() || '',
      description: ev.getDescription() || ''
    }));

    return json(availability);
  } catch (err) {
    return errorJson('Unexpected error.');
  }
}

// Admin: set Script Properties via POST { adminToken, properties }
function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const ADMIN_TOKEN = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (!body || body.adminToken !== ADMIN_TOKEN) return errorJson('unauthorized');
    const props = body.properties as Record<string, string> | undefined;
    if (!props) return errorJson('missing properties');
    const store = PropertiesService.getScriptProperties();
    store.setProperties(props, true);
    return json({ ok: true });
  } catch {
    return errorJson('error');
  }
}

function isISO(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(s);
}

function getTimeZone(defaultTz: string): string {
  try {
    return Session.getScriptTimeZone() || defaultTz;
  } catch {
    return defaultTz;
  }
}

function toZone(iso: string, tz: string): Date {
  return new Date(new Date(iso).toLocaleString('en-US', { timeZone: tz }));
}

function json(obj: unknown): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function errorJson(message: string): GoogleAppsScript.Content.TextOutput {
  return json({ error: message });
}


