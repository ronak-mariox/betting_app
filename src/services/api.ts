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

/**
 * Where the dev server can be: the computer's Wi-Fi address, or — for a
 * phone plugged in over USB (`adb reverse tcp:5000 tcp:5000`, which `npm run
 * android` sets up) or an emulator — the phone's own localhost / 10.0.2.2.
 * The first one that answers is remembered, so a phone on another Wi-Fi
 * network still works over the cable.
 */
const API_BASE_URLS = [
  API_BASE_URL,
  `http://localhost:${DEV_PORT}/api`,
  `http://10.0.2.2:${DEV_PORT}/api`,
];
let activeBase = 0;

/** The backend that last answered, without "/api" — where the live-updates socket connects. */
export const currentServerUrl = () =>
  API_BASE_URLS[activeBase].replace(/\/api$/, '');
/** A host that doesn't answer is given up on quickly so the next can be tried. */
const PROBE_TIMEOUT_MS = 3500;

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
  /** Overrides the default timeout, e.g. for document uploads. */
  timeoutMs?: number;
  /** Set on the one retry after a token refresh, so a second 401 isn't retried again. */
  retried?: boolean;
};

type TokenPair = {accessToken: string; refreshToken: string};

/**
 * Access tokens last 15 minutes. The app hands every request the token it
 * has in state; when the server answers 401 the client swaps the pair via
 * the refresh token (once, however many requests failed together), tells the
 * app, and replays the request. `bindSession` keeps this in step with the
 * signed-in session.
 */
let activeTokens: TokenPair | null = null;
let sessionListener: {
  onRotate: (tokens: TokenPair) => void;
  /** `reason` is 'suspended' when staff blocked the account, else the session just ran out. */
  onExpire: (reason?: 'suspended') => void;
} | null = null;
let rotation: Promise<string | null> | null = null;

export const bindSession = (tokens: TokenPair | null) => {
  activeTokens = tokens;
};

export const setSessionListener = (listener: typeof sessionListener) => {
  sessionListener = listener;
};

/** Returns a usable access token after `stale` was rejected, or null if the session is over. */
export async function rotateTokens(stale: string): Promise<string | null> {
  if (!activeTokens) {
    return null;
  }
  // Another request already refreshed while this one was in flight.
  if (activeTokens.accessToken !== stale) {
    return activeTokens.accessToken;
  }
  if (!rotation) {
    const {refreshToken} = activeTokens;
    rotation = (async () => {
      try {
        const next = await request<TokenPair>('/auth/refresh', {
          method: 'POST',
          body: {refreshToken},
        });
        activeTokens = next;
        const stored = await loadStoredSession();
        if (stored) {
          await saveSession({...stored, ...next});
        }
        sessionListener?.onRotate(next);
        return next.accessToken;
      } catch (err) {
        // Only a rejected refresh token ends the session — not a network blip.
        if (err instanceof ApiRequestError && err.status !== 0) {
          activeTokens = null;
          sessionListener?.onExpire();
        }
        return null;
      } finally {
        rotation = null;
      }
    })();
  }
  return rotation;
}

