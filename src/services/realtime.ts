import {io, Socket} from 'socket.io-client';
import type {ApiMatch, ApiRunner} from './api';
import {currentServerUrl, rotateTokens} from './api';

/** What the backend pushes (see backend/src/realtime.js). */
export type OddsUpdate = {
  eventId: string;
  markets: {
    _id: string;
    name: string;
    type: string;
    status: 'Active' | 'Suspended';
    maxBet: number;
    runners: ApiRunner[];
  }[];
};

export type RealtimeHandlers = {
  onOdds: (update: OddsUpdate) => void;
  /** A match went live / finished, or a market opened or closed: refetch the list. */
  onMatchesChanged: () => void;
  /** This player's wallet or bets changed: refetch them. */
  onPlayerChanged: () => void;
  onConnectionChange?: (connected: boolean) => void;
};

/**
 * Opens the live-updates socket. `getToken` is asked on every (re)connect,
 * so a refreshed access token is picked up without restarting it.
 */
export function connectRealtime(
  getToken: () => string | null,
  handlers: RealtimeHandlers,
): Socket {
  const socket = io(currentServerUrl(), {
    transports: ['websocket'],
    auth: cb => cb({token: getToken()}),
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
  // Socket.IO retries by itself when the server is unreachable, but not when
  // it refuses the handshake (an expired access token, e.g. across a backend
  // restart): refresh the token and try again, backing off up to 30 s.
  let retryDelay = 1000;
  let retrying = false;
  let everConnected = false;
  socket.on('connect_error', async () => {
    if (socket.active || retrying) {
      return;
    }
    retrying = true;
    const stale = getToken();
    if (stale) {
      await rotateTokens(stale);
    }
    setTimeout(() => {
      retrying = false;
      socket.connect();
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30000);
  });
  socket.on('connect', () => {
    retryDelay = 1000;
    // Whatever was pushed while disconnected is missed: refetch after a reconnect.
    if (everConnected) {
      handlers.onMatchesChanged();
      handlers.onPlayerChanged();
    }
    everConnected = true;
  });
  socket.on('connect', () => handlers.onConnectionChange?.(true));
  socket.on('disconnect', () => handlers.onConnectionChange?.(false));
  socket.on('odds', handlers.onOdds);
  socket.on('matches:changed', handlers.onMatchesChanged);
  socket.on('player:changed', handlers.onPlayerChanged);
  return socket;
}

/**
 * Applies pushed prices to the feed. A market that is no longer open drops
 * out (the feed only lists open ones); one the client hasn't seen yet arrives
 * with the next list refetch.
 */
export function applyOdds(matches: ApiMatch[], update: OddsUpdate): ApiMatch[] {
  let touched = false;
  const next = matches.map(match => {
    if (match._id !== update.eventId) {
      return match;
    }
    const byId = new Map(update.markets.map(m => [m._id, m]));
    const markets = match.markets
      .map(market => {
        const fresh = byId.get(market._id);
        if (!fresh) {
          return market;
        }
        touched = true;
        return fresh.status === 'Active'
          ? {...market, name: fresh.name, maxBet: fresh.maxBet, runners: fresh.runners}
          : null;
      })
      .filter((m): m is ApiMatch['markets'][number] => m !== null);
    return {...match, markets};
  });
  return touched ? next : matches;
}
