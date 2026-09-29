import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  BackHandler,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CredentialsScreen} from './src/screens/CredentialsScreen';
import {DepositScreen} from './src/screens/DepositScreen';
import {EditProfileScreen} from './src/screens/EditProfileScreen';
import {HelpScreen} from './src/screens/HelpScreen';
import {KycDocumentScreen} from './src/screens/KycDocumentScreen';
import {KycIntroScreen} from './src/screens/KycIntroScreen';
import {KycPersonalScreen} from './src/screens/KycPersonalScreen';
import {KycReviewScreen} from './src/screens/KycReviewScreen';
import {KycStatusScreen} from './src/screens/KycStatusScreen';
import {LegalScreen} from './src/screens/LegalScreen';
import {HomeScreen} from './src/screens/HomeScreen';
import {LiveScreen} from './src/screens/LiveScreen';
import {LoginScreen} from './src/screens/LoginScreen';
import {MatchScreen} from './src/screens/MatchScreen';
import {MyBetsScreen} from './src/screens/MyBetsScreen';
import {NotificationsScreen} from './src/screens/NotificationsScreen';
import {ProfileScreen} from './src/screens/ProfileScreen';
import {ReferralScreen} from './src/screens/ReferralScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {SignUpScreen} from './src/screens/SignUpScreen';
import {SplashScreen} from './src/screens/SplashScreen';
import {WalletScreen} from './src/screens/WalletScreen';
import {WelcomeScreen} from './src/screens/WelcomeScreen';
import {WithdrawScreen} from './src/screens/WithdrawScreen';
import {Bet} from './src/components';
import {privacyPolicy, termsConditions} from './src/data/legal';
import {formatRupees} from './src/data/betSlip';
import {notify} from './src/utils/actions';
import {
  ApiRequestError,
  authApi,
  bindSession,
  clearSession,
  kycApi,
  playerApi,
  restoreSession,
  saveSession,
  setSessionListener,
} from './src/services/api';
import type {
  ApiBet,
  ApiMatch,
  AuthSession,
  KycState,
  PlayerNotifications,
  PlayerWallet,
} from './src/services/api';
import {
  profileStats,
  toBet,
  toLiveMatch,
  toMatchCard,
  toNotification,
  todayStats,
  toWalletRows,
} from './src/utils/feed';
import {emptyKycDraft} from './src/data/kyc';
import type {KycDraft} from './src/data/kyc';
import type {AppNotification} from './src/data/notifications';
import {toMobileDigits} from './src/utils/kyc';
import {
  displayDateToIso,
  getInitials,
  isoToDisplayDate,
  usernameToDisplayName,
} from './src/utils/profile';
import {colors} from './src/theme';

/** The name shown around the app: what the player set, or a friendlier version of their username. */
const resolveDisplayName = (user: AuthSession['user']) =>
  user.name || usernameToDisplayName(user.username);

type Route =
  | 'splash'
  | 'welcome'
  | 'login'
  | 'home'
  | 'match'
  | 'bets'
  | 'live'
  | 'wallet'
  | 'deposit'
  | 'withdraw'
  | 'profile'
  | 'editProfile'
  | 'referral'
  | 'notifications'
  | 'help'
  | 'settings'
  | 'privacy'
  | 'terms'
  | 'signup'
  | 'credentials'
  | 'kycIntro'
  | 'kycPersonal'
  | 'kycDocument'
  | 'kycReview'
  | 'kycStatus';

/** How often the live screens refetch odds, scores, bets and the wallet. */
const LIVE_REFRESH_MS = 10000;

/** Where a player lands after signing in: the KYC flow until they've submitted, else Home. */
const needsKycIntro = (user: AuthSession['user']) =>
  !user.kyc || user.kyc === 'Not Submitted';

/** Players whose KYC was submitted but isn't verified yet (under review / rejected) stay on the KYC status screen. */
const kycLocked = (user: AuthSession['user']) =>
  user.role === 'player' && (user.kyc === 'Pending' || user.kyc === 'Rejected');

