import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const root = process.cwd();
    const tenantsDir = path.join(root, 'packages', 'config', 'tenants');
    const entries = await fs.readdir(tenantsDir, { withFileTypes: true });
    const tenants: any[] = [];
    for (const ent of entries) {
      if (ent.isDirectory()) {
        const mp = path.join(tenantsDir, ent.name, 'mapping.json');
        try {
          const txt = await fs.readFile(mp, 'utf8');
          const data = JSON.parse(txt);
          tenants.push({ tenantId: ent.name, displayName: data.displayName || ent.name });
        } catch {}
      }
    }
    return NextResponse.json({ tenants });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


