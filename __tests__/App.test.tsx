/**
 * Smoke tests: both screens must mount and expose the copy from the Figma frames.
 */
import React from 'react';
import {Alert} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import renderer, {ReactTestRenderer, act} from 'react-test-renderer';
import {HomeScreen} from '../src/screens/HomeScreen';
import {BetSlipSheet} from '../src/screens/BetSlipSheet';
import {DepositScreen} from '../src/screens/DepositScreen';
import {LiveScreen} from '../src/screens/LiveScreen';
import {EditProfileScreen} from '../src/screens/EditProfileScreen';
import {HelpScreen} from '../src/screens/HelpScreen';
import {LegalScreen} from '../src/screens/LegalScreen';
import {privacyPolicy, termsConditions} from '../src/data/legal';
import {NotificationsScreen} from '../src/screens/NotificationsScreen';
import {ProfileScreen} from '../src/screens/ProfileScreen';
import {ReferralScreen} from '../src/screens/ReferralScreen';
import {CredentialsScreen} from '../src/screens/CredentialsScreen';
import {SettingsScreen} from '../src/screens/SettingsScreen';
import {SignUpScreen} from '../src/screens/SignUpScreen';
import {WalletScreen} from '../src/screens/WalletScreen';
import {WithdrawScreen} from '../src/screens/WithdrawScreen';
import {LoginScreen} from '../src/screens/LoginScreen';
import {MatchScreen} from '../src/screens/MatchScreen';
import {MyBetsScreen} from '../src/screens/MyBetsScreen';
import {SplashScreen} from '../src/screens/SplashScreen';
import {WelcomeScreen} from '../src/screens/WelcomeScreen';
import type {ApiBet, ApiMatch, PlayerWallet} from '../src/services/api';
import {
  profileStats,
  toBet,
  toLiveMatch,
  toMatchCard,
  timeAgo,
  todayStats,
  toWalletRows,
} from '../src/utils/feed';

/* Fixtures shaped exactly like the backend's /api/player responses. */
const at = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const LIVE: ApiMatch = {
  _id: 'm1',
  sport: 'Cricket',
  emoji: '🏏',
  league: 'IPL',
  name: 'Mumbai Indians vs Chennai Super Kings',
  home: 'Mumbai Indians',
  away: 'Chennai Super Kings',
  score: '142/3 (16.2)',
  status: 'Live',
  startTime: at(-1),
  markets: [
    {
      _id: 'mk1',
      name: 'Match Odds',
      type: 'Match Odds',
      maxBet: 50000,
      runners: [
        {name: 'Mumbai Indians', odds: 1.85},
        {name: 'Chennai Super Kings', odds: 2.05},
      ],
    },
    {
      _id: 'mk2',
      name: 'Bookmaker',
      type: 'Bookmaker',
      maxBet: 25000,
      runners: [
        {name: 'Mumbai Indians', odds: 1.9},
        {name: 'Chennai Super Kings', odds: 2.1},
      ],
    },
  ],
};

const UPCOMING: ApiMatch = {
  _id: 'm2',
  sport: 'Football',
  emoji: '⚽',
  league: 'Premier League',
  name: 'Arsenal vs Chelsea',
  home: 'Arsenal',
  away: 'Chelsea',
  score: '',
  status: 'Upcoming',
  startTime: at(3),
  markets: [
    {
      _id: 'mk3',
      name: 'Match Odds',
      type: 'Match Odds',
      maxBet: 50000,
      runners: [
        {name: 'Arsenal', odds: 2.4},
        {name: 'Chelsea', odds: 2.9},
        {name: 'Draw', odds: 3.2},
      ],
    },
  ],
};

const bet = (over: Partial<ApiBet> & {_id: string}): ApiBet => ({
  match: LIVE.name,
  market: 'Match Odds',
  selection: 'Mumbai Indians',
  odds: 1.85,
  stake: 1000,
  status: 'Pending',
  payout: 0,
  placedAt: at(0),
  settledAt: null,
  cashOut: 950,
  ...over,
});

const BETS: ApiBet[] = [
  bet({_id: '64f00000000000000000aa01'}),
  bet({
    _id: '64f00000000000000000aa02',
    selection: 'Chennai Super Kings',
    odds: 2.1,
    stake: 2000,
    cashOut: 3800,
  }),
  bet({
    _id: '64f00000000000000000aa03',
    match: 'Djokovic vs Alcaraz',
    selection: 'Djokovic',
    odds: 1.5,
    status: 'Won',
    payout: 1500,
    settledAt: at(0),
    cashOut: null,
  }),
  bet({
    _id: '64f00000000000000000aa04',
    match: 'Djokovic vs Alcaraz',
    selection: 'Alcaraz',
    odds: 2.6,
    status: 'Lost',
    payout: 0,
    settledAt: at(0),
    cashOut: null,
  }),
];

const WALLET: PlayerWallet = {
  balance: 5500,
  openStake: 3000,
  pendingWithdrawal: 2000,
  available: 500,
  wonToday: 500,
  kyc: 'Verified',
  minDeposit: 100,
  maxDeposit: 500000,
  minWithdrawal: 500,
  maxWithdrawal: 200000,
  transactions: [
    {
      _id: 't1',
      type: 'Deposit',
      amount: 5000,
      method: 'UPI',
      reference: 'UPI5000',
      status: 'Completed',
      note: '',
      createdAt: at(-2),
    },
    {
      _id: 't2',
      type: 'Bet Win',
      amount: 500,
      method: '',
      reference: '',
      status: 'Completed',
      note: '',
      createdAt: at(-1),
    },
  ],
  requests: [
    {
      _id: 'r1',
      kind: 'withdrawal',
      amount: 2000,
      method: 'Bank Transfer',
      reference: '',
      status: 'Pending',
      createdAt: at(0),
    },
  ],
};