/** Bounds every request so a slow/unreachable dev server can't hang the app (e.g. stuck on Splash). */
const REQUEST_TIMEOUT_MS = 10000;

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    accessToken,
    timeoutMs = REQUEST_TIMEOUT_MS,
    retried = false,
  } = options;

  const send = async (base: string, limitMs: number) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), limitMs);
    try {
      return await fetch(`${base}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let response: Response | undefined;
  // The host that worked last time first, then the others.
  const order = API_BASE_URLS.map(
    (_, i) => (activeBase + i) % API_BASE_URLS.length,
  );
  for (const index of order) {
    try {
      response = await send(
        API_BASE_URLS[index],
        index === activeBase
          ? timeoutMs
          : Math.min(timeoutMs, PROBE_TIMEOUT_MS),
      );
      activeBase = index;
      break;
    } catch {
      // Unreachable from here — try the next way to the server.
    }
  }
  if (!response) {
    throw new ApiRequestError(
      0,
      'Server tak pahunch nahi paaye. Internet check karo.',
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (response.status === 401 && accessToken && !retried) {
    const fresh = await rotateTokens(accessToken);
    if (fresh) {
      return request<T>(path, {...options, accessToken: fresh, retried: true});
    }
  }

  if (!response.ok) {
    const message =
      payload?.error?.message || `Request failed (${response.status})`;
    // Staff suspended the account while the app was open: the session is over.
    if (response.status === 403 && accessToken && /suspended/i.test(message)) {
      activeTokens = null;
      sessionListener?.onExpire('suspended');
    }
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
  /** 'Not Submitted' until the player completes the KYC flow. */
  kyc: KycStatus;
  /** Settings switches ("notifyMoney": false, …); one that was never touched is absent and counts as on. */
  preferences?: Record<string, boolean>;
};

export type KycStatus = 'Not Submitted' | 'Pending' | 'Verified' | 'Rejected';

/** The player's latest KYC submission as the backend returns it (number masked, no images). */
export type KycSubmissionSummary = {
  referenceId: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  rejectionReason: string;
  submittedAt: string;
  reviewedAt: string | null;
  documentType: string;
  documentNumber: string;
  files: string[];
};

export type KycState = {
  kyc: KycStatus;
  submission: KycSubmissionSummary | null;
};

export type KycSubmitPayload = {
  fullName: string;
  /** 10-digit Indian mobile. */
  phone: string;
  /** ISO date (YYYY-MM-DD). */
  dob: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  documentType: string;
  documentNumber: string;
  front: {name: string; data: string};
  back?: {name: string; data: string};
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
  /** Only the switches sent change; the rest keep their value. */
  preferences: Record<string, boolean>;
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

export const kycApi = {
  me: (accessToken: string) => request<KycState>('/kyc/me', {accessToken}),

  submit: (accessToken: string, payload: KycSubmitPayload) =>
    // Two document photos can take a while on mobile data.
    request<KycState>('/kyc', {
      method: 'POST',
      body: payload,
      accessToken,
      timeoutMs: 60000,
    }),
};

export type PlayerTransaction = {
  _id: string;
  type:
    | 'Deposit'
    | 'Withdrawal'
    | 'Bet Win'
    | 'Bet Loss'
    | 'Adjustment'
    | 'Commission'
    | 'Payment';
  /** Signed rupees — negative for money leaving the wallet. */
  amount: number;
  method: string;
  reference: string;
  status: 'Pending' | 'Completed' | 'Failed';
  note: string;
  createdAt: string;
};

export type PlayerWalletRequest = {
  _id: string;
  kind: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  reference: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  /** Why the agent rejected it; '' otherwise. */
  rejectionReason?: string;
  createdAt: string;
};

export type PlayerWallet = {
  balance: number;
  /** Stake held by open bets (not yet debited). */
  openStake: number;
  pendingWithdrawal: number;
  /** What can be bet or withdrawn right now. */
  available: number;
  wonToday: number;
  kyc: KycStatus;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  transactions: PlayerTransaction[];
  requests: PlayerWalletRequest[];
};

export type ApiRunner = {
  name: string;
  odds: number;
  /** False while the odds feed has this selection suspended; missing on older/manual markets (= open). */
  active?: boolean;
};

export type ApiMatch = {
  _id: string;
  sport: string;
  emoji: string;
  league: string;
  name: string;
  home: string;
  away: string;
  score: string;
  status: 'Live' | 'Upcoming' | 'Suspended' | 'Completed' | 'Settled';
  startTime: string;
  /** Feed matches: embeddable live score card and video (null when there's none). */
  scoreUrl?: string | null;
  streamUrl?: string | null;
  markets: {
    _id: string;
    name: string;
    type: string;
    maxBet: number;
    runners: ApiRunner[];
  }[];
};

export type ApiBet = {
  _id: string;
  match: string;
  market: string;
  selection: string;
  odds: number;
  stake: number;
  status: 'Pending' | 'Won' | 'Lost' | 'Void' | 'Cashed Out';
  payout: number;
  placedAt: string;
  settledAt: string | null;
  /** Current cash-out offer; open bets on an active market only. */
  cashOut: number | null;
};

/** One row of the player's notification feed. */
export type PlayerNotification = {
  _id: string;
  emoji: string;
  title: string;
  body: string;
  category:
    | 'wallet'
    | 'bet'
    | 'live'
    | 'kyc'
    | 'security'
    | 'promo'
    | 'general';
  /** Screen it opens when tapped, or '' for none. */
  link: '' | 'wallet' | 'bets' | 'live' | 'kyc' | 'profile';
  unread: boolean;
  createdAt: string;
};

export type PlayerNotifications = {
  notifications: PlayerNotification[];
  unreadCount: number;
};

/** The player's wallet, match feed, bets and notifications (backend /api/player). */
/** Settings → Brand from the admin panel; public, read before sign-in (see index.js). */
export const brandingApi = {
  get: () =>
    request<{branding: import('../theme/brand').Branding}>('/branding', {
      timeoutMs: 1500,
    }),
};

export const playerApi = {
  wallet: (accessToken: string) =>
    request<PlayerWallet>('/player/wallet', {accessToken}),

  requestFunds: (
    accessToken: string,
    payload: {
      kind: 'deposit' | 'withdrawal';
      amount: number;
      method?: string;
      reference?: string;
      /** Deposits: the payment screenshot, as a data URI. */
      proof?: {name: string; data: string};
    },
  ) =>
    request<{request: PlayerWalletRequest; wallet: PlayerWallet}>(
      '/player/wallet/requests',
      {method: 'POST', body: payload, accessToken},
    ),

  matches: (accessToken: string) =>
    request<{matches: ApiMatch[]}>('/player/matches', {accessToken}),

  bets: (accessToken: string) =>
    request<{bets: ApiBet[]}>('/player/bets', {accessToken}),

  placeBet: (
    accessToken: string,
    payload: {marketId: string; selection: string; stake: number},
  ) =>
    request<{bet: ApiBet; wallet: PlayerWallet}>('/player/bets', {
      method: 'POST',
      body: payload,
      accessToken,
    }),

  cashOut: (accessToken: string, betId: string) =>
    request<{offer: number; wallet: PlayerWallet}>(
      `/player/bets/${betId}/cashout`,
      {method: 'POST', accessToken},
    ),

  notifications: (accessToken: string) =>
    request<PlayerNotifications>('/player/notifications', {accessToken}),

  readNotification: (accessToken: string, id: string) =>
    request<PlayerNotifications>(`/player/notifications/${id}/read`, {
      method: 'PATCH',
      accessToken,
    }),

  readAllNotifications: (accessToken: string) =>
    request<PlayerNotifications>('/player/notifications/read-all', {
      method: 'PATCH',
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
