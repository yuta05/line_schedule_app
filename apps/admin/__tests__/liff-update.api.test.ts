import { POST as updateView } from '../app/api/liff/update/route';

describe('liff update api', () => {
  const fetchMock = jest.fn();
  (global as any).fetch = fetchMock;

  beforeEach(() => {
    fetchMock.mockReset();
    process.env.SAMPLE_STORE_LIFF_ID_DEV = 'liff-xxx';
    process.env.SAMPLE_STORE_LINE_CHANNEL_TOKEN_DEV = 'line-token';
  });

  it('returns 400 on bad request', async () => {
    const res = await updateView(new Request('http://test', { method: 'POST', body: JSON.stringify({}) })) as any;
    expect(res.status).toBe(400);
  });

  it('updates LIFF view URL', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, text: async () => '' });
    const body = { tenantId: 'sample-store', environment: 'dev', url: 'https://example.com' };
    const res = await updateView(new Request('http://test', { method: 'POST', body: JSON.stringify(body) })) as any;
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});


