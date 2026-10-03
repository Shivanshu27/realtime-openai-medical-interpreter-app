import { apiFetch, getAccessToken, setAccessToken } from './apiClient';

const ok = { status: 200, ok: true };
const denied = { status: 401, ok: false };

describe('apiFetch', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    global.fetch = jest.fn();
    window.prompt = jest.fn();
  });

  it('sends no Authorization header when no token is stored', async () => {
    global.fetch.mockResolvedValueOnce(ok);
    await apiFetch('/api/x', { method: 'POST' });
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it('sends the stored token as a Bearer header', async () => {
    setAccessToken('abc');
    global.fetch.mockResolvedValueOnce(ok);
    await apiFetch('/api/x', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const headers = global.fetch.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe('Bearer abc');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('asks once on 401, retries with the code, and remembers it', async () => {
    global.fetch.mockResolvedValueOnce(denied).mockResolvedValueOnce(ok);
    window.prompt.mockReturnValueOnce(' secret ');
    const res = await apiFetch('/api/x');
    expect(res.status).toBe(200);
    expect(window.prompt).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer secret');
    expect(getAccessToken()).toBe('secret');
  });

  it('forgets a code the server rejects', async () => {
    global.fetch.mockResolvedValueOnce(denied).mockResolvedValueOnce(denied);
    window.prompt.mockReturnValueOnce('wrong');
    const res = await apiFetch('/api/x');
    expect(res.status).toBe(401);
    expect(getAccessToken()).toBe('');
  });

  it('does not prompt when told not to', async () => {
    global.fetch.mockResolvedValueOnce(denied);
    await apiFetch('/api/x', {}, { promptOnUnauthorized: false });
    expect(window.prompt).not.toHaveBeenCalled();
  });
});
