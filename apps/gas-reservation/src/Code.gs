// Reservation GAS minimal webhook (reply stub)

function doPost(e) {
  const CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('CHANNEL_ACCESS_TOKEN') || '';
  const CALENDAR_ID = PropertiesService.getScriptProperties().getProperty('CALENDAR_ID') || '';
  if (!CHANNEL_ACCESS_TOKEN || !CALENDAR_ID) return json({ ok: false, error: 'Missing properties' });

  try {
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;
    if (!body || !body.events || !Array.isArray(body.events)) return json({ ok: false });

    // 最小: 「予約確認」→固定返信（後で本実装に差し替え）
    body.events.forEach((ev) => {
      if (ev.type === 'message' && ev.message?.type === 'text') {
        const text = ev.message.text || '';
        if (text.includes('予約確認')) {
          pushMessage(CHANNEL_ACCESS_TOKEN, ev.source.userId, '現在の予約はありません（デモ）');
        }
      }
    });
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: 'Unexpected error' });
  }
}

// Admin endpoint to set Script Properties
function setProperties(e) {
  try {
    const ADMIN_TOKEN = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    if (!body || body.adminToken !== ADMIN_TOKEN) return json({ ok: false, error: 'unauthorized' });
    const props = body.properties;
    if (!props) return json({ ok: false, error: 'missing properties' });
    PropertiesService.getScriptProperties().setProperties(props, true);
    return json({ ok: true });
  } catch {
    return json({ ok: false, error: 'error' });
  }
}

function pushMessage(token, userId, text) {
  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: userId,
    messages: [{ type: 'text', text }]
  };
  const params = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };
  UrlFetchApp.fetch(url, params);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}


