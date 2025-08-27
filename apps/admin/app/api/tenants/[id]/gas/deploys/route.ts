import { NextResponse } from 'next/server';

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const pk = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!email || !pk) throw new Error('missing google service account env');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/script.projects',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const base64url = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const toSign = `${base64url(header)}.${base64url(payload)}`;
  const signer = await import('node:crypto');
  const sign = signer.createSign('RSA-SHA256');
  sign.update(toSign);
  const signature = sign.sign(pk, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const jwt = `${toSign}.${signature}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) as any,
  });
  if (!res.ok) throw new Error(`token_error: ${await res.text()}`);
  const j = await res.json();
  return j.access_token as string;
}

async function listDeployments(scriptId: string, token: string) {
  const url = `https://script.googleapis.com/v1/projects/${encodeURIComponent(scriptId)}/deployments`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return { error: await res.text() };
  const j = await res.json();
  return j;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = params.id;
    const search = new URL(req.url).searchParams;
    const env = (search.get('env') || 'both').toLowerCase(); // 'dev' | 'prod' | 'both'
    const prefix = tenantId.toUpperCase().replace(/-/g, '_');
    const envs: Array<'DEV' | 'PROD'> = env === 'both' ? ['DEV', 'PROD'] : [env.toUpperCase() as 'DEV' | 'PROD'];
    const token = await getAccessToken();
    const apps = ['AVAILABILITY', 'RESERVATION', 'REMINDER'] as const;
    const out: any[] = [];
    for (const e of envs) {
      for (const app of apps) {
        const key = `${prefix}_GAS_${app}_SCRIPT_ID_${e}`;
        const scriptId = (process.env as any)[key] as string | undefined;
        if (!scriptId) { out.push({ env: e, app, key, error: 'missing scriptId' }); continue; }
        const deployments = await listDeployments(scriptId, token);
        out.push({ env: e, app, key, scriptId, deployments });
      }
    }
    return NextResponse.json({ tenantId, fetchedAt: new Date().toISOString(), items: out });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


