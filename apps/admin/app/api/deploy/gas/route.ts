import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const app = body.app as 'availability' | 'reservation' | 'reminder';
    const environment = body.environment as 'dev' | 'prod';
    const tenantId = body.tenantId as string | undefined;
    if (!app || !environment) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    const token = process.env.GH_TOKEN_FOR_DISPATCH;
    const repo = process.env.GH_REPOSITORY || process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;
    if (!token || !repo) return NextResponse.json({ error: 'missing server env' }, { status: 500 });

    const url = `https://api.github.com/repos/${repo}/actions/workflows/gas_deploy.yml/dispatches`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { app, environment, tenant: tenantId || 'default' }
      })
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'dispatch_failed', detail: text }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


