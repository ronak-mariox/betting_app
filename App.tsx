import React, {useCallback, useEffect, useState} from 'react';
import {BackHandler, StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CredentialsScreen} from './src/screens/CredentialsScreen';
import {DepositScreen} from './src/screens/DepositScreen';
import {EditProfileScreen} from './src/screens/EditProfileScreen';
import {HelpScreen} from './src/screens/HelpScreen';
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
import {formatRupees, walletBalance} from './src/data/betSlip';
import {notify} from './src/utils/actions';
import {
  ApiRequestError,
  authApi,
  clearSession,
  restoreSession,
  saveSession,
} from './src/services/api';
import type {AuthSession} from './src/services/api';
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
  | 'credentials';

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
  /**
   * Demo wallet: no backend yet, so deposits, withdrawals, stakes and
   * cash-outs move this number and every screen reads it.
   */
  const [balance, setBalance] = useState(walletBalance);
  /** Bets placed this session — they show up on top of the mock ones. */
  const [placedBets, setPlacedBets] = useState<Bet[]>([]);
  /** Name saved on Edit Profile, shown on Home and Profile. */
  const [displayName, setDisplayName] = useState<string | undefined>();
  /** Signed-in player + tokens, or null while signed out. Persisted via AsyncStorage. */
  const [session, setSession] = useState<AuthSession | null>(null);
  /** True until the session saved on a previous launch has been checked against the backend. */
  const [restoringSession, setRestoringSession] = useState(true);
  /** True once the splash animation itself has finished playing. */
  const [splashDone, setSplashDone] = useState(false);

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

  /** Sends the user to Home or Welcome once both the splash animation and the session check are done. */
  useEffect(() => {
    if (splashDone && !restoringSession) {
      reset(session ? 'home' : 'welcome');
    }
    // Only the splash/restore flags should retrigger this — not every session change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splashDone, restoringSession]);

  const handleLogin = useCallback(
    async ({username, password}: {username: string; password: string}) => {
      try {
        const result = await authApi.login({username, password});
        await saveSession(result);
        setSession(result);
        setDisplayName(resolveDisplayName(result.user));
        reset('home');
      } catch (err) {
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Login fail ho gaya, dubara try karo',
        );
      }
    },
    [reset],
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
        notify(
          err instanceof ApiRequestError
            ? err.message
            : 'Account nahi ban paya, dubara try karo',
        );
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
      const next = routes[id];
      if (next) {
        navigate(next);
      }
    },
    [navigate],
  );

  /** Records a confirmed bet and takes the stake out of the demo wallet. */
  const placeBet = useCallback(
    (bet: {match: string; selection: string; odds: number; stake: number}) => {
      setBalance(current => Math.max(0, current - bet.stake));
      setPlacedBets(current => [
        {
          id: `BET${900 + current.length}`,
          status: 'open',
          cashOut: Math.round(bet.stake * bet.odds * 0.9),
          ...bet,
        },
        ...current,
      ]);
    },
    [],
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
            onContinue={() => reset('home')}
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
            onOpenMatch={() => navigate('match')}
            balance={formatRupees(balance)}
            onDeposit={() => navigate('deposit')}
            onWithdraw={() => navigate('withdraw')}
            // Both rails open the Live feed — it's the only full match list built.
            onSeeAll={() => navigate('live')}
            onOpenNotifications={() => navigate('notifications')}
            onOpenReferral={() => navigate('referral')}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'match' ? (
          <MatchScreen
            balance={balance}
            onBack={goBack}
            onPlaceBet={placeBet}
          />
        ) : null}
        {route === 'bets' ? (
          <MyBetsScreen
            activeNavKey="bets"
            placedBets={placedBets}
            onBack={backFromTab}
            onCashOut={bet => {
              setBalance(current => current + (bet.cashOut ?? bet.stake));
              setPlacedBets(current => current.filter(b => b.id !== bet.id));
              notify(
                `${formatRupees(bet.cashOut ?? bet.stake)} wallet mein aa gaye`,
              );
            }}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'live' ? (
          <LiveScreen
            onOpenMatch={() => navigate('match')}
            onBack={backFromTab}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'wallet' ? (
          <WalletScreen
            balance={formatRupees(balance)}
            onBack={backFromTab}
            onDeposit={() => navigate('deposit')}
            onWithdraw={() => navigate('withdraw')}
            onChangeNav={handleNav}
          />
        ) : null}
        {route === 'deposit' ? (
          <DepositScreen
            onBack={goBack}
            onDone={amount => {
              setBalance(current => current + amount);
              goBack();
            }}
          />
        ) : null}
        {route === 'withdraw' ? (
          <WithdrawScreen
            onBack={goBack}
            onDone={amount => {
              setBalance(current => Math.max(0, current - amount));
              goBack();
            }}
          />
        ) : null}
        {route === 'profile' ? (
          <ProfileScreen
            name={displayName}
            initials={getInitials(
              displayName,
              session?.user.username.slice(0, 2).toUpperCase(),
            )}
            phone={session?.user.phone}
            referralCode={session?.user.referralCode}
            avatarPhoto={session?.user.avatar}
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
        {route === 'referral' ? <ReferralScreen onBack={goBack} /> : null}
        {route === 'notifications' ? (
          <NotificationsScreen onBack={goBack} />
        ) : null}
        {route === 'help' ? <HelpScreen onBack={goBack} /> : null}
        {route === 'settings' ? (
          <SettingsScreen
            onBack={goBack}
            onLogout={handleLogout}
            onOpenLink={openLink}
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
