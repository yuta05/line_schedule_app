// Reminder GAS minimal scheduled sender (stub)

function sendReminderMessages() {
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN') || '';
  const CALENDAR_ID = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID') || '';
  if (!CHANNEL_ACCESS_TOKEN || !CALENDAR_ID) return;

  const cal = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!cal) return;

  // 翌日の 00:00〜23:59 範囲
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);

  const events = cal.getEvents(start, end) || [];
  events.forEach(ev => {
    const userId = ev.getLocation();
    if (!userId) return;
    const dateStr = Utilities.formatDate(ev.getStartTime(), 'Asia/Tokyo', 'yyyy年MM月dd日 HH:mm');
    const text = `【ご予約前日リマインド】\n${dateStr}\n${ev.getTitle()}`;
    pushMessage(CHANNEL_ACCESS_TOKEN, userId, text);
  });
}

function doPost(e: GoogleAppsScript.Events.DoPost): GoogleAppsScript.Content.TextOutput {
  try {
    const ADMIN_TOKEN = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (!body || body.adminToken !== ADMIN_TOKEN) return json({ ok: false, error: 'unauthorized' });
    const props = body.properties as Record<string, string> | undefined;
    if (!props) return json({ ok: false, error: 'missing properties' });
    PropertiesService.getScriptProperties().setProperties(props, true);
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'error' });
  }
}

function json(obj: unknown): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function pushMessage(token: string, userId: string, text: string) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = { to: userId, messages: [{ type: 'text', text }] };
  const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  UrlFetchApp.fetch(url, params);
}


