import { NextResponse } from 'next/server';

const KEYS = [
  'LIFF_ID',
  'LINE_CHANNEL_TOKEN',
  'CALENDAR_ID',
  'GAS_AVAILABILITY_URL',
  'GAS_RESERVATION_URL',
  'GAS_REMINDER_URL',
  'GAS_ADMIN_TOKEN',
];

function collect(prefix: string, envTag: 'DEV' | 'PROD') {
  const out: Record<string, { key: string; present: boolean; value?: string; redacted?: boolean }> = {};
  for (const base of KEYS) {
    const key = `${prefix}_${base}_${envTag}`;
    const raw = (process.env as any)[key] as string | undefined;
    const present = Boolean(raw);
    const isUrl = base.endsWith('_URL');
    const isId = base.endsWith('_ID');
    const isCalendar = base === 'CALENDAR_ID';
    const isToken = base.includes('TOKEN');
    out[base] = {
      key,
      present,
      value: present && (isUrl || isId || isCalendar) ? raw : undefined,
      redacted: present && isToken ? true : undefined,
    };
  }
  return out;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = params.id;
    const prefix = tenantId.toUpperCase().replace(/-/g, '_');
    const dev = collect(prefix, 'DEV');
    const prod = collect(prefix, 'PROD');
    return NextResponse.json({ tenantId, dev, prod });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


