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
  const { createSign } = await import('node:crypto');
  const sign = createSign('RSA-SHA256');
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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const tenantId = params.id;
    const app = (body.app as string || '').toUpperCase(); // AVAILABILITY|RESERVATION|REMINDER
    const env = (body.env as string || '').toUpperCase(); // DEV|PROD
    const versionNumber = Number(body.versionNumber);
    if (!tenantId || !app || !env || !versionNumber) return NextResponse.json({ error: 'bad request' }, { status: 400 });

    const prefix = tenantId.toUpperCase().replace(/-/g, '_');
    const key = `${prefix}_GAS_${app}_SCRIPT_ID_${env}`;
    const scriptId = (process.env as any)[key] as string | undefined;
    if (!scriptId) return NextResponse.json({ error: `missing ${key}` }, { status: 400 });

    const token = await getAccessToken();
    const url = `https://script.googleapis.com/v1/projects/${encodeURIComponent(scriptId)}/deployments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deploymentConfig: {
          versionNumber,
          manifestFileName: 'appsscript',
          description: `Admin deploy to version ${versionNumber}`
        }
      })
    });
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: 'deploy_failed', detail: text }, { status: 500 });
    return NextResponse.json({ ok: true, detail: JSON.parse(text) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


