import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const tenantId = params.id;
    const root = process.cwd();
    const base = path.join(root, 'packages', 'config', 'tenants', tenantId);
    const readJson = async (p: string) => JSON.parse(await fs.readFile(p, 'utf8'));
    const mapping = await readJson(path.join(base, 'mapping.json')).catch(() => null);
    const menu = await readJson(path.join(base, 'menu.json')).catch(() => null);
    const rules = await readJson(path.join(base, 'rules.json')).catch(() => null);
    const ui = await readJson(path.join(base, 'ui.json')).catch(() => null);
    if (!mapping) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ tenantId, mapping, menu, rules, ui });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