const homeProps = {
  matches: [LIVE, UPCOMING].map(toMatchCard),
  liveMatches: [toLiveMatch(LIVE)],
  walletStats: todayStats(BETS),
  balance: '₹5,500',
  userName: 'Rahul Verma',
};

/**
 * Collects every rendered string. Interpolated <Text> children arrive as
 * separate nodes, so segments are joined with a space.
 */
const renderedText = (tree: ReactTestRenderer): string =>
  tree.root
    .findAllByType('Text' as never, {deep: true})
    .flatMap(
      node => node.children.filter(c => typeof c === 'string') as string[],
    )
    .join(' ');

const mount = (element: React.ReactElement): ReactTestRenderer => {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

describe('BetPro screens', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the splash screen with the wordmark and tagline', () => {
    const tree = mount(<SplashScreen />);
    const text = renderedText(tree);

    expect(text).toContain('BetPro');
    expect(text).toContain('PREMIUM BETTING');
    expect(text).toContain('Loading...');

    act(() => tree.unmount());
  });

  it('renders the welcome screen with the feature grid and both CTAs', () => {
    const tree = mount(<WelcomeScreen />);
    const text = renderedText(tree);

    expect(text).toContain('BetPro');
    expect(text).toContain('The smartest way to bet');

    // All four feature tiles
    expect(text).toContain('Fast Betting');
    expect(text).toContain('Secure Wallet');
    expect(text).toContain('Live Odds');
    expect(text).toContain('Big Wins');

    // CTAs + terms
    expect(text).toContain('Login');
    expect(text).toContain('Create Account');
    expect(text).toContain('Terms');
    expect(text).toContain('Privacy');

    act(() => tree.unmount());
  });

  it('renders the login screen and gates the CTA until both fields are filled', () => {
    const tree = mount(<LoginScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Login Karo');
    expect(text).toContain('Apna username aur password daalo');
    expect(text).toContain('Username');
    expect(text).toContain('Password');
    expect(text).toContain('Username/Password kahan se milega?');
    expect(text).toContain('Account Banao');
    expect(text).toContain('Help');

    // The submit button starts disabled, matching the 40% CTA in Figma.
    const submit = tree.root
      .findAll(node => node.props?.accessibilityRole === 'button')
      .find(node => node.props?.accessibilityLabel === 'Login Karo');
    expect(submit?.props.accessibilityState).toEqual({disabled: true});

    // Filling both inputs enables it.
    const inputs = tree.root.findAllByType('TextInput' as never);
    expect(inputs).toHaveLength(2);
    act(() => {
      inputs[0].props.onChangeText('rahul_2847');
      inputs[1].props.onChangeText('hunter2');
    });

    const enabled = tree.root
      .findAll(node => node.props?.accessibilityRole === 'button')
      .find(node => node.props?.accessibilityLabel === 'Login Karo');
    expect(enabled?.props.accessibilityState).toEqual({disabled: false});

    act(() => tree.unmount());
  });

  it('renders the home screen with wallet, live rail and match cards', () => {
    const tree = mount(<HomeScreen {...homeProps} />);
    const text = renderedText(tree);

    // Header + wallet
    expect(text).toContain('Rahul Verma');
    expect(text).toContain('₹5,500');
    expect(text).toContain('Deposit');
    expect(text).toContain('Withdraw');
    // Today's figures come from the bets: 4 placed, +₹500 won, -₹1,000 lost
    expect(text).toContain("Today's Bets");
    expect(text).toContain('+₹500');
    expect(text).toContain('-₹1,000');

    // Live rail
    expect(text).toContain('Live Now');
    expect(text).toContain('Mumbai Indians');
    expect(text).toContain('Chennai Super Kings');
    expect(text).toContain('Invite Friends');

    // Match cards — live and upcoming variants, real odds
    expect(text).toContain('16.2 Ov');
    expect(text).toContain('HOME WIN');
    expect(text).toContain('1.85');
    expect(text).toContain('Arsenal');
    expect(text).toContain('2.40');
    expect(text).toContain('VS');

    // Bottom nav
    expect(text).toContain('My Bets');

    act(() => tree.unmount());
  });

  it('fires the wallet card deposit / withdraw from home', () => {
    const pressed: string[] = [];
    const tree = mount(
      <HomeScreen
        onDeposit={() => pressed.push('deposit')}
        onWithdraw={() => pressed.push('withdraw')}
      />,
    );

    for (const label of ['Deposit', 'Withdraw']) {
      const button = tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');
      act(() => button?.props.onPress());
    }

    expect(pressed).toEqual(['deposit', 'withdraw']);

    act(() => tree.unmount());
  });

  it('fires See All / View All from the home section headers', () => {
    const sections: string[] = [];
    const tree = mount(
      <HomeScreen onSeeAll={section => sections.push(section)} />,
    );

    for (const label of ['See All', 'View All']) {
      const link = tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');
      act(() => link?.props.onPress());
    }

    expect(sections).toEqual(['live', 'matches']);

    act(() => tree.unmount());
  });

  it('opens a match from the live rail and referral from the invite card', () => {
    const opened: string[] = [];
    let referrals = 0;
    const tree = mount(
      <HomeScreen
        {...homeProps}
        onOpenMatch={id => opened.push(id)}
        onOpenReferral={() => (referrals += 1)}
      />,
    );

    // A card in the horizontal "Live Now" rail
    const liveCard = tree.root
      .findAll(
        node =>
          node.props?.accessibilityLabel ===
          'Mumbai Indians vs Chennai Super Kings',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => liveCard?.props.onPress());

    const invite = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Invite')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => invite?.props.onPress());

    expect(opened[0]).toBe('m1');
    expect(referrals).toBe(1);

    act(() => tree.unmount());
  });

  it('hides and restores the wallet balance from the eye toggle', () => {
    const tree = mount(<HomeScreen {...homeProps} />);
    expect(renderedText(tree)).toContain('₹5,500');

    const eye = (label: string) =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');

    act(() => eye('Hide wallet balance')?.props.onPress());
    expect(renderedText(tree)).not.toContain('₹5,500');

    act(() => eye('Show wallet balance')?.props.onPress());
    expect(renderedText(tree)).toContain('₹5,500');

    act(() => tree.unmount());
  });

  it('places a bet from the match screen and lists it in My Bets', async () => {
    const placed: Array<{marketId: string; selection: string; stake: number}> =
      [];
    const match = mount(
      <MatchScreen
        match={LIVE}
        balance={4500}
        onPlaceBet={async next => {
          placed.push(next);
          return true;
        }}
      />,
    );

    const odds = match.root
      .findAll(node =>
        String(node.props?.accessibilityLabel ?? '').startsWith(
          'Chennai Super Kings at',
        ),
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => odds?.props.onPress());

    // The slip opens on that selection, with the real match and available balance
    const slip = renderedText(match);
    expect(slip).toContain('Chennai Super Kings');
    expect(slip).toContain('2.05');
    expect(slip).toContain('₹4,500');

    const confirm = match.root
      .findAll(node => node.props?.accessibilityLabel === 'Confirm Bet')
      .find(node => typeof node.props?.onPress === 'function');
    await act(async () => {
      await confirm?.props.onPress();
    });

    expect(placed).toEqual([
      {marketId: 'mk1', selection: 'Chennai Super Kings', stake: 500},
    ]);
    act(() => match.unmount());

    // The refetched bet shows up in My Bets
    const bets = mount(
      <MyBetsScreen
        bets={[
          toBet(
            bet({
              _id: '64f00000000000000000bb90',
              selection: 'Chennai Super Kings',
              odds: 2.05,
              stake: 500,
            }),
          ),
        ]}
      />,
    );
    expect(renderedText(bets)).toContain('BET00BB90');
    expect(renderedText(bets)).toContain('Open (1)');

    act(() => bets.unmount());
  });

  it('opens notifications from the home header bell', () => {
    let opened = 0;
    const tree = mount(
      <HomeScreen onOpenNotifications={() => (opened += 1)} />,
    );

    const bell = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Notifications')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => bell?.props.onPress());

    expect(opened).toBe(1);

    act(() => tree.unmount());
  });

  it('opens the search overlay from the home header', () => {
    const opened: string[] = [];
    const tree = mount(
      <HomeScreen {...homeProps} onOpenMatch={id => opened.push(id)} />,
    );
    expect(renderedText(tree)).not.toContain('Cancel');

    const search = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Search')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => search?.props.onPress());

    const text = renderedText(tree);
    expect(text).toContain('Cancel');
    // Suggestions are the matches on offer
    expect(text).toContain('Arsenal vs Chelsea');

    const suggestion = tree.root
      .findAll(node => typeof node.props?.onPress === 'function')
      .find(node =>
        node
          .findAllByType('Text' as never)
          .some(t => t.children.includes('Arsenal vs Chelsea')),
      );
    act(() => suggestion?.props.onPress());
    expect(opened).toEqual(['m2']);

    act(() => tree.unmount());
  });

  it('keeps the bet slip closed until KYC is verified', () => {
    let kycOpened = 0;
    const tree = mount(
      <MatchScreen
        match={LIVE}
        balance={4500}
        kycVerified={false}
        onOpenKyc={() => (kycOpened += 1)}
      />,
    );
    // Prices stay visible, with the reason betting is closed
    expect(renderedText(tree)).toContain('1.85');
    expect(renderedText(tree)).toContain(
      'Bet lagane ke liye KYC verified hona zaroori hai',
    );

    const odds = tree.root
      .findAll(node =>
        String(node.props?.accessibilityLabel ?? '').startsWith(
          'Mumbai Indians at',
        ),
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => odds?.props.onPress());
    // Tapping a price leads to KYC, not to the slip
    expect(kycOpened).toBe(1);
    expect(
      tree.root.findAll(
        node => node.props?.accessibilityLabel === 'Confirm Bet',
      ),
    ).toHaveLength(0);

    act(() => tree.unmount());
  });

  it('renders the match screen with scoreboard and markets', () => {
    const tree = mount(<MatchScreen match={LIVE} balance={4500} />);
    const text = renderedText(tree);

    expect(text).toContain('Mumbai Indians vs Chennai Super Kings');
    expect(text).toContain('142/3');
    expect(text).toContain('16.2 Ov');

    // Market tabs from the backend
    expect(text).toContain('Match Odds');
    expect(text).toContain('Bookmaker');
    expect(text).toContain('1.85');
    expect(text).toContain('Max stake');
    expect(text).toContain('₹50,000');

    // Switching market shows its own prices
    const bookmaker = tree.root
      .findAll(node => node.props?.accessibilityRole === 'tab')
      .find(
        node =>
          typeof node.props?.onPress === 'function' &&
          !node.props.accessibilityState?.selected,
      );
    act(() => bookmaker?.props.onPress());
    expect(renderedText(tree)).toContain('1.90');
    expect(renderedText(tree)).toContain('₹25,000');

    act(() => tree.unmount());
  });

  it('renders the My Bets open tab (Figma 7:4096)', () => {
    const tree = mount(<MyBetsScreen bets={BETS.map(toBet)} />);
    const text = renderedText(tree);

    expect(text).toContain('My Bets');
    expect(text).toContain('Open (2)');
    expect(text).toContain('Settled (2)');

    // Two open bets, each with its live cash-out offer
    expect(text).toContain('BET00AA01');
    expect(text).toContain('₹950');
    expect(text).toContain('₹3,800');

    // Potential = stake × odds
    expect(text).toContain('₹1,850');
    expect(text).toContain('₹4,200');

    // Settled bets are hidden on this tab
    expect(text).not.toContain('Djokovic');

    act(() => tree.unmount());
  });

  it('switches to the settled tab (Figma 7:4313)', () => {
    const tree = mount(<MyBetsScreen bets={BETS.map(toBet)} />);

    const settled = tree.root
      .findAll(node => node.props?.accessibilityRole === 'tab')
      .find(
        node =>
          typeof node.props?.onPress === 'function' &&
          !node.props.accessibilityState?.selected,
      );
    act(() => settled?.props.onPress());

    const text = renderedText(tree);
    expect(text).toContain('Djokovic');
    expect(text).toContain('Won ✓');
    expect(text).toContain('₹1,500');
    expect(text).toContain('Alcaraz');
    expect(text).toContain('Lost ✗');
    expect(text).toContain('Return');

    // Open bets are hidden, and settled bets have no cash-out button
    expect(text).not.toContain('Cash Out');

    act(() => tree.unmount());
  });

  it('cashes a bet out through the backend handler (Figma 7:4461 → 7:4747)', async () => {
    const cashed: string[] = [];
    const tree = mount(
      <MyBetsScreen
        bets={BETS.map(toBet)}
        onCashOut={async b => {
          cashed.push(b.id);
          return true;
        }}
      />,
    );
    expect(renderedText(tree)).toContain('Open (2)');

    const cashOut = tree.root
      .findAll(node =>
        node.props?.accessibilityLabel?.startsWith?.('Cash out BET00AA01'),
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => cashOut?.props.onPress());

    // Sheet shows the offer and its share of the potential win
    const sheetText = renderedText(tree);
    expect(sheetText).toContain('Cash Out Offer');
    expect(sheetText).toContain('₹950');
    expect(sheetText).toContain('vs potential win of ₹1,850');
    expect(sheetText).toContain('51%');
    expect(sheetText).toContain('Keep Bet');

    const confirm = tree.root
      .findAll(
        node => node.props?.accessibilityLabel === 'Confirm cash out of ₹950',
      )
      .find(node => typeof node.props?.onPress === 'function');
    await act(async () => {
      await confirm?.props.onPress();
    });

    expect(cashed).toEqual(['64f00000000000000000aa01']);
    expect(renderedText(tree)).not.toContain('Cash Out Offer');

    act(() => tree.unmount());
  });

  it('renders the live matches screen (Figma 8:19)', () => {
    const tree = mount(<LiveScreen matches={[toMatchCard(LIVE)]} />);
    const text = renderedText(tree);

    expect(text).toContain('Live Matches');
    expect(text).toContain('1 match in progress');
    expect(text).toContain('IPL');
    expect(text).toContain('Mumbai Indians');
    expect(text).toContain('16.2 Ov');
    expect(text).toContain('More matches coming soon…');
    // As a tab it's a root screen, so no back arrow
    expect(
      tree.root.findAll(node => node.props?.accessibilityLabel === 'Go back'),
    ).toHaveLength(0);

    act(() => tree.unmount());
  });

  it('gives the tab screens a back arrow only when they are pushed', () => {
    const screens = [MyBetsScreen, LiveScreen, WalletScreen, ProfileScreen];

    for (const Screen of screens) {
      // Reached from the tab bar — root screen, no arrow
      const asTab = mount(<Screen />);
      expect(
        asTab.root.findAll(
          node => node.props?.accessibilityLabel === 'Go back',
        ),
      ).toHaveLength(0);
      act(() => asTab.unmount());

      // Pushed from somewhere else — arrow fires the handler
      let backs = 0;
      const pushed = mount(<Screen onBack={() => (backs += 1)} />);
      const back = pushed.root
        .findAll(node => node.props?.accessibilityLabel === 'Go back')
        .find(node => typeof node.props?.onPress === 'function');
      act(() => back?.props.onPress());
      expect(backs).toBe(1);
      act(() => pushed.unmount());
    }
  });

  it('shows a back arrow when Live is pushed from home', () => {
    let backs = 0;
    const tree = mount(<LiveScreen onBack={() => (backs += 1)} />);

    const back = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Go back')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => back?.props.onPress());

    expect(backs).toBe(1);

    act(() => tree.unmount());
  });

  it('renders the wallet screen (Figma 8:512)', () => {
    const tree = mount(
      <WalletScreen
        wallet={WALLET}
        transactions={toWalletRows(WALLET.transactions, WALLET.requests)}
      />,
    );
    const text = renderedText(tree);

    expect(text).toContain('Wallet');
    expect(text).toContain('₹5,500');
    expect(text).toContain('+₹500 won today');
    expect(text).toContain('₹2,000 withdrawal pending');
    expect(text).toContain('Available');
    expect(text).toContain('In Open Bets');
    expect(text).toContain('₹3,000');
    expect(text).toContain('Recent Transactions');
    expect(text).toContain('Deposit • UPI');
    expect(text).toContain('Bet Won');
    expect(text).toContain('Withdrawal request • Bank Transfer');
    expect(text).toContain('pending');

    act(() => tree.unmount());
  });

  it('walks the deposit flow: amount → pay → submitted (8:749 → 8:896 → 8:1045)', async () => {
    // The picker menu ("Choose from Gallery / Camera") picks the gallery, which returns one photo.
    const alert = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons) => {
        buttons?.find(b => b.text === 'Choose from Gallery')?.onPress?.();
      });
    (launchImageLibrary as jest.Mock).mockImplementation((_opts, callback) =>
      callback({
        assets: [
          {base64: 'AAAA', type: 'image/png', fileName: 'gpay_receipt.png'},
        ],
      }),
    );
    const submitted: Array<{
      amount: number;
      method: string;
      reference: string;
      proof: {name: string; data: string};
    }> = [];
    const tree = mount(
      <DepositScreen
        onSubmit={async request => {
          submitted.push(request);
          return 'DEP1A2B3C4D';
        }}
      />,
    );

    // Step 1 — CTA is disabled and shows the placeholder amount
    expect(renderedText(tree)).toContain('Pay ₹— via PhonePe');
    expect(renderedText(tree)).toContain('Select Payment Method');
    expect(renderedText(tree)).toContain('Credit / Debit Card');

    const payCta = () =>
      tree.root
        .findAll(node => node.props?.accessibilityRole === 'button')
        .find(node => node.props?.accessibilityLabel?.startsWith?.('Pay '));
    expect(payCta()?.props.accessibilityState).toEqual({disabled: true});

    const amountInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Deposit amount');
    act(() => amountInput?.props.onChangeText('1000'));

    expect(renderedText(tree)).toContain('Pay ₹1,000 via PhonePe');
    expect(payCta()?.props.accessibilityState).toEqual({disabled: false});

    // Step 2 — QR screen quotes the same amount
    act(() => payCta()?.props.onPress());
    const payText = renderedText(tree);
    expect(payText).toContain('Scan QR to pay ₹1,000');
    expect(payText).toContain('betpro@upi');
    expect(payText).toContain("I've Paid ₹1,000");

    // The transaction id is compulsory: without it nothing is filed
    const paid = () =>
      tree.root
        .findAll(
          node => node.props?.accessibilityLabel === 'I have paid ₹1,000',
        )
        .find(node => typeof node.props?.onPress === 'function');
    expect(paid()?.props.accessibilityState).toEqual({disabled: true});
    await act(async () => {
      await paid()?.props.onPress();
    });
    expect(submitted).toEqual([]);
    expect(renderedText(tree)).toContain('Transaction ID daalna zaroori hai');

    const txnInput = () =>
      tree.root
        .findAllByType('TextInput' as never)
        .find(node => node.props?.accessibilityLabel === 'Transaction ID');
    act(() => txnInput()?.props.onChangeText('ab 12'));
    expect(txnInput()?.props.value).toBe('AB12');
    expect(renderedText(tree)).toContain('kam se kam 6 characters');
    await act(async () => {
      await paid()?.props.onPress();
    });
    expect(submitted).toEqual([]);

    // A valid id alone isn't enough: the payment screenshot is compulsory too
    act(() => txnInput()?.props.onChangeText('utr-4321 9876'));
    expect(paid()?.props.accessibilityState).toEqual({disabled: true});
    await act(async () => {
      await paid()?.props.onPress();
    });
    expect(submitted).toEqual([]);
    expect(renderedText(tree)).toContain(
      'Payment ka screenshot lagana zaroori hai',
    );

    const upload = tree.root
      .findAll(
        node =>
          node.props?.accessibilityLabel ===
          'Upload Karo: Payment ka Screenshot',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => upload?.props.onPress());
    expect(renderedText(tree)).toContain('gpay_receipt.png');
    expect(renderedText(tree)).toContain('Upload ho gaya ✓');
    expect(renderedText(tree)).not.toContain(
      'Payment ka screenshot lagana zaroori hai',
    );

    // Step 3 — the request is filed and its reference shown
    expect(paid()?.props.accessibilityState).toEqual({disabled: false});
    await act(async () => {
      await paid()?.props.onPress();
    });

    expect(submitted).toEqual([
      {
        amount: 1000,
        method: 'PhonePe',
        reference: 'UTR43219876',
        proof: {
          name: 'gpay_receipt.png',
          data: 'data:image/png;base64,AAAA',
        },
      },
    ]);
    alert.mockRestore();
    const doneText = renderedText(tree);
    expect(doneText).toContain('Deposit Submitted!');
    expect(doneText).toContain('waiting for approval');
    expect(doneText).toContain('Attached ✓');
    expect(doneText).toContain('DEP1A2B3C4D');
    expect(doneText).toContain('Back to Wallet');

    act(() => tree.unmount());
  });

  it('walks the withdraw flow: form → confirm → requested (8:1112 → 8:1218 → 8:1280)', async () => {
    const submitted: Array<{
      amount: number;
      method: string;
      reference: string;
    }> = [];
    const tree = mount(
      <WithdrawScreen
        available={4500}
        kycVerified
        onSubmit={async request => {
          submitted.push(request);
          return 'WIT9F8E7D6C';
        }}
      />,
    );

    expect(renderedText(tree)).toContain('Withdraw');
    expect(renderedText(tree)).toContain('Available: ₹4,500');
    expect(renderedText(tree)).toContain('UPI / Wallet');
    expect(renderedText(tree)).toContain('Bank Transfer');

    const cta = () =>
      tree.root
        .findAll(node => node.props?.accessibilityRole === 'button')
        .find(node => node.props?.accessibilityLabel === 'Continue');

    // Amount alone isn't enough — the UPI ID is still blank
    const amountInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Withdrawal amount');
    act(() => amountInput?.props.onChangeText('1000'));
    expect(cta()?.props.accessibilityState).toEqual({disabled: true});

    const upiInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'UPI ID');
    act(() => upiInput?.props.onChangeText('Mithu@YBl'));
    expect(cta()?.props.accessibilityState).toEqual({disabled: false});

    // Step 2 — the summary echoes what was entered
    act(() => cta()?.props.onPress());
    const confirmText = renderedText(tree);
    expect(confirmText).toContain('Confirm Withdrawal');
    expect(confirmText).toContain('₹1,000');
    expect(confirmText).toContain('Mithu@YBl');

    // Step 3 — the request is filed
    const confirm = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Confirm withdraw')
      .find(node => typeof node.props?.onPress === 'function');
    await act(async () => {
      await confirm?.props.onPress();
    });

    expect(submitted).toEqual([
      {amount: 1000, method: 'UPI', reference: 'Mithu@YBl'},
    ]);
    const doneText = renderedText(tree);
    expect(doneText).toContain('Withdrawal Requested!');
    expect(doneText).toContain('once your agent approves it');
    expect(doneText).toContain('WIT9F8E7D6C');
    expect(doneText).toContain('Back to Wallet');

    act(() => tree.unmount());
  });

  it('blocks withdrawals until KYC is verified, and above the available balance', () => {
    const tree = mount(<WithdrawScreen available={4500} kycVerified={false} />);
    expect(renderedText(tree)).toContain('KYC verified hona zaroori hai');

    const amountInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Withdrawal amount');
    act(() => amountInput?.props.onChangeText('1000'));
    const upiInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'UPI ID');
    act(() => upiInput?.props.onChangeText('me@upi'));
    const continueCta = tree.root
      .findAll(node => node.props?.accessibilityRole === 'button')
      .find(node => node.props?.accessibilityLabel === 'Continue');
    expect(continueCta?.props.accessibilityState).toEqual({disabled: true});
    act(() => tree.unmount());

    const verified = mount(<WithdrawScreen available={4500} kycVerified />);
    const input = verified.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Withdrawal amount');
    act(() => input?.props.onChangeText('9000'));
    expect(renderedText(verified)).toContain('Insufficient balance');
    act(() => verified.unmount());
  });

  it('hides the UPI field when Bank Transfer is chosen', () => {
    const tree = mount(<WithdrawScreen />);
    expect(renderedText(tree)).toContain('UPI ID');

    const bank = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Bank Transfer')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => bank?.props.onPress());

    expect(renderedText(tree)).not.toContain('yourname@upi');

    act(() => tree.unmount());
  });

  it('renders the profile screen and its logout sheet (8:1346 → 9:1070)', () => {
    const tree = mount(
      <ProfileScreen
        name="Rahul Verma"
        referralCode="DEMORAH123"
        stats={profileStats(BETS)}
      />,
    );
    const text = renderedText(tree);

    expect(text).toContain('Rahul Verma');
    expect(text).toContain('DEMORAH123');
    // 4 bets, 1 won of 2 settled
    expect(text).toContain('Total Bets');
    expect(text).toContain('50.0%');
    expect(text).toContain('Refer a Friend');
    // Nothing the platform doesn't actually offer
    expect(text).not.toContain('Gold Member');
    expect(text).not.toContain('₹250');
    expect(text).toContain('KYC baaki hai');
    expect(text).toContain('Help & Support');
    expect(text).not.toContain('Log Out?');

    const logout = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Logout')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => logout?.props.onPress());

    const sheet = renderedText(tree);
    expect(sheet).toContain('Log Out?');
    expect(sheet).toContain("You'll need to sign in again to continue");
    expect(sheet).toContain('Cancel');

    act(() => tree.unmount());
  });

  it('renders the edit profile form (9:2)', () => {
    const tree = mount(<EditProfileScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Edit Profile');
    expect(text).toContain('Change Photo');
    expect(text).toContain('Full Name');
    expect(text).toContain('Date of Birth');
    // The mobile isn't OTP-checked, so it isn't called verified
    expect(text).not.toContain('Verified');
    expect(text).toContain('Save Changes');

    act(() => tree.unmount());
  });

  it('renders the referral screen (9:92)', () => {
    const tree = mount(<ReferralScreen referralCode="DEMORAH123" />);
    const text = renderedText(tree);

    expect(text).toContain('Refer a Friend');
    expect(text).not.toContain('₹250');
    expect(text).toContain('Invite Friends,');
    expect(text).toContain('DEMORAH123');
    expect(text).toContain('WhatsApp');
    expect(text).toContain('How it works');

    act(() => tree.unmount());
  });

  it('lists the feed, opens a row and marks all read (9:340)', () => {
    const rows = [
      {
        id: 'n1',
        emoji: '💰',
        title: 'Deposit Successful',
        body: '₹5,000 credited to your wallet',
        time: '2 min ago',
        unread: true,
        link: 'wallet' as const,
      },
      {
        id: 'n2',
        emoji: '🏆',
        title: 'Bet Won!',
        body: 'Man City bet — ₹725 credited',
        time: 'Yesterday',
        unread: true,
        link: 'bets' as const,
      },
      {
        id: 'n3',
        emoji: '🔐',
        title: 'Login Alert',
        body: 'New login from Android device',
        time: '12 Jul',
        unread: false,
        link: 'profile' as const,
      },
    ];
    const opened: string[] = [];
    let markedAll = 0;
    const tree = mount(
      <NotificationsScreen
        notifications={rows}
        onOpen={item => opened.push(`${item.id}:${item.link}`)}
        onMarkAllRead={() => (markedAll += 1)}
      />,
    );
    const text = renderedText(tree);
    expect(text).toContain('Deposit Successful');
    expect(text).toContain('₹5,000 credited to your wallet');
    expect(text).toContain('2 min ago');
    expect(text).toContain('Login Alert');
    // Nothing from the old Figma placeholder list
    expect(text).not.toContain('MIvCSK');

    // `typeof type === 'string'` keeps host views only — findAll would
    // otherwise count each dot twice (composite + host).
    const dots = () =>
      tree.root.findAll(
        node =>
          node.props?.testID === 'unread-dot' && typeof node.type === 'string',
      ).length;
    expect(dots()).toBe(2);

    const button = (label: string) =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');
    act(() => button('Bet Won!')?.props.onPress());
    expect(opened).toEqual(['n2:bets']);

    act(() => button('Mark all read')?.props.onPress());
    expect(markedAll).toBe(1);

    // The dots follow the feed it is given
    act(() =>
      tree.update(
        <NotificationsScreen
          notifications={rows.map(row => ({...row, unread: false}))}
        />,
      ),
    );
    expect(dots()).toBe(0);
    const markAll = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Mark all read')
      .find(node => node.props?.accessibilityState);
    expect(markAll?.props.accessibilityState).toEqual({disabled: true});

    act(() => tree.unmount());
  });

  it('shows an empty feed note instead of placeholder rows', () => {
    const tree = mount(<NotificationsScreen />);
    expect(renderedText(tree)).toContain('Abhi koi notification nahi hai');
    act(() => tree.unmount());
  });

  it('words notification times like the frame', () => {
    const now = new Date('2026-07-14T18:00:00+05:30');
    expect(timeAgo('2026-07-14T17:59:40+05:30', now)).toBe('Just now');
    expect(timeAgo('2026-07-14T17:58:00+05:30', now)).toBe('2 min ago');
    expect(timeAgo('2026-07-14T17:00:00+05:30', now)).toBe('1 hr ago');
    expect(timeAgo('2026-07-14T13:00:00+05:30', now)).toBe('5 hrs ago');
    expect(timeAgo('2026-07-13T15:00:00+05:30', now)).toBe('Yesterday');
    expect(timeAgo('2026-07-12T15:00:00+05:30', now)).toMatch(/12 Jul/);
  });

  it('toggles settings switches and language (9:451)', () => {
    const tree = mount(<SettingsScreen />);
    const text = renderedText(tree);

    expect(text).toContain('NOTIFICATIONS');
    expect(text).toContain('Live Bet Updates');
    expect(text).toContain('PREFERENCES');
    expect(text).toContain('About BetPro');
    expect(text).toContain('v2.4.1');

    const liveSwitch = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Live Bet Updates')
      .find(node => typeof node.props?.onPress === 'function');
    expect(liveSwitch?.props.accessibilityState).toEqual({checked: true});
    act(() => liveSwitch?.props.onPress());

    const after = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Live Bet Updates')
      .find(node => typeof node.props?.onPress === 'function');
    expect(after?.props.accessibilityState).toEqual({checked: false});

    act(() => tree.unmount());
  });

  it('shows the saved notification switches and saves a change', async () => {
    const saved: Array<[string, boolean]> = [];
    const tree = mount(
      <SettingsScreen
        preferences={{notifyMoney: false}}
        onTogglePreference={async (id, value) => {
          saved.push([id, value]);
          // The second save fails, so that switch has to go back.
          return saved.length === 1;
        }}
      />,
    );
    const toggle = (label: string) =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');

    expect(toggle('Deposits & Withdrawals')?.props.accessibilityState).toEqual(
      {checked: false},
    );
    expect(toggle('Security Alerts')?.props.accessibilityState).toEqual({
      checked: true,
    });

    await act(async () => {
      await toggle('Deposits & Withdrawals')?.props.onPress();
    });
    expect(saved).toEqual([['notifyMoney', true]]);
    expect(toggle('Deposits & Withdrawals')?.props.accessibilityState).toEqual(
      {checked: true},
    );

    await act(async () => {
      await toggle('Security Alerts')?.props.onPress();
    });
    expect(saved[1]).toEqual(['notifySecurity', false]);
    expect(toggle('Security Alerts')?.props.accessibilityState).toEqual({
      checked: true,
    });

    act(() => tree.unmount());
  });

  it('switches help tabs and expands an FAQ (9:613 → 9:695 → 9:783 → 9:889)', () => {
    const tree = mount(<HelpScreen />);
    expect(renderedText(tree)).toContain('How do I deposit money?');
    expect(renderedText(tree)).not.toContain('Go to Wallet → Deposit');

    // Expanding the first FAQ reveals its answer (9:695)
    const faq = tree.root
      .findAll(
        node => node.props?.accessibilityLabel === 'How do I deposit money?',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => faq?.props.onPress());
    expect(renderedText(tree)).toContain('Go to Wallet → Deposit');

    // Contact Us tab (9:783)
    const contact = tree.root
      .findAll(node => node.props?.accessibilityRole === 'tab')
      .find(node => !node.props?.accessibilityState?.selected);
    act(() => contact?.props.onPress());
    expect(renderedText(tree)).toContain('Call Support');
    expect(renderedText(tree)).toContain('Support Hours');
    // Live chat was dropped from the contact channels
    expect(renderedText(tree)).not.toContain('Live Chat');

    act(() => tree.unmount());
  });

  it('fires the login footer links for Help, Privacy and Terms', () => {
    const opened: string[] = [];
    const tree = mount(<LoginScreen onOpenLink={link => opened.push(link)} />);

    for (const label of ['Help', 'Privacy', 'Terms']) {
      const link = tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');
      act(() => link?.props.onPress());
    }

    expect(opened).toEqual(['Help', 'Privacy', 'Terms']);

    act(() => tree.unmount());
  });

  it('renders the placeholder legal documents', () => {
    for (const doc of [privacyPolicy, termsConditions]) {
      const tree = mount(<LegalScreen document={doc} />);
      const text = renderedText(tree);

      expect(text).toContain(doc.title);
      expect(text).toContain('Placeholder text');
      // Every section heading and body is rendered.
      for (const section of doc.sections) {
        expect(text).toContain(section.heading);
        expect(text).toContain(section.body);
      }

      act(() => tree.unmount());
    }
  });

  it('fires the settings legal rows', () => {
    const opened: string[] = [];
    const tree = mount(
      <SettingsScreen onOpenLink={link => opened.push(link)} />,
    );

    for (const label of ['Privacy Policy', 'Terms & Conditions']) {
      const row = tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');
      act(() => row?.props.onPress());
    }

    expect(opened).toEqual(['Privacy Policy', 'Terms & Conditions']);

    act(() => tree.unmount());
  });

  it('gates the sign-up CTA on every field + consent (62:292 → 62:366)', () => {
    const submitted: string[] = [];
    const tree = mount(
      <SignUpScreen onSubmit={form => submitted.push(form.username)} />,
    );
    const text = renderedText(tree);

    expect(text).toContain('Account Banao');
    expect(text).toContain('Aasaan Registration');
    expect(text).toContain('Username Chuno *');
    // The name field is gone — username is the only identity the user gives
    expect(text).not.toContain('Aapka Poora Naam');
    expect(text).toContain('(Optional)');
    // The bonus pill only appears once a referral code is typed
    expect(text).not.toContain('Code ✓');
    expect(text).not.toContain('Bonus');

    const cta = () =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === 'Account Banao')
        .find(node => typeof node.props?.onPress === 'function');
    expect(cta()?.props.accessibilityState).toEqual({disabled: true});

    // Referral code reveals the bonus pill (the 62:366 state)
    const refInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Referral code');
    act(() => refInput?.props.onChangeText('MITHU12345'));
    expect(renderedText(tree)).toContain('Code ✓');
    expect(renderedText(tree)).not.toContain('Bonus');

    const consent = tree.root
      .findAll(
        node =>
          node.props?.accessibilityLabel === 'Agree to terms and confirm age',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => consent?.props.onPress());
    // Consent isn't enough either — username and password are still empty
    expect(cta()?.props.accessibilityState).toEqual({disabled: true});

    const findInput = (label: string) =>
      tree.root
        .findAllByType('TextInput' as never)
        .find(node => node.props?.accessibilityLabel === label);

    // A username with spaces/capitals is rejected until it's login-safe
    act(() => findInput('Username')?.props.onChangeText('Mit'));
    expect(renderedText(tree)).toContain('kam se kam 4 characters');
    act(() => findInput('Username')?.props.onChangeText('mithu_5977'));
    expect(cta()?.props.accessibilityState).toEqual({disabled: true});

    act(() => findInput('Password')?.props.onChangeText('mera123'));
    expect(cta()?.props.accessibilityState).toEqual({disabled: false});

    act(() => cta()?.props.onPress());
    expect(submitted).toEqual(['mithu_5977']);

    act(() => tree.unmount());
  });

  it('validates the password field and fills it from the Auto button', () => {
    const submitted: string[] = [];
    const tree = mount(
      <SignUpScreen onSubmit={form => submitted.push(form.password)} />,
    );

    const byLabel = (label: string) =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');
    const input = (label: string) =>
      tree.root
        .findAllByType('TextInput' as never)
        .find(node => node.props?.accessibilityLabel === label);
    const passwordInput = () => input('Password');

    act(() => input('Username')?.props.onChangeText('mithu_5977'));
    act(() => byLabel('Agree to terms and confirm age')?.props.onPress());

    const cta = () => byLabel('Account Banao');

    // Anything under 6 characters is rejected with a message
    act(() => passwordInput()?.props.onChangeText('abc'));
    expect(renderedText(tree)).toContain('kam se kam 6 characters');
    expect(cta()?.props.accessibilityState).toEqual({disabled: true});

    // Masked until the eye is tapped
    expect(passwordInput()?.props.secureTextEntry).toBe(true);
    act(() => byLabel('Show password')?.props.onPress());
    expect(passwordInput()?.props.secureTextEntry).toBe(false);
    act(() => byLabel('Hide password')?.props.onPress());

    // Auto fills the same field with a usable password and reveals it
    act(() => byLabel('Generate a password')?.props.onPress());
    const generated = passwordInput()?.props.value;
    expect(generated.length).toBeGreaterThanOrEqual(6);
    expect(passwordInput()?.props.secureTextEntry).toBe(false);
    expect(cta()?.props.accessibilityState).toEqual({disabled: false});

    // Still editable afterwards
    act(() => passwordInput()?.props.onChangeText('mera-apna-123'));
    act(() => cta()?.props.onPress());
    expect(submitted).toEqual(['mera-apna-123']);

    act(() => tree.unmount());
  });

  it('gates the credentials CTA until the user confirms they saved them (62:447)', () => {
    const tree = mount(
      <CredentialsScreen
        username="mithu_5977"
        password="Bp5977mit"
        onContinue={() => {}}
      />,
    );
    const text = renderedText(tree);

    expect(text).toContain('Account Ban Gaya! 🎉');
    expect(text).toContain('mithu_5977');
    expect(text).toContain('inhi se login karoge');
    // Password is masked to start
    expect(text).toContain('•'.repeat(9));
    expect(text).not.toContain('Bp5977mit');

    const reveal = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Show password')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => reveal?.props.onPress());
    expect(renderedText(tree)).toContain('Bp5977mit');

    const cta = () =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === 'App Mein Jao')
        .find(node => typeof node.props?.onPress === 'function');
    expect(cta()?.props.accessibilityState).toEqual({disabled: true});

    const ack = tree.root
      .findAll(node => node.props?.accessibilityRole === 'checkbox')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => ack?.props.onPress());
    expect(cta()?.props.accessibilityState).toEqual({disabled: false});

    act(() => tree.unmount());
  });

  it('recomputes the bet slip payout from the stake', () => {
    const tree = mount(
      <BetSlipSheet
        visible
        balance={4500}
        league="IPL"
        match="Mumbai Indians vs Chennai Super Kings"
        isLive
        selection="Mumbai Indians"
        odds={1.72}
        onClose={() => {}}
      />,
    );

    // Default ₹500 at 1.72 → ₹860
    expect(renderedText(tree)).toContain('₹860');
    expect(renderedText(tree)).toContain('₹4,500');
    expect(renderedText(tree)).toContain(
      'Mumbai Indians vs Chennai Super Kings',
    );

    const stakeInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Stake amount');
    act(() => stakeInput?.props.onChangeText('1000'));
    expect(renderedText(tree)).toContain('₹1,720');

    // More than the available balance can't be confirmed
    act(() => stakeInput?.props.onChangeText('5000'));
    expect(renderedText(tree)).toContain('Insufficient balance');

    act(() => tree.unmount());
  });
});
