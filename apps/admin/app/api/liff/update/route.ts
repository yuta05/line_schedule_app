import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, environment, url } = body as { tenantId: string; environment: 'dev' | 'prod'; url: string };
    if (!tenantId || !environment || !url) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    // Resolve LIFF ID and channel token from env by tenant prefix (example: SAMPLE_STORE_LIFF_ID_PROD)
    const prefix = tenantId.toUpperCase().replace(/-/g, '_');
    const liffKey = `${prefix}_LIFF_ID_${environment.toUpperCase()}`;
    const tokenKey = `${prefix}_LINE_CHANNEL_TOKEN_${environment.toUpperCase()}`;
    const liffId = (process.env as any)[liffKey] as string | undefined;
    const lineToken = (process.env as any)[tokenKey] as string | undefined;
    if (!liffId || !lineToken) return NextResponse.json({ error: 'missing env' }, { status: 500 });

    const apiUrl = `https://api.line.me/liff/v1/apps/${liffId}/view`;
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${lineToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'tall', url })
    });
    if (!res.ok) return NextResponse.json({ error: 'liff_update_failed', detail: await res.text() }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


