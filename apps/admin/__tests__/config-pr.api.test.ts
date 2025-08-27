import { POST as createPR } from '../app/api/config/pr/route';

// Mock fetch for GitHub API calls
const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

const ok = (json: any) => ({ ok: true, json: async () => json, text: async () => JSON.stringify(json) });
const ng = (json: any, status = 500) => ({ ok: false, status, json: async () => json, text: async () => JSON.stringify(json) });

describe('config PR API', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    process.env.GITHUB_TOKEN_FOR_DISPATCH = 'token';
    process.env.GITHUB_REPOSITORY = 'owner/repo';
  });

  it('returns 400 on bad request', async () => {
    const res = await createPR(new Request('http://test', { method: 'POST', body: JSON.stringify({}) })) as any;
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
  });

  it('creates ref, commits content and opens PR', async () => {
    // 1 get base ref
    fetchMock.mockResolvedValueOnce(ok({ object: { sha: 'base-sha' } }));
    // 2 create ref
    fetchMock.mockResolvedValueOnce(ok({}));
    // 3 get content 404 (file not exist)
    fetchMock.mockResolvedValueOnce(ng({ message: 'Not Found' }, 404));
    // 4 put content
    fetchMock.mockResolvedValueOnce(ok({}));
    // 5 create pr
    fetchMock.mockResolvedValueOnce(ok({ number: 123 }));

    const body = {
      tenantId: 'sample-store',
      path: 'packages/config/tenants/sample-store/menu.json',
      content: '{"a":1}',
      base: 'dev'
    };
    const res = await createPR(new Request('http://test', { method: 'POST', body: JSON.stringify(body) })) as any;
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.pr.number).toBe(123);
  });
});


