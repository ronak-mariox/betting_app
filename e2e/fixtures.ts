/**
 * What the end-to-end tests need from the backend, made through its own API,
 * so they run on any database — an empty one included. Accounts made here are
 * named `zz_e2e_…`, which marks them as safe to delete afterwards.
 */
import {API_BASE_URL} from '../src/services/api';

export const E2E_PASSWORD = 'player@123';

/** 1×1 PNG, standing in for a document photo / payment screenshot. */
export const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export const api = async (
  method: string,
  path: string,
  body?: unknown,
  token?: string,
) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return res.json();
};

export const tokenFor = async (username: string, password: string) =>
  (await api('POST', '/auth/login', {username, password}))
    .accessToken as string;

export const adminToken = () => tokenFor('mithu8178', 'superadmin@123');

const stamp = () =>
  `${Date.now().toString(36).slice(-5)}${Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, '0')}`;

type Kyc = 'Not Submitted' | 'Pending' | 'Verified';

/**
 * Signs a player up under agent01 (so that agent can review their requests),
 * takes their KYC as far as asked and puts `balance` in their wallet.
 */
export async function makePlayer({
  kyc = 'Not Submitted',
  balance = 0,
  name = 'E2E Player',
}: {kyc?: Kyc; balance?: number; name?: string} = {}) {
  const agent = await api('POST', '/auth/login', {
    username: 'agent01',
    password: 'agent@123',
  });
  const username = `zz_e2e_${stamp()}`;
  const session = await api('POST', '/auth/register', {
    username,
    password: E2E_PASSWORD,
    referralCode: agent.user.referralCode,
  });
  if (!session.accessToken) {
    throw new Error(`Could not register ${username}: ${JSON.stringify(session)}`);
  }
  const admin = await adminToken();
  if (kyc !== 'Not Submitted') {
    const submitted = await api(
      'POST',
      '/kyc',
      {
        fullName: name,
        phone: '9876501234',
        dob: '1995-05-15',
        address: '12 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001',
        documentType: 'PAN Card',
        documentNumber: 'ABCDE1234F',
        front: {
          name: 'pan_front.png',
          data: `data:image/png;base64,${PNG_BASE64}`,
        },
      },
      session.accessToken,
    );
    if (submitted.kyc !== 'Pending') {
      throw new Error(`KYC not accepted: ${JSON.stringify(submitted)}`);
    }
  }
  if (kyc === 'Verified') {
    await api('PATCH', `/accounts/${session.user._id}`, {kyc}, admin);
  }
  if (balance > 0) {
    await api(
      'POST',
      '/wallet/manual-entry',
      {
        userId: session.user._id,
        action: 'Credit',
        amount: balance,
        note: 'E2E test float',
      },
      admin,
    );
  }
  return {username, password: E2E_PASSWORD, id: session.user._id as string};
}

/** Makes sure a live match with an open two-way market is on the feed. */
export async function ensureLiveMatch() {
  const admin = await adminToken();
  const {events} = await api('GET', '/events?status=Live', undefined, admin);
  const {markets} = await api('GET', '/markets', undefined, admin);
  const open = (eventId: string) =>
    markets.some(
      (m: {event: string | {_id: string}; status: string; winner?: string}) =>
        String(typeof m.event === 'string' ? m.event : m.event?._id) ===
          eventId &&
        m.status === 'Active' &&
        !m.winner,
    );
  if (events.some((e: {_id: string}) => open(e._id))) {
    return;
  }
  const {event} = await api(
    'POST',
    '/events',
    {
      sport: 'Cricket',
      league: 'Test League',
      name: 'Test Titans vs Demo Warriors',
      emoji: '🏏',
      startTime: new Date().toISOString(),
    },
    admin,
  );
  await api(
    'POST',
    '/markets',
    {
      event: event._id,
      code: `E2E-${stamp().toUpperCase()}`,
      name: 'Match Odds',
      type: 'Match Odds',
      runners: [
        {name: 'Test Titans', odds: 1.8},
        {name: 'Demo Warriors', odds: 2.1},
      ],
    },
    admin,
  );
  await api('PATCH', `/events/${event._id}/status`, {status: 'Live'}, admin);
}
