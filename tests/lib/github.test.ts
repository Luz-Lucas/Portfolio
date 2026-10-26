import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicRepos } from '@/lib/github';

const page = (n: number, start = 0) => Array.from({ length: n }, (_, i) => ({ id: start + i, name: `r${start + i}` }));

describe('fetchPublicRepos', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('follows pagination and sends the token', async () => {
    process.env.GITHUB_TOKEN = 'tok';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(page(100)), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page(5, 100)), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const repos = await fetchPublicRepos('eu');
    expect(repos).toHaveLength(105);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(String(url)).toContain('/users/eu/repos');
    expect(String(url)).toContain('page=2');
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  it('throws on a non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })));
    await expect(fetchPublicRepos('eu')).rejects.toThrow('403');
  });
});