const App = () => {
  const [route, setRoute] = useState<Route>('splash');
  /**
   * Screens left behind by `navigate`, newest last. Every Back — the header
   * arrow and Android's hardware button — pops this, so a screen reached from
   * two places returns to whichever one opened it.
   */
  const [history, setHistory] = useState<Route[]>([]);
  /** Credentials the user picked on sign-up, shown once on the next screen. */
  const [newAccount, setNewAccount] = useState({username: '', password: ''});
  /** The player's wallet (balance, available, ledger), as last fetched. */
  const [wallet, setWallet] = useState<PlayerWallet | null>(null);
  /** Live + upcoming matches with open markets. */
  const [matches, setMatches] = useState<ApiMatch[]>([]);
  /** The player's bets, newest first. */
  const [bets, setBets] = useState<ApiBet[]>([]);
  /** The player's notification feed and how much of it is unread (the bell's dot). */
  const [feed, setFeed] = useState<PlayerNotifications | null>(null);
  /** KYC status as the last wallet refresh reported it (the saved session can be behind). */
  const [serverKyc, setServerKyc] = useState<AuthSession['user']['kyc'] | null>(
    null,
  );
  /** Match opened on the detail screen. */
  const [matchId, setMatchId] = useState<string | null>(null);
  /** Name saved on Edit Profile, shown on Home and Profile. */
  const [displayName, setDisplayName] = useState<string | undefined>();
  /** Signed-in player + tokens, or null while signed out. Persisted via AsyncStorage. */
  const [session, setSession] = useState<AuthSession | null>(null);
  /** True until the session saved on a previous launch has been checked against the backend. */
  const [restoringSession, setRestoringSession] = useState(true);
  /** True once the splash animation itself has finished playing. */
  const [splashDone, setSplashDone] = useState(false);
  /** KYC answers collected across the three steps, kept until submit. */
  const [kycDraft, setKycDraft] = useState<KycDraft>(emptyKycDraft);
  /** The player's latest KYC status/submission, as last fetched. */
  const [kycState, setKycState] = useState<KycState | null>(null);
  const [kycBusy, setKycBusy] = useState(false);

  /** Opens `next` and remembers the current screen. */
  const navigate = useCallback(
    (next: Route) => {
      if (next === route) {
        return;
      }
      setHistory(prev => [...prev, route]);
      setRoute(next);
    },
    [route],
  );

  /** Opens `next` with an empty stack — for login, logout and sign-up. */
  const reset = useCallback((next: Route) => {
    setHistory([]);
    setRoute(next);
  }, []);

  /** Pops back to `target` if it's in the stack (the review screen's Edit links). */
  const popTo = useCallback(
    (target: Route) => {
      const index = history.lastIndexOf(target);
      if (index === -1) {
        navigate(target);
        return;
      }
      setHistory(history.slice(0, index));
      setRoute(target);
    },
    [history, navigate],
  );

  /** Returns false when there's nothing to pop, so Android can close the app. */
  const goBack = useCallback(() => {
    const previous = history[history.length - 1];
    if (!previous) {
      return false;
    }
    setHistory(prev => prev.slice(0, -1));
    setRoute(previous);
    return true;
  }, [history]);

  /** Refetches wallet, matches and bets; failures keep what's on screen. */
  const refreshPlayer = useCallback(async (active: AuthSession | null) => {
    if (!active || active.user.role !== 'player') {
      return;
    }
    const token = active.accessToken;
    const [nextWallet, nextMatches, nextBets, nextFeed] =
      await Promise.allSettled([
        playerApi.wallet(token),
        playerApi.matches(token),
        playerApi.bets(token),
        playerApi.notifications(token),
      ]);
    if (nextFeed.status === 'fulfilled') {
      setFeed(nextFeed.value);
    }
    if (nextWallet.status === 'fulfilled') {
      setWallet(nextWallet.value);
      setServerKyc(nextWallet.value.kyc);
    }
    if (nextMatches.status === 'fulfilled') {
      setMatches(nextMatches.value.matches);
    }
    if (nextBets.status === 'fulfilled') {
      setBets(nextBets.value.bets);
    }
  }, []);

  /** Whenever the signed-in player changes, load their data. */
  useEffect(() => {
    if (session) {
      refreshPlayer(session);
    } else {
      setWallet(null);
      setMatches([]);
      setBets([]);
      setFeed(null);
      setServerKyc(null);
    }
    // Only a different account (or sign-out) should refetch, not a token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user._id]);

  /** Money screens and the match list are refreshed each time they're opened. */
  useEffect(() => {
    if (
      session &&
      [
        'home',
        'live',
        'bets',
        'wallet',
        'withdraw',
        'match',
        'notifications',
      ].includes(route)
    ) {
      refreshPlayer(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  /**
   * Odds, scores, results and approvals change on the panel while the player
   * is looking at the app, so the live screens also refresh on their own
   * (and when the app comes back to the front).
   */
  const sessionRef = useRef(session);
  sessionRef.current = session;
  useEffect(() => {
    if (
      !session ||
      !['home', 'live', 'bets', 'wallet', 'match'].includes(route)
    ) {
      return undefined;
    }
    const tick = () => {
      if (AppState.currentState === 'active') {
        refreshPlayer(sessionRef.current);
      }
    };
    const timer = setInterval(tick, LIVE_REFRESH_MS);
    const wake = AppState.addEventListener('change', state => {
      if (state === 'active') {
        tick();
      }
    });
    return () => {
      clearInterval(timer);
      wake.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, session?.user._id]);

  const matchCards = useMemo(() => matches.map(toMatchCard), [matches]);
  const liveCards = useMemo(
    () => matches.filter(m => m.status === 'Live').map(toMatchCard),
    [matches],
  );
  const liveRail = useMemo(
    () => matches.filter(m => m.status === 'Live').map(toLiveMatch),
    [matches],
  );
  const betCards = useMemo(() => bets.map(toBet), [bets]);
  const notificationRows = useMemo(
    () => (feed?.notifications ?? []).map(row => toNotification(row)),
    [feed],
  );
  const walletRows = useMemo(
    () => (wallet ? toWalletRows(wallet.transactions, wallet.requests) : []),
    [wallet],
  );

  const openMatch = useCallback(
    (id: string) => {
      setMatchId(id);
      navigate('match');
    },
    [navigate],
  );

  /** Keeps the API client's token pair in step with the signed-in session. */
  useEffect(() => {
    bindSession(
      session
        ? {
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
          }
        : null,
    );
  }, [session]);

  /** The API client refreshes expired tokens by itself; the app just follows along. */
  useEffect(() => {
    setSessionListener({
      onRotate: tokens =>
        setSession(current => (current ? {...current, ...tokens} : current)),
      onExpire: reason => {
        clearSession().catch(() => {});
        setSession(null);
        reset('welcome');
        notify(
          reason === 'suspended'
            ? 'Aapka account suspend kar diya gaya hai. Apne agent se baat karo.'
            : 'Session khatam ho gaya, dobara login karo',
        );
      },
    });
    return () => setSessionListener(null);
  }, [reset]);

  /** Runs once on launch: is the session saved last time still valid? */
  useEffect(() => {
    restoreSession()
      .then(result => {
        setSession(result);
        if (result) {
          setDisplayName(resolveDisplayName(result.user));
        }
      })
      .finally(() => setRestoringSession(false));
  }, []);

  /** Starts the KYC form, pre-filling what the profile already knows. */
  const startKyc = useCallback(() => {
    const user = session?.user;
    setKycDraft(current => ({
      ...current,
      fullName: current.fullName || user?.name || '',
      phone: current.phone || toMobileDigits(user?.phone),
      dob: current.dob || isoToDisplayDate(user?.dob),
      city: current.city || user?.city || '',
      state: current.state || user?.state || '',
    }));
    navigate('kycPersonal');
  }, [session, navigate]);

  /** Fetches the latest KYC status; returns it (or null if the request failed). */
  const refreshKyc = useCallback(async (active: AuthSession) => {
    try {
      const next = await kycApi.me(active.accessToken);
      setKycState(next);
      if (next.kyc !== active.user.kyc) {
        const updated = {...active, user: {...active.user, kyc: next.kyc}};
        await saveSession(updated);
        setSession(updated);
      }
      return next;
    } catch (err) {
      notify(
        err instanceof ApiRequestError
          ? err.message
          : 'KYC status nahi mil paya',
      );
      return null;
    }
  }, []);

  /** Opens the right KYC screen for the current status (Profile menu / after login). */
  const openKyc = useCallback(
    async (active: AuthSession, fromSignIn = false) => {
      // The server's word first: the status may have changed since this
      // session was saved (reviewed on the panel, or sent from another phone).
      const next = await refreshKyc(active);
      const status = next?.kyc ?? active.user.kyc;
      if (needsKycIntro({...active.user, kyc: status})) {
        if (fromSignIn) {
          reset('kycIntro');
        } else {
          navigate('kycIntro');
        }
        return;
      }
      if (fromSignIn && next?.kyc === 'Verified') {
        reset('home');
      } else if (next?.submission) {
        if (fromSignIn) {
          // Nothing behind it: until KYC is verified the app itself stays closed.
          setHistory([]);
          setRoute('kycStatus');
        } else {
          navigate('kycStatus');
        }
      } else if (fromSignIn) {
        reset('home');
      }
    },
    [navigate, reset, refreshKyc],
  );

  /**
   * A review decided while the player is in the app: the session takes the
   * new status, and one that is now under review or rejected goes to the KYC
   * gate like it would on the next launch.
   */
  useEffect(() => {
    if (!session || !serverKyc || serverKyc === session.user.kyc) {
      return;
    }
    const updated = {...session, user: {...session.user, kyc: serverKyc}};
    saveSession(updated).catch(() => {});
    setSession(updated);
    if (kycLocked(updated.user) && !route.startsWith('kyc')) {
      openKyc(updated, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKyc]);

  /** Sends the user to Home, Welcome or the KYC gate once both the splash animation and the session check are done. */
  useEffect(() => {
    if (splashDone && !restoringSession) {
      if (session && kycLocked(session.user)) {
        // Re-checks the review — it may have been approved since the last launch.
        openKyc(session, true);
      } else {
        reset(session ? 'home' : 'welcome');
      }
    }
    // Only the splash/restore flags should retrigger this — not every session change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splashDone, restoringSession]);

  const submitKyc = useCallback(async () => {
    if (!session) {
      return;
    }
    const dob = displayDateToIso(kycDraft.dob);
    if (!dob || !kycDraft.front || !kycDraft.documentType) {
      notify('Kuch details missing hain, dobara check karo');
      return;
    }
    setKycBusy(true);
    try {
      const result = await kycApi.submit(session.accessToken, {
        fullName: kycDraft.fullName.trim(),
        phone: kycDraft.phone.trim(),
        dob,
        address: kycDraft.address.trim(),
        city: kycDraft.city.trim(),
        state: kycDraft.state.trim(),
        country: kycDraft.country.trim() || 'India',
        postalCode: kycDraft.postalCode.trim(),
        documentType: kycDraft.documentType,
        documentNumber: kycDraft.documentNumber.trim(),
        front: kycDraft.front,
        ...(kycDraft.back ? {back: kycDraft.back} : {}),
      });
      setKycState(result);
      const updated = {...session, user: {...session.user, kyc: result.kyc}};
      await saveSession(updated);
      setSession(updated);
      setKycDraft(emptyKycDraft);
      // The form is done and the app stays closed until KYC is verified,
      // so the confirmation has nothing behind it (Back exits the app).
      setHistory([]);
      setRoute('kycStatus');
    } catch (err) {
      notify(
        err instanceof ApiRequestError
          ? err.message
          : 'KYC submit nahi ho paya, dubara try karo',
      );
    } finally {
      setKycBusy(false);
    }
  }, [session, kycDraft]);

  const handleLogin = useCallback(
    async ({username, password}: {username: string; password: string}) => {
      try {
        const result = await authApi.login({username, password});
        await saveSession(result);
        setSession(result);
        setDisplayName(resolveDisplayName(result.user));
        // Players see the KYC flow until they're verified: the intro if not
        // submitted yet, else the status screen (under review / rejected).
        if (result.user.role === 'player' && result.user.kyc !== 'Verified') {
          await openKyc(result, true);
        } else {
          reset('home');
        }
      } catch (err) {
        // Shown under the Login button, in the app's own voice.
        if (err instanceof ApiRequestError) {
          if (err.status === 401) {
            return 'Username ya password galat hai';
          }
          if (err.status === 403) {
            return 'Aapka account suspend hai. Apne agent se baat karo.';
          }
          if (err.status === 429) {
            return 'Bahut zyada koshish ho gayi. Thodi der baad try karo.';
          }
          return err.message;
        }
        return 'Login fail ho gaya, dubara try karo';
      }
    },
    [reset, openKyc],
  );

  const handleSignup = useCallback(
    async ({
      username,
      password,
      referral,
    }: {
      username: string;
      password: string;
      referral: string;
    }) => {
      try {
        const result = await authApi.register({
          username,
          password,
          referralCode: referral || undefined,
        });
        await saveSession(result);
        setSession(result);
        setDisplayName(resolveDisplayName(result.user));
        setNewAccount({username: result.user.username, password});
        reset('credentials');
      } catch (err) {
        // Shown under the Account Banao button.
        return err instanceof ApiRequestError
          ? err.message
          : 'Account nahi ban paya, dubara try karo';
      }
    },
    [reset],
  );

  const handleLogout = useCallback(() => {
    if (session) {
      authApi.logout(session.refreshToken, session.accessToken).catch(() => {
        // Best-effort: the local session is cleared regardless.
      });
    }
    clearSession().catch(() => {});
    setSession(null);
    setDisplayName(undefined);
    reset('welcome');
  }, [session, reset]);

  const handleSaveProfile = useCallback(
    async (values: Record<string, string>) => {
      if (!session) {
        return;
      }
      const dob = displayDateToIso(values.dob ?? '');
      try {
        const result = await authApi.updateProfile(session.accessToken, {
          name: values.name,
          email: values.email,
          city: values.city,
          // Left as free text that didn't parse (e.g. still mid-edit) rather than sent as garbage.
          ...(dob ? {dob} : {}),
          // '' means "no photo" and is a valid, idempotent value to send.
          ...(values.avatar !== undefined ? {avatar: values.avatar} : {}),
        });
        const nextSession = {...session, user: result.user};
        await saveSession(nextSession);
        setSession(nextSession);
        setDisplayName(resolveDisplayName(result.user));
        notify('Profile save ho gaya');
        goBack();
      } catch (err) {
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Profile save nahi ho paya, dubara try karo',
        );
      }
    },
    [session, goBack],
  );

  /** Android hardware back — without this, every screen exits the app. */
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      goBack,
    );
    return () => subscription.remove();
  }, [goBack]);

  /** A tapped notification is marked read and opens what it's about. */
  const openNotification = useCallback(
    (item: AppNotification) => {
      if (!session) {
        return;
      }
      if (item.unread) {
        setFeed(prev =>
          prev
            ? {
                unreadCount: Math.max(0, prev.unreadCount - 1),
                notifications: prev.notifications.map(row =>
                  row._id === item.id ? {...row, unread: false} : row,
                ),
              }
            : prev,
        );
        playerApi
          .readNotification(session.accessToken, item.id)
          .then(setFeed)
          .catch(() => {
            // Stays unread on the server; the next refresh shows it again.
          });
      }
      if (item.link === 'kyc') {
        openKyc(session);
      } else if (item.link) {
        navigate(item.link);
      }
    },
    [session, navigate, openKyc],
  );

  /** Bottom-nav taps that map to a built screen. */
  const handleNav = useCallback(
    (key: string) => {
      const routes: Record<string, Route> = {
        home: 'home',
        live: 'live',
        bets: 'bets',
        wallet: 'wallet',
        profile: 'profile',
      };
      const next = routes[key];
      if (next) {
        navigate(next);
      }
    },
    [navigate],
  );

  /** Help / Privacy / Terms links, opened from the login footer and Settings. */
  const openLink = useCallback(
    (link: string) => {
      const routes: Record<string, Route> = {
        Help: 'help',
        Privacy: 'privacy',
        'Privacy Policy': 'privacy',
        Terms: 'terms',
        'Terms & Conditions': 'terms',
      };
      const next = routes[link];
      if (next) {
        navigate(next);
      }
    },
    [navigate],
  );

  /** Profile menu rows that map to a built screen. */
  const handleProfileMenu = useCallback(
    (id: string) => {
      const routes: Record<string, Route> = {
        edit: 'editProfile',
        bets: 'bets',
        wallet: 'wallet',
        referral: 'referral',
        notifications: 'notifications',
        help: 'help',
        settings: 'settings',
      };
      if (id === 'kyc') {
        if (session) {
          openKyc(session);
        }
        return;
      }
      const next = routes[id];
      if (next) {
        navigate(next);
      }
    },
    [navigate, openKyc, session],
  );

  /** Places a bet on the backend; the stake is held until the market settles. */
  const placeBet = useCallback(
    async (bet: {marketId: string; selection: string; stake: number}) => {
      if (!session) {
        return false;
      }
      try {
        const result = await playerApi.placeBet(session.accessToken, bet);
        setWallet(result.wallet);
        await refreshPlayer(session);
        notify('Bet lag gaya — My Bets mein dekho');
        return true;
      } catch (err) {
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Bet nahi lag paya, dubara try karo',
        );
        return false;
      }
    },
    [session, refreshPlayer],
  );

  const cashOut = useCallback(
    async (bet: Bet) => {
      if (!session) {
        return false;
      }
      try {
        const result = await playerApi.cashOut(session.accessToken, bet.id);
        setWallet(result.wallet);
        await refreshPlayer(session);
        notify(`Cash out ho gaya — ${formatRupees(result.offer)} settle hua`);
        return true;
      } catch (err) {
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Cash out nahi ho paya, dubara try karo',
        );
        await refreshPlayer(session);
        return false;
      }
    },
    [session, refreshPlayer],
  );

  /** Files a deposit / withdrawal request; resolves to its reference for the receipt. */
  const requestFunds = useCallback(
    async (
      kind: 'deposit' | 'withdrawal',
      payload: {
        amount: number;
        method: string;
        reference: string;
        proof?: {name: string; data: string};
      },
    ) => {
      if (!session) {
        return null;
      }
      try {
        const result = await playerApi.requestFunds(session.accessToken, {
          kind,
          ...payload,
        });
        setWallet(result.wallet);
        // A deposit's receipt shows the UTR the player typed; a withdrawal's
        // "reference" is where to pay, so its receipt gets the request's own id.
        const requestId = `${
          kind === 'deposit' ? 'DEP' : 'WIT'
        }${result.request._id.slice(-8).toUpperCase()}`;
        return kind === 'deposit'
          ? result.request.reference || requestId
          : requestId;
      } catch (err) {
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Request nahi ja paya, dubara try karo',
        );
        return null;
      }
    },
    [session],
  );

  const refreshNow = useCallback(
    () => refreshPlayer(session),
    [session, refreshPlayer],
  );

  /**
   * "Back to Wallet" after a deposit / withdrawal: lands on Wallet wherever
   * the flow was opened from (Home's card or the Wallet tab), so the request
   * just filed is on screen.
   */
  const finishToWallet = useCallback(() => {
    setHistory(prev =>
      prev[prev.length - 1] === 'wallet' ? prev.slice(0, -1) : prev,
    );
    setRoute('wallet');
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!session) {
      return;
    }
    // Clears the dots straight away; the server's answer then replaces the list.
    setFeed(prev =>
      prev
        ? {
            unreadCount: 0,
            notifications: prev.notifications.map(row => ({
              ...row,
              unread: false,
            })),
          }
        : prev,
    );
    try {
      setFeed(await playerApi.readAllNotifications(session.accessToken));
    } catch {
      notify('Notifications update nahi ho paye, dubara try karo');
      refreshPlayer(session);
    }
  }, [session, refreshPlayer]);

  /** Saves one Settings switch on the account, so it holds on every device. */
  const togglePreference = useCallback(
    async (id: string, value: boolean) => {
      if (!session) {
        return false;
      }
      try {
        const result = await authApi.updateProfile(session.accessToken, {
          preferences: {[id]: value},
        });
        const nextSession = {...session, user: result.user};
        await saveSession(nextSession);
        setSession(nextSession);
        return true;
      } catch (err) {
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Setting save nahi ho payi, dubara try karo',
        );
        return false;
      }
    },
    [session],
  );

  /** Tab screens are roots until something pushes them, so their arrow is optional. */
  const backFromTab = history.length > 0 ? goBack : undefined;

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        {/* The whole design is dark, so light content on both platforms. */}
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.bgBase}
          translucent={false}
        />
        {route === 'splash' ? (
          <SplashScreen onFinish={() => setSplashDone(true)} />
        ) : null}
        {route === 'welcome' ? (
          <WelcomeScreen
            onLogin={() => navigate('login')}
            onCreateAccount={() => navigate('signup')}
            onPressTerms={() => navigate('terms')}
            onPressPrivacy={() => navigate('privacy')}
          />
        ) : null}
        {route === 'signup' ? (
          <SignUpScreen
            onBack={goBack}
            onLogin={() => navigate('login')}
            onOpenLink={openLink}
            onSubmit={handleSignup}
          />
        ) : null}
        {route === 'credentials' ? (
          <CredentialsScreen
            username={newAccount.username}
            password={newAccount.password}
            // A brand-new account always starts KYC right after saving its credentials.
            onContinue={() => reset('kycIntro')}
          />
        ) : null}
        {route === 'login' ? (
          <LoginScreen
            onBack={goBack}
            onSubmit={handleLogin}
            onOpenLink={openLink}
            onCreateAccount={() => navigate('signup')}
          />
        ) : null}
        {route === 'home' ? (
          <HomeScreen
            userName={displayName}
            matches={matchCards}
            liveMatches={liveRail}
            walletStats={todayStats(bets)}
            onOpenMatch={openMatch}
            balance={formatRupees(wallet?.balance ?? 0)}
            onDeposit={() => navigate('deposit')}
            onWithdraw={() => navigate('withdraw')}
            // Both rails open the Live feed — it's the only full match list built.
            onSeeAll={() => navigate('live')}
            onOpenNotifications={() => navigate('notifications')}
            hasUnread={(feed?.unreadCount ?? 0) > 0}
            onOpenReferral={() => navigate('referral')}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'match' ? (
          <MatchScreen
            key={matchId ?? 'none'}
            match={matches.find(m => m._id === matchId) ?? null}
            balance={wallet?.available ?? 0}
            kycVerified={(wallet?.kyc ?? session?.user.kyc) === 'Verified'}
            onOpenKyc={() => session && openKyc(session)}
            onBack={goBack}
            onPlaceBet={placeBet}
          />
        ) : null}
        {route === 'bets' ? (
          <MyBetsScreen
            activeNavKey="bets"
            bets={betCards}
            onBack={backFromTab}
            onCashOut={cashOut}
            onRefresh={refreshNow}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'live' ? (
          <LiveScreen
            matches={liveCards}
            onOpenMatch={openMatch}
            onBack={backFromTab}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'wallet' ? (
          <WalletScreen
            wallet={wallet}
            transactions={walletRows}
            onRefresh={refreshNow}
            onBack={backFromTab}
            onDeposit={() => navigate('deposit')}
            onWithdraw={() => navigate('withdraw')}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'deposit' ? (
          <DepositScreen
            minDeposit={wallet?.minDeposit}
            maxDeposit={wallet?.maxDeposit}
            onBack={goBack}
            onSubmit={payload => requestFunds('deposit', payload)}
            onDone={finishToWallet}
          />
        ) : null}
        {route === 'withdraw' ? (
          <WithdrawScreen
            available={wallet?.available ?? 0}
            minWithdrawal={wallet?.minWithdrawal}
            maxWithdrawal={wallet?.maxWithdrawal}
            kycVerified={(wallet?.kyc ?? session?.user.kyc) === 'Verified'}
            onOpenKyc={() => session && openKyc(session)}
            onBack={goBack}
            onSubmit={payload => requestFunds('withdrawal', payload)}
            onDone={finishToWallet}
          />
        ) : null}
        {route === 'profile' ? (
          <ProfileScreen
            kycVerified={(wallet?.kyc ?? session?.user.kyc) === 'Verified'}
            name={displayName}
            initials={getInitials(
              displayName,
              session?.user.username.slice(0, 2).toUpperCase(),
            )}
            phone={session?.user.phone}
            referralCode={session?.user.referralCode}
            avatarPhoto={session?.user.avatar}
            stats={profileStats(bets)}
            onBack={backFromTab}
            onOpen={handleProfileMenu}
            onLogout={handleLogout}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'editProfile' ? (
          <EditProfileScreen
            onBack={goBack}
            onSave={handleSaveProfile}
            initialValues={{
              name: displayName ?? '',
              email: session?.user.email ?? '',
              dob: isoToDisplayDate(session?.user.dob),
              city: session?.user.city ?? '',
            }}
            phone={session?.user.phone}
            avatarInitials={getInitials(
              displayName,
              session?.user.username.slice(0, 2).toUpperCase(),
            )}
            avatarPhoto={session?.user.avatar}
          />
        ) : null}
        {route === 'referral' ? (
          <ReferralScreen
            referralCode={session?.user.referralCode}
            onBack={goBack}
          />
        ) : null}
        {route === 'notifications' ? (
          <NotificationsScreen
            notifications={notificationRows}
            onBack={goBack}
            onOpen={openNotification}
            onMarkAllRead={markAllNotificationsRead}
            onRefresh={refreshNow}
          />
        ) : null}
        {route === 'help' ? <HelpScreen onBack={goBack} /> : null}
        {route === 'settings' ? (
          <SettingsScreen
            preferences={session?.user.preferences}
            onTogglePreference={togglePreference}
            onBack={goBack}
            onLogout={handleLogout}
            onOpenLink={openLink}
          />
        ) : null}
        {route === 'kycIntro' ? (
          <KycIntroScreen onStart={startKyc} onLater={() => reset('home')} />
        ) : null}
        {route === 'kycPersonal' ? (
          <KycPersonalScreen
            draft={kycDraft}
            onChange={patch => setKycDraft(current => ({...current, ...patch}))}
            onBack={goBack}
            onContinue={() => navigate('kycDocument')}
          />
        ) : null}
        {route === 'kycDocument' ? (
          <KycDocumentScreen
            draft={kycDraft}
            onChange={patch => setKycDraft(current => ({...current, ...patch}))}
            onBack={goBack}
            onReview={() => navigate('kycReview')}
          />
        ) : null}
        {route === 'kycReview' ? (
          <KycReviewScreen
            draft={kycDraft}
            submitting={kycBusy}
            onBack={goBack}
            onEditPersonal={() => popTo('kycPersonal')}
            onEditDocument={() => popTo('kycDocument')}
            onOpenLink={openLink}
            onSubmit={submitKyc}
          />
        ) : null}
        {route === 'kycStatus' && kycState?.submission ? (
          <KycStatusScreen
            submission={kycState.submission}
            checking={kycBusy}
            onCheckStatus={async () => {
              if (!session) {
                return;
              }
              setKycBusy(true);
              const next = await refreshKyc(session);
              setKycBusy(false);
              if (next?.submission) {
                notify(
                  `KYC status: ${next.submission.status === 'Pending' ? 'Under Review' : next.submission.status}`,
                );
              }
            }}
            onGoToApp={() => reset('home')}
            onResubmit={startKyc}
          />
        ) : null}
        {route === 'privacy' ? (
          <LegalScreen document={privacyPolicy} onBack={goBack} />
        ) : null}
        {route === 'terms' ? (
          <LegalScreen document={termsConditions} onBack={goBack} />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
});

export default App;
