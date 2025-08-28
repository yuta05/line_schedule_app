'use client';
import { useEffect, useState } from 'react';

async function triggerGAS(app: 'availability' | 'reservation' | 'reminder', environment: 'dev' | 'prod', tenantId?: string) {
  const res = await fetch('/api/deploy/gas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app, environment, tenantId })
  });
  if (!res.ok) throw new Error('dispatch failed');
  return res.json();
}

export default function Page() {
  const [log, setLog] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [tenantId, setTenantId] = useState<string>('sample-store');
  const [tenants, setTenants] = useState<{ tenantId: string; displayName: string }[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [deploys, setDeploys] = useState<any>(null);
  const [gasDeploys, setGasDeploys] = useState<any>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/tenants');
        const data = await res.json();
        setTenants(data.tenants || []);
      } catch (error) {
        console.error('Failed to load tenants:', error);
        setLog(prev => prev + '\nERR: Failed to load tenants');
      }
    })();
  }, []);

  const refreshDetail = async () => {
    if (!tenantId || loading) return;
    try {
      const res = await fetch(`/api/tenants/${tenantId}`);
      const data = await res.json();
      setDetail(data);
    } catch (error) {
      console.error('Failed to load tenant detail:', error);
      setDetail({ error: 'Failed to load' });
    }
  };
  const refreshStatus = async () => {
    if (!tenantId || loading) return;
    try {
      const res2 = await fetch(`/api/tenants/${tenantId}/status`);
      const data2 = await res2.json();
      setStatus(data2);
    } catch (error) {
      console.error('Failed to load status:', error);
      setStatus({ error: 'Failed to load' });
    }
  };
  const refreshDeploys = async () => {
    if (!tenantId || loading) return;
    try {
      const res3 = await fetch(`/api/tenants/${tenantId}/deploys`);
      const data3 = await res3.json();
      setDeploys(data3);
    } catch (error) {
      console.error('Failed to load deploys:', error);
      setDeploys({ error: 'Failed to load' });
    }
  };
  const refreshGasDeploys = async () => {
    if (!tenantId || loading) return;
    try {
      const res4 = await fetch(`/api/tenants/${tenantId}/gas/deploys`);
      const data4 = await res4.json();
      setGasDeploys(data4);
    } catch (error) {
      console.error('Failed to load gas deploys:', error);
      setGasDeploys({ error: 'Failed to load' });
    }
  };
  useEffect(() => {
    if (!tenantId) return;
    
    // デバウンス処理: テナント変更時の連続実行を防ぐ
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setLog(prev => prev + `\n読み込み開始: ${tenantId}`);
      
      try {
        // 順次実行でリソース負荷を軽減
        await refreshDetail();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await refreshStatus();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await refreshDeploys();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await refreshGasDeploys();
        
        setLog(prev => prev + `\n読み込み完了: ${tenantId}`);
      } catch (error) {
        console.error('Failed to load tenant data:', error);
        setLog(prev => prev + `\nERR: Failed to load ${tenantId}`);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [tenantId]);
  const run = async (app: 'availability' | 'reservation' | 'reminder', env: 'dev' | 'prod') => {
    if (loading) {
      setLog(prev => prev + `\nSKIP: ${app}(${env}) - 読み込み中`);
      return;
    }
    
    setLog(prev => prev + `\nDispatching ${app}(${env})...`);
    try {
      const r = await triggerGAS(app, env, tenantId);
      setLog(prev => prev + `\nOK: ${JSON.stringify(r)}`);
    } catch (e: any) {
      setLog(prev => prev + `\nERR: ${e?.message}`);
    }
  };

  return (
    <main style={{ padding: 16 }}>
      <h1>管理者ページ（デプロイ）</h1>
      
      {loading && (
        <div style={{ padding: 8, background: '#fff3cd', border: '1px solid #ffeaa7', marginBottom: 16 }}>
          読み込み中... リソース負荷軽減のため順次実行しています
        </div>
      )}
      
      <section>
        <h2>GAS デプロイ</h2>
        <div style={{ marginBottom: 8 }}>
          <label>Tenant: </label>
          <select 
            value={tenantId} 
            onChange={e => setTenantId(e.target.value)}
            disabled={loading}
          >
            {tenants.map(t => (
              <option key={t.tenantId} value={t.tenantId}>{t.displayName} ({t.tenantId})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => run('availability', 'dev')} disabled={loading}>availability (dev)</button>
          <button onClick={() => run('availability', 'prod')} disabled={loading}>availability (prod)</button>
          <button onClick={() => run('reservation', 'dev')} disabled={loading}>reservation (dev)</button>
          <button onClick={() => run('reservation', 'prod')} disabled={loading}>reservation (prod)</button>
          <button onClick={() => run('reminder', 'dev')} disabled={loading}>reminder (dev)</button>
          <button onClick={() => run('reminder', 'prod')} disabled={loading}>reminder (prod)</button>
        </div>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>LIFF エンドポイント更新</h2>
        <LIFFUpdatePanel />
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>設定PR作成（テナント別）</h2>
        <ConfigPRPanel />
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>テナント詳細</h2>
        <TenantDetailPanel 
          detail={detail} 
          status={status} 
          deploys={deploys} 
          gasDeploys={gasDeploys} 
          onRefresh={async () => { 
            if (loading) return;
            setLoading(true);
            setLog(prev => prev + '\n手動更新開始...');
            try {
              await refreshStatus(); 
              await new Promise(resolve => setTimeout(resolve, 200));
              await refreshDeploys(); 
              await new Promise(resolve => setTimeout(resolve, 200));
              await refreshGasDeploys();
              setLog(prev => prev + '\n手動更新完了');
            } catch (error) {
              setLog(prev => prev + '\nERR: 手動更新失敗');
            } finally {
              setLoading(false);
            }
          }} 
        />
      </section>
      <pre style={{ marginTop: 16, padding: 12, background: '#f7f7f7', minHeight: 120 }}>{log}</pre>
    </main>
  );
}

function LIFFUpdatePanel() {
  const [tenantId, setTenantId] = useState('sample-store');
  const [environment, setEnvironment] = useState<'dev' | 'prod'>('dev');
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');

  const run = async () => {
    setMsg('更新中...');
    try {
      const res = await fetch('/api/liff/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId, environment, url }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setMsg('OK');
    } catch (e: any) {
      setMsg('ERR: ' + (e?.message || 'unknown'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="tenantId" />
        <select value={environment} onChange={e => setEnvironment(e.target.value as any)}>
          <option value="dev">dev</option>
          <option value="prod">prod</option>
        </select>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://...vercel.app" style={{ flex: 1 }} />
        <button onClick={run}>更新</button>
      </div>
      <div style={{ color: '#555' }}>{msg}</div>
    </div>
  );
}

function ConfigPRPanel() {
  const [tenantId, setTenantId] = useState('sample-store');
  const [path, setPath] = useState(`packages/config/tenants/sample-store/menu.json`);
  const [content, setContent] = useState('');
  const [base, setBase] = useState<'dev' | 'main'>('dev');
  const [msg, setMsg] = useState('');

  const run = async () => {
    setMsg('作成中...');
    try {
      const res = await fetch('/api/config/pr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId, path, content, base }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      setMsg(`OK: PR #${data.pr.number}`);
    } catch (e: any) {
      setMsg('ERR: ' + (e?.message || 'unknown'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={tenantId} onChange={e => setTenantId(e.target.value)} placeholder="tenantId" />
        <select value={base} onChange={e => setBase(e.target.value as any)}>
          <option value="dev">dev</option>
          <option value="main">main</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={path} onChange={e => setPath(e.target.value)} placeholder="path" style={{ flex: 1 }} />
      </div>
      <div>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="JSON content" style={{ width: '100%', minHeight: 180 }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={run}>PRを作成</button>
      </div>
      <div style={{ color: '#555', marginTop: 8 }}>{msg}</div>
    </div>
  );
}

function TenantDetailPanel({ detail, status, deploys, gasDeploys, onRefresh }: { detail: any; status: any; deploys: any; gasDeploys: any; onRefresh: () => Promise<void> }) {
  if (!detail) return <div>読み込み中...</div>;
  if (detail.error) return <div style={{ color: 'red' }}>エラー: {String(detail.error)}</div>;
  const { tenantId, mapping, menu, rules, ui } = detail;
  return (
    <div style={{ padding: 12, border: '1px solid #ddd', background: '#fafafa' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><strong>Tenant:</strong> {tenantId}</div>
        <div>
          <button onClick={onRefresh}>状態再取得</button>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: 8, border: '1px dashed #ccc', background: '#fff' }}>
        <strong>Secrets/Endpoints 状態</strong>
        <div style={{ display: 'flex', gap: 16 }}>
          <EnvTable label="DEV" data={status?.dev} />
          <EnvTable label="PROD" data={status?.prod} />
        </div>
      </div>
      <div style={{ marginTop: 8, padding: 8, border: '1px dashed #ccc', background: '#fff' }}>
        <strong>最新デプロイ（URL疎通/応答ヘッダ）</strong>
        <DeploysTable data={deploys} />
      </div>
      <div style={{ marginTop: 8, padding: 8, border: '1px dashed #ccc', background: '#fff' }}>
        <strong>GAS デプロイ一覧（scriptIdごと）</strong>
        <GasDeploysTable data={gasDeploys} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <pre style={{ margin: 0, padding: 8, background: '#fff', border: '1px solid #eee' }}>{JSON.stringify(mapping, null, 2)}</pre>
        <pre style={{ margin: 0, padding: 8, background: '#fff', border: '1px solid #eee' }}>{JSON.stringify(menu, null, 2)}</pre>
        <pre style={{ margin: 0, padding: 8, background: '#fff', border: '1px solid #eee' }}>{JSON.stringify(rules, null, 2)}</pre>
        <pre style={{ margin: 0, padding: 8, background: '#fff', border: '1px solid #eee' }}>{JSON.stringify(ui, null, 2)}</pre>
      </div>
    </div>
  );
}

function EnvTable({ label, data }: { label: string; data: any }) {
  if (!data) return <div>{label}: 取得中...</div>;
  const keys = Object.keys(data);
  const repo = (process.env as any).NEXT_PUBLIC_GITHUB_REPOSITORY as string | undefined;
  const docsBase = repo ? `https://github.com/${repo}/blob/dev/docs` : undefined;
  const guideUrl = (file: string) => (docsBase ? `${docsBase}/${file}` : undefined);
  return (
    <table style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr><th style={{ border: '1px solid #eee', padding: 4 }}>{label}</th><th style={{ border: '1px solid #eee', padding: 4 }}>Key</th><th style={{ border: '1px solid #eee', padding: 4 }}>Present</th><th style={{ border: '1px solid #eee', padding: 4 }}>Value</th><th style={{ border: '1px solid #eee', padding: 4 }}>Guide</th></tr>
      </thead>
      <tbody>
        {keys.map(k => (
          <tr key={k}>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{k}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{data[k].key}</td>
            <td style={{ border: '1px solid #eee', padding: 4, color: data[k].present ? 'green' : 'red' }}>{data[k].present ? 'OK' : 'MISSING'}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{data[k].redacted ? '******' : (data[k].value || '')}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>
              {(!data[k].present) ? (
                <>
                  {guideUrl('62_secrets_matrix.md') ? (
                    <a href={guideUrl('62_secrets_matrix.md')} target="_blank" rel="noreferrer">Secrets</a>
                  ) : 'Secrets'}
                  {' / '}
                  {guideUrl('30_operations.md') ? (
                    <a href={guideUrl('30_operations.md')} target="_blank" rel="noreferrer">Ops</a>
                  ) : 'Ops'}
                </>
              ) : ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DeploysTable({ data }: { data: any }) {
  if (!data) return <div>取得中...</div>;
  if (data.error) return <div style={{ color: 'red' }}>エラー: {String(data.error)}</div>;
  const rows = data.results || [];
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #eee', padding: 4 }}>env</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>kind</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>key</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>URL</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>ok</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>status</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>ms</th>
          <th style={{ border: '1px solid #eee', padding: 4 }}>last-modified / date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r: any, idx: number) => (
          <tr key={idx}>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.env}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.kind}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.key}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.url || ''}</td>
            <td style={{ border: '1px solid #eee', padding: 4, color: r.check?.ok ? 'green' : 'red' }}>{String(r.check?.ok)}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.check?.status || ''}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.check?.ms || ''}</td>
            <td style={{ border: '1px solid #eee', padding: 4 }}>{r.check?.headers?.['last-modified'] || r.check?.headers?.date || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GasDeploysTable({ data }: { data: any }) {
  if (!data) return <div>取得中...</div>;
  if (data.error) return <div style={{ color: 'red' }}>エラー: {String(data.error)}</div>;
  const items = data.items || [];
  const [msg, setMsg] = (window as any).__reactMsgHook || useState('');
  const [customVer, setCustomVer] = useState<Record<string, string>>({});

  const deploy = async (tenantId: string, app: string, env: string, versionNumber?: number) => {
    setMsg('デプロイ実行中...');
    try {
      // バージョン番号は最新のversionNumberを推定
      const target = items.find((it: any) => it.app === app && it.env === env);
      const latest = target?.deployments?.deployments?.at(-1)?.deploymentConfig?.versionNumber;
      const ver = versionNumber ?? latest;
      if (!ver) throw new Error('version not found');
      const res = await fetch(`/api/tenants/${data.tenantId}/gas/deploy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app, env, versionNumber: ver }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'failed');
      setMsg('OK');
    } catch (e: any) {
      setMsg('ERR: ' + (e?.message || 'unknown'));
    }
  };
  return (
    <div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #eee', padding: 4 }}>env</th>
            <th style={{ border: '1px solid #eee', padding: 4 }}>app</th>
            <th style={{ border: '1px solid #eee', padding: 4 }}>scriptId</th>
            <th style={{ border: '1px solid #eee', padding: 4 }}>deployments</th>
            <th style={{ border: '1px solid #eee', padding: 4 }}>actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it: any, idx: number) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #eee', padding: 4 }}>{it.env}</td>
              <td style={{ border: '1px solid #eee', padding: 4 }}>{it.app}</td>
              <td style={{ border: '1px solid #eee', padding: 4 }}>{it.scriptId || it.error}</td>
              <td style={{ border: '1px solid #eee', padding: 4 }}>
                {it.deployments?.deployments ? (
                  <details>
                    <summary>{it.deployments.deployments.length}件</summary>
                    <ul>
                      {it.deployments.deployments.map((d: any, i: number) => (
                        <li key={i}>
                          ver {d.deploymentConfig?.versionNumber} - {d.deploymentConfig?.description || ''}
                          {' '}
                          <button onClick={() => deploy(data.tenantId, it.app, it.env, d.deploymentConfig?.versionNumber)}>このverにデプロイ</button>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : ''}
              </td>
              <td style={{ border: '1px solid #eee', padding: 4 }}>
                {it.scriptId && it.deployments?.deployments?.length ? (
                  <>
                    <button onClick={() => deploy(data.tenantId, it.app, it.env)}>最新verに再デプロイ</button>
                    <div style={{ marginTop: 4 }}>
                      <input
                        placeholder="versionNumber"
                        style={{ width: 120 }}
                        value={customVer[`${it.env}-${it.app}`] || ''}
                        onChange={e => setCustomVer({ ...customVer, [`${it.env}-${it.app}`]: e.target.value })}
                      />
                      <button onClick={() => deploy(data.tenantId, it.app, it.env, Number(customVer[`${it.env}-${it.app}`]))}>指定verにデプロイ</button>
                    </div>
                  </>
                ) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 8, color: '#555' }}>{msg}</div>
    </div>
  );
}


