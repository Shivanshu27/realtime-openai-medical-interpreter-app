/**
 * Fetch wrapper for the interpreter backend.
 *
 * When the server is protected with APP_ACCESS_TOKEN, calls carry it as a
 * Bearer token. On a 401 the user is asked once for the access code, which is
 * kept in sessionStorage only: it is cleared when the tab closes, which suits
 * shared clinical workstations better than localStorage.
 */
const STORAGE_KEY = 'interpreterAccessToken';

export const getAccessToken = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const setAccessToken = (token) => {
  try {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    // Storage unavailable (private mode): the token lives for this call only.
  }
};

const withAuth = (options, token) => ({
  ...options,
  headers: {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});

export const apiFetch = async (url, options = {}, { promptOnUnauthorized = true } = {}) => {
  let response = await fetch(url, withAuth(options, getAccessToken()));

  if (response.status === 401 && promptOnUnauthorized && typeof window.prompt === 'function') {
    const entered = window.prompt('This interpreter is protected. Enter the access code:');
    const token = entered ? entered.trim() : '';
    if (token) {
      setAccessToken(token);
      response = await fetch(url, withAuth(options, token));
      if (response.status === 401) {
        setAccessToken('');
      }
    }
  }
  return response;
};
