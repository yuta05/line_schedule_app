import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const app = body.app as 'availability' | 'reservation' | 'reminder';
    const environment = body.environment as 'dev' | 'prod';
    const tenantId = body.tenantId as string | undefined;
    
    console.log('Deploy request:', { app, environment, tenantId });
    
    if (!app || !environment) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    const token = process.env.GH_TOKEN_FOR_DISPATCH;
    const repo = process.env.GH_REPOSITORY || process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;
    
    console.log('Environment:', { hasToken: !!token, repo });
    
    if (!token || !repo) return NextResponse.json({ 
      error: 'missing server env',
      debug: { hasToken: !!token, repo: repo || 'missing' }
    }, { status: 500 });

    // Use repository_dispatch instead of workflow_dispatch
    const url = `https://api.github.com/repos/${repo}/dispatches`;
    
    console.log('Dispatching to:', url);
    
    const payload = {
      event_type: 'deploy-gas',
      client_payload: {
        app,
        environment,
        tenantId: tenantId || 'sample-store'
      }
    };
    
    console.log('Payload:', payload);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'line-schedule-app'
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error('Dispatch failed:', res.status, text);
      return NextResponse.json({ 
        error: 'dispatch_failed', 
        detail: text,
        url,
        status: res.status
      }, { status: 500 });
    }
    
    console.log('Dispatch successful');
    return NextResponse.json({ ok: true, message: 'Workflow triggered successfully' });
  } catch (e: any) {
    console.error('Deploy error:', e);
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


