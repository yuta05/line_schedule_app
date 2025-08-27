import { NextResponse } from 'next/server';

async function checkUrl(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const started = Date.now();
  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);
    return {
      ok: res.ok,
      status: res.status,
      headers: {
        'last-modified': res.headers.get('last-modified') || undefined,
        'date': res.headers.get('date') || undefined,
        'server': res.headers.get('server') || undefined,
      },
      ms: Date.now() - started,
    };
  } catch (e: any) {
    clearTimeout(timer);
    return { ok: false, error: e?.message || 'fetch error', ms: Date.now() - started };
  }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = params.id;
    const prefix = tenantId.toUpperCase().replace(/-/g, '_');
    const buildKey = (base: string, env: 'DEV' | 'PROD') => `${prefix}_${base}_${env}`;

    const targets: Array<{ env: 'DEV' | 'PROD'; kind: string; key: string; url?: string }> = [];
    const bases = ['GAS_AVAILABILITY_URL', 'GAS_RESERVATION_URL', 'GAS_REMINDER_URL', 'FRONTEND_URL'];
    for (const env of ['DEV', 'PROD'] as const) {
      for (const base of bases) {
        const key = buildKey(base, env);
        const url = (process.env as any)[key] as string | undefined;
        targets.push({ env, kind: base, key, url });
      }
    }

    const results = await Promise.all(
      targets.map(async t => ({ ...t, check: t.url ? await checkUrl(t.url) : { ok: false, error: 'missing url' } }))
    );

    return NextResponse.json({ tenantId, checkedAt: new Date().toISOString(), results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


