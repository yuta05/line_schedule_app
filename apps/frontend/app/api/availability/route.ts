import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  if (!startTime || !endTime) {
    return NextResponse.json({ error: 'startTime and endTime are required' }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const events: Array<{ title: string; startTime: string; endTime: string }> = [];

  // モック: 平日の 10:00-17:00 を営業日として返す（他イベントなし）
  const dayMs = 24 * 60 * 60 * 1000;
  for (let t = start.getTime(); t < end.getTime(); t += dayMs) {
    const d = new Date(t);
    const dow = d.getDay();
    if (dow === 0) continue; // 日曜は休み
    const open = new Date(d); open.setHours(10, 0, 0, 0);
    const close = new Date(d); close.setHours(17, 0, 0, 0);
    events.push({ title: '営業日', startTime: open.toISOString(), endTime: close.toISOString() });
  }

  return NextResponse.json(events);
}


