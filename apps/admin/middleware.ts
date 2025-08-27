import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function inAllowlist(req: NextRequest): boolean {
  const allow = (process.env.ADMIN_IP_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allow.length === 0) return true; // no restriction
  const fwdFor = req.headers.get('x-forwarded-for') || '';
  const ip = fwdFor.split(',')[0].trim();
  return allow.includes(ip);
}

function basicAuthOk(req: NextRequest): boolean {
  const user = process.env.ADMIN_BASIC_USER || '';
  const pass = process.env.ADMIN_BASIC_PASS || '';
  if (!user || !pass) return true; // disabled
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;
  const b64 = auth.replace('Basic ', '');
  const [u, p] = Buffer.from(b64, 'base64').toString('utf8').split(':');
  return u === user && p === pass;
}

export function middleware(req: NextRequest) {
  // Allow Next assets and health
  const { pathname } = new URL(req.url);
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/api/health')) {
    return NextResponse.next();
  }

  if (!inAllowlist(req)) {
    return new NextResponse('Forbidden (IP)', { status: 403 });
  }
  if (!basicAuthOk(req)) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="admin"' }
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/health).*)'],
};


