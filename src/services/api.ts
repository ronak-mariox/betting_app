import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Base URL of the auth/authorization backend (see backend/README.md).
 *
 * A physical device (what DEV_HOST is set for below) can't reach "localhost"
 * or "10.0.2.2" — those only resolve to the host machine from an emulator/
 * simulator — so it needs your computer's actual LAN IP instead. Find yours
 * with `ipconfig getifaddr en0` (macOS) and make sure the phone is on the
 * same Wi-Fi network as the computer running `npm run dev` in backend/.
 *
 * Switch back to these if you move to an emulator/simulator instead:
 *   - Android emulator: '10.0.2.2' (maps to the host's localhost)
 *   - iOS simulator: 'localhost' (shares the host's network directly)
 */
const DEV_HOST = '192.168.1.33';
const DEV_PORT = 5000;
export const API_BASE_URL = `http://${DEV_HOST}:${DEV_PORT}/api`;

/** Thrown for any non-2xx response; `message` is the server's error message, ready to show the user. */
export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  accessToken?: string | null;
};

/** Bounds every request so a slow/unreachable dev server can't hang the app (e.g. stuck on Splash). */
const REQUEST_TIMEOUT_MS = 10000;

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {method = 'GET', body, accessToken} = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiRequestError(
      0,
      'Server tak pahunch nahi paaye. Internet check karo.',
    );
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      payload?.error?.message || `Request failed (${response.status})`;
    throw new ApiRequestError(response.status, message);
  }

  return payload as T;
}

export type ApiUser = {
  _id: string;
  username: string;
  role: 'player' | 'super-admin' | 'franchise' | 'super-agent' | 'agent';
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  /** ISO date string, or null when not set. */
  dob: string | null;
  /** Data URI ("data:image/jpeg;base64,...") or '' when not set. */
  avatar: string;
  referralCode?: string;
  status: 'active' | 'suspended';
};

export type ProfileUpdate = Partial<{
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  /** ISO date string ("YYYY-MM-DD"). */
  dob: string;
  /** Data URI ("data:image/jpeg;base64,..."), PNG/JPEG/WebP only, ~1.5MB decoded max. */
  avatar: string;
}>;

export type AuthSession = {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
};

export const authApi = {
  register: (payload: {
    username: string;
    password: string;
    referralCode?: string;
  }) => request<AuthSession>('/auth/register', {method: 'POST', body: payload}),

  login: (payload: {username: string; password: string}) =>
    request<AuthSession>('/auth/login', {method: 'POST', body: payload}),

  me: (accessToken: string) =>
    request<{user: ApiUser}>('/auth/me', {accessToken}),

  updateProfile: (accessToken: string, payload: ProfileUpdate) =>
    request<{user: ApiUser}>('/auth/me', {
      method: 'PATCH',
      body: payload,
      accessToken,
    }),

  refresh: (refreshToken: string) =>
    request<{accessToken: string; refreshToken: string}>('/auth/refresh', {
      method: 'POST',
      body: {refreshToken},
    }),

  logout: (refreshToken: string, accessToken?: string | null) =>
    request<void>('/auth/logout', {
      method: 'POST',
      body: {refreshToken},
      accessToken,
    }),
};

const SESSION_KEY = 'betpro.session';

export const saveSession = (session: AuthSession) =>
  AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));

export const clearSession = () => AsyncStorage.removeItem(SESSION_KEY);

async function loadStoredSession(): Promise<AuthSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

/**
 * Called once on launch: confirms a session saved on a previous run is
 * still valid (not suspended, not deleted), rotating the access token via
 * the refresh token when it's expired. Clears storage and returns null if
 * neither works, sending the user back to Welcome.
 */
export async function restoreSession(): Promise<AuthSession | null> {
  const stored = await loadStoredSession();
  if (!stored) {
    return null;
  }

  try {
    const {user} = await authApi.me(stored.accessToken);
    return {...stored, user};
  } catch {
    try {
      const rotated = await authApi.refresh(stored.refreshToken);
      const {user} = await authApi.me(rotated.accessToken);
      const next: AuthSession = {
        user,
        accessToken: rotated.accessToken,
        refreshToken: rotated.refreshToken,
      };
      await saveSession(next);
      return next;
    } catch {
      await clearSession();
      return null;
    }
  }
}
