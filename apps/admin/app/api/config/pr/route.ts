import { NextResponse } from 'next/server';

type RequestBody = {
  tenantId: string;
  path: string;            // repo-root relative path e.g. packages/config/tenants/{tenantId}/menu.json
  content: string;         // raw text content
  message?: string;        // commit message
  base?: 'dev' | 'main';   // base branch
};

async function github(api: string, method: string, token: string, body?: any) {
  const res = await fetch(`https://api.github.com${api}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export async function POST(req: Request) {
  try {
    const { tenantId, path, content, message, base }: RequestBody = await req.json();
    if (!tenantId || !path || typeof content !== 'string') {
      return NextResponse.json({ error: 'bad request' }, { status: 400 });
    }

    const token = process.env.GH_TOKEN_FOR_DISPATCH;
    const repo = process.env.GH_REPOSITORY || process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;
    if (!token || !repo) return NextResponse.json({ error: 'missing server env' }, { status: 500 });

    const [owner, repoName] = repo.split('/');
    const baseBranch = base || 'dev';
    const branch = `config-update/${tenantId}/${Date.now()}`;

    // 1) get base ref
    let res = await github(`/repos/${owner}/${repoName}/git/ref/heads/${baseBranch}`, 'GET', token);
    if (!res.ok) return NextResponse.json({ error: 'get_base_ref_failed', detail: await res.text() }, { status: 500 });
    const baseRef = await res.json();
    const baseSha = baseRef.object.sha as string;

    // 2) create new ref
    res = await github(`/repos/${owner}/${repoName}/git/refs`, 'POST', token, { ref: `refs/heads/${branch}`, sha: baseSha });
    if (!res.ok) return NextResponse.json({ error: 'create_ref_failed', detail: await res.text() }, { status: 500 });

    // 3) get current file to see if exists (to include sha on update)
    let currentSha: string | undefined;
    const getContent = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${branch}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
    });
    if (getContent.ok) {
      const fileJson = await getContent.json();
      currentSha = fileJson.sha;
    }

    // 4) put file content
    const b64 = Buffer.from(content, 'utf8').toString('base64');
    res = await github(`/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}`, 'PUT', token, {
      message: message || `chore: update ${path} for ${tenantId}`,
      content: b64,
      branch,
      sha: currentSha,
    });
    if (!res.ok) return NextResponse.json({ error: 'put_content_failed', detail: await res.text() }, { status: 500 });

    // 5) create PR
    res = await github(`/repos/${owner}/${repoName}/pulls`, 'POST', token, {
      title: `[admin] ${tenantId}: update ${path}`,
      head: branch,
      base: baseBranch,
      body: `Automated update for tenant ${tenantId}`,
    });
    if (!res.ok) return NextResponse.json({ error: 'create_pr_failed', detail: await res.text() }, { status: 500 });
    const pr = await res.json();
    return NextResponse.json({ ok: true, pr });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


