/**
 * Smoke tests: both screens must mount and expose the copy from the Figma frames.
 */
import React from 'react';
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

/**
 * Collects every rendered string. Interpolated <Text> children arrive as
 * separate nodes, so segments are joined with a space.
 */
const renderedText = (tree: ReactTestRenderer): string =>
  tree.root
    .findAllByType('Text' as never, {deep: true})
    .flatMap(node => node.children.filter(c => typeof c === 'string') as string[])
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
    const tree = mount(<HomeScreen />);
    const text = renderedText(tree);

    // Header + wallet
    expect(text).toContain('Rahul Kumar');
    expect(text).toContain('₹12,450');
    expect(text).toContain('Deposit');
    expect(text).toContain('Withdraw');

    // Live rail
    expect(text).toContain('Live Now');
    expect(text).toContain('Mumbai Indians');
    expect(text).toContain('Chennai Super Kings');

    // Promo + referral
    // The welcome bonus promo is hidden on home
    expect(text).not.toContain('🎁 Welcome Bonus');
    expect(text).toContain('Invite Friends');

    // Match cards — live and upcoming variants
    expect(text).toContain('15.1 Ov');
    expect(text).toContain('HOME WIN');
    expect(text).toContain('aur markets dekho');
    expect(text).toContain('VS');
    expect(text).toContain('Today 7:30 PM');

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
    const tree = mount(<HomeScreen onSeeAll={section => sections.push(section)} />);

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
    let matches = 0;
    let referrals = 0;
    const tree = mount(
      <HomeScreen
        onOpenMatch={() => (matches += 1)}
        onOpenReferral={() => (referrals += 1)}
      />,
    );

    // A card in the horizontal "Live Now" rail
    const liveCard = tree.root
      .findAll(
        node =>
          node.props?.accessibilityLabel ===
          'Manchester City vs Arsenal',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => liveCard?.props.onPress());

    const invite = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Invite')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => invite?.props.onPress());

    expect(matches).toBeGreaterThan(0);
    expect(referrals).toBe(1);

    act(() => tree.unmount());
  });

  it('hides and restores the wallet balance from the eye toggle', () => {
    const tree = mount(<HomeScreen />);
    expect(renderedText(tree)).toContain('₹12,450');

    const eye = (label: string) =>
      tree.root
        .findAll(node => node.props?.accessibilityLabel === label)
        .find(node => typeof node.props?.onPress === 'function');

    act(() => eye('Hide wallet balance')?.props.onPress());
    expect(renderedText(tree)).not.toContain('₹12,450');

    act(() => eye('Show wallet balance')?.props.onPress());
    expect(renderedText(tree)).toContain('₹12,450');

    act(() => tree.unmount());
  });

  it('places a bet from the match screen and lists it in My Bets', () => {
    const placed: Array<{selection: string; stake: number}> = [];
    const match = mount(
      <MatchScreen balance={12450} onPlaceBet={bet => placed.push(bet)} />,
    );

    const odds = match.root
      .findAll(node =>
        String(node.props?.accessibilityLabel ?? '').startsWith('Kings at'),
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => odds?.props.onPress());

    // The slip opens on that selection
    expect(renderedText(match)).toContain('Kings');

    const confirm = match.root
      .findAll(node => node.props?.accessibilityLabel === 'Confirm Bet')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => confirm?.props.onPress());

    expect(placed).toHaveLength(1);
    expect(placed[0].selection).toBe('Kings');
    expect(placed[0].stake).toBeGreaterThan(0);
    act(() => match.unmount());

    // That bet shows up on top of the mock ones
    const bets = mount(
      <MyBetsScreen
        placedBets={[
          {
            id: 'BET900',
            status: 'open',
            match: 'Mumbai Indians vs Chennai Super Kings',
            selection: 'Kings',
            odds: 2.3,
            stake: 500,
            cashOut: 1035,
          },
        ]}
      />,
    );
    expect(renderedText(bets)).toContain('BET900');
    expect(renderedText(bets)).toContain('Open (4)');

    act(() => bets.unmount());
  });

  it('opens notifications from the home header bell', () => {
    let opened = 0;
    const tree = mount(<HomeScreen onOpenNotifications={() => (opened += 1)} />);

    const bell = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Notifications')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => bell?.props.onPress());

    expect(opened).toBe(1);

    act(() => tree.unmount());
  });

  it('opens the search overlay from the home header', () => {
    const tree = mount(<HomeScreen />);
    // "Wimbledon" and "Cancel" appear only in the overlay; "IPL 2025" is also
    // part of a match card's league line, so it can't be the precondition.
    expect(renderedText(tree)).not.toContain('Wimbledon');

    const search = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Search')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => search?.props.onPress());

    const text = renderedText(tree);
    expect(text).toContain('Cancel');
    expect(text).toContain('IPL 2025');
    expect(text).toContain('Premier League');
    expect(text).toContain('Wimbledon');

    act(() => tree.unmount());
  });

  it('renders the match screen with scoreboard, markets and stats', () => {
    const tree = mount(<MatchScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Mumbai Indians vs Chennai Super Kings');
    expect(text).toContain('186/4');
    expect(text).toContain('142/6');
    expect(text).toContain('15.1 Ov');

    // Market tabs
    expect(text).toContain('Match Winner');
    expect(text).toContain('Over/Under');

    // Stats
    expect(text).toContain('Match Statistics');
    expect(text).toContain('Run Rate');
    expect(text).toContain('Boundaries');
    expect(text).toContain('Wickets');

    act(() => tree.unmount());
  });

  it('renders the My Bets open tab (Figma 7:4096)', () => {
    const tree = mount(<MyBetsScreen />);
    const text = renderedText(tree);

    expect(text).toContain('My Bets');
    expect(text).toContain('Open (3)');
    expect(text).toContain('Settled');

    // Three open bets, each with a cash-out offer
    expect(text).toContain('BET001');
    expect(text).toContain('BET004');
    expect(text).toContain('BET005');
    expect(text).toContain('₹1,332');
    expect(text).toContain('₹2,304');
    expect(text).toContain('₹4,500');

    // Potential = stake × odds, as printed in the frame
    expect(text).toContain('₹1,850');
    expect(text).toContain('₹3,200');
    expect(text).toContain('₹6,250');

    // Settled bets are hidden on this tab
    expect(text).not.toContain('BET002');

    act(() => tree.unmount());
  });

  it('switches to the settled tab (Figma 7:4313)', () => {
    const tree = mount(<MyBetsScreen />);

    const settled = tree.root
      .findAll(node => node.props?.accessibilityRole === 'tab')
      .find(node => typeof node.props?.onPress === 'function' && !node.props.accessibilityState?.selected);
    act(() => settled?.props.onPress());

    const text = renderedText(tree);
    expect(text).toContain('BET002');
    expect(text).toContain('Won ✓');
    expect(text).toContain('₹725');
    expect(text).toContain('BET003');
    expect(text).toContain('Lost ✗');
    expect(text).toContain('₹1,020');

    // Open bets are hidden, and settled bets have no cash-out button
    expect(text).not.toContain('BET001');
    expect(text).not.toContain('Cash Out');

    act(() => tree.unmount());
  });

  it('cashes a bet out, dropping Open (3) to Open (2) (Figma 7:4461 → 7:4747)', () => {
    const tree = mount(<MyBetsScreen />);
    expect(renderedText(tree)).toContain('Open (3)');

    // Open the cash-out sheet for BET001
    const cashOut = tree.root
      .findAll(node =>
        node.props?.accessibilityLabel?.startsWith?.('Cash out BET001'),
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => cashOut?.props.onPress());

    // Sheet shows the offer and its share of the potential win
    const sheetText = renderedText(tree);
    expect(sheetText).toContain('Cash Out Offer');
    expect(sheetText).toContain('₹1,332');
    expect(sheetText).toContain('vs potential win of ₹1,850');
    expect(sheetText).toContain('72%');
    expect(sheetText).toContain('Keep Bet');

    // Confirming settles the bet — the 7:4747 state
    const confirm = tree.root
      .findAll(
        node => node.props?.accessibilityLabel === 'Confirm cash out of ₹1,332',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => confirm?.props.onPress());

    const after = renderedText(tree);
    expect(after).toContain('Open (2)');
    expect(after).not.toContain('BET001');
    expect(after).toContain('BET004');
    expect(after).toContain('BET005');

    act(() => tree.unmount());
  });

  it('renders the live matches screen (Figma 8:19)', () => {
    const tree = mount(<LiveScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Live Matches');
    expect(text).toContain('4 matches in progress');
    expect(text).toContain('IPL 2025 • Match 38');
    expect(text).toContain('NBA Playoffs');
    expect(text).toContain('Boston Celtics');
    // Basketball has no overs, so that card falls back to the VS separator
    expect(text).toContain('VS');
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
        asTab.root.findAll(node => node.props?.accessibilityLabel === 'Go back'),
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
    const tree = mount(<WalletScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Wallet');
    expect(text).toContain('₹13,282');
    expect(text).toContain('+₹725 won today');
    expect(text).toContain('Bonus');
    expect(text).toContain('Referral');
    expect(text).toContain('Recent Transactions');
    expect(text).toContain('UPI Deposit');
    expect(text).toContain('Bank Withdrawal');
    expect(text).toContain('pending');

    act(() => tree.unmount());
  });

  it('walks the deposit flow: amount → pay → submitted (8:749 → 8:896 → 8:1045)', () => {
    const tree = mount(<DepositScreen />);

    // Step 1 — CTA is disabled and shows the placeholder amount
    expect(renderedText(tree)).toContain('Pay ₹— via PhonePe');
    expect(renderedText(tree)).toContain('Select Payment Method');
    expect(renderedText(tree)).toContain('Credit / Debit Card');

    const payCta = () =>
      tree.root
        .findAll(node => node.props?.accessibilityRole === 'button')
        .find(node => node.props?.accessibilityLabel?.startsWith?.('Pay '));
    expect(payCta()?.props.accessibilityState).toEqual({disabled: true});

    // Entering an amount enables it and updates the label
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
    expect(payText).toContain('← Change Method');

    // Step 3 — confirmation carries amount and method through
    const paid = tree.root
      .findAll(
        node => node.props?.accessibilityLabel === 'I have paid ₹1,000',
      )
      .find(node => typeof node.props?.onPress === 'function');
    act(() => paid?.props.onPress());

    const doneText = renderedText(tree);
    expect(doneText).toContain('Deposit Submitted!');
    expect(doneText).toContain('Your ₹1,000 deposit is being verified');
    expect(doneText).toContain('Pending Verification');
    expect(doneText).toContain('Back to Wallet');

    act(() => tree.unmount());
  });

  it('walks the withdraw flow: form → confirm → requested (8:1112 → 8:1218 → 8:1280)', () => {
    const tree = mount(<WithdrawScreen />);

    expect(renderedText(tree)).toContain('Withdraw');
    expect(renderedText(tree)).toContain('Available: ₹14,282');
    expect(renderedText(tree)).toContain('UPI / Wallet');
    expect(renderedText(tree)).toContain('Bank Transfer');
    expect(renderedText(tree)).toContain(
      '⚠️ Withdrawals are processed within 24 hours. Minimum withdrawal is ₹500.',
    );

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
    expect(confirmText).toContain('Within 24 hours');
    expect(confirmText).toContain('Edit');

    // Step 3
    const confirm = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'Confirm withdraw')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => confirm?.props.onPress());

    const doneText = renderedText(tree);
    expect(doneText).toContain('Withdrawal Requested!');
    expect(doneText).toContain('₹1,000 will be credited within 24 hours');
    expect(doneText).toContain('Processing');
    expect(doneText).toContain('Back to Wallet');

    act(() => tree.unmount());
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
    const tree = mount(<ProfileScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Rahul Kumar');
    expect(text).toContain('🥇 Gold Member');
    expect(text).toContain('RAHUL2025');
    expect(text).toContain('59.6%');
    expect(text).toContain('Refer & Earn');
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
    expect(text).toContain('Verified');
    expect(text).toContain('Save Changes');

    act(() => tree.unmount());
  });

  it('renders the referral screen (9:92)', () => {
    const tree = mount(<ReferralScreen />);
    const text = renderedText(tree);

    expect(text).toContain('Refer & Earn');
    expect(text).toContain('Invite Friends,');
    expect(text).toContain('RAHUL2025');
    expect(text).toContain('WhatsApp');
    expect(text).toContain('How it works');
    expect(text).toContain('Your Referrals (4)');
    expect(text).toContain('Amit Sharma');
    expect(text).toContain('Top Referrer This Month');

    act(() => tree.unmount());
  });

  it('marks notifications read (9:340)', () => {
    const tree = mount(<NotificationsScreen />);
    expect(renderedText(tree)).toContain('MIvCSK — Score Update');
    expect(renderedText(tree)).toContain('Login Alert');

    // Two items are unread in the frame; "Mark all read" clears both dots.
    // `typeof type === 'string'` keeps host views only — findAll would
    // otherwise count each dot twice (composite + host).
    const dots = () =>
      tree.root.findAll(
        node =>
          node.props?.testID === 'unread-dot' && typeof node.type === 'string',
      ).length;
    expect(dots()).toBe(2);

    const markAll = tree.root
      .findAll(node => node.props?.accessibilityRole === 'button')
      .find(node => typeof node.props?.onPress === 'function');
    act(() => markAll?.props.onPress());
    expect(dots()).toBe(0);

    act(() => tree.unmount());
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

  it('switches help tabs and expands an FAQ (9:613 → 9:695 → 9:783 → 9:889)', () => {
    const tree = mount(<HelpScreen />);
    expect(renderedText(tree)).toContain('How do I deposit money?');
    expect(renderedText(tree)).not.toContain('Go to Wallet → Deposit');

    // Expanding the first FAQ reveals its answer (9:695)
    const faq = tree.root
      .findAll(node => node.props?.accessibilityLabel === 'How do I deposit money?')
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
    const tree = mount(<SettingsScreen onOpenLink={link => opened.push(link)} />);

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
    expect(text).not.toContain('+₹50 Bonus');

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
    expect(renderedText(tree)).toContain('+₹50 Bonus');

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
    const tree = mount(<BetSlipSheet visible onClose={() => {}} />);

    // Default ₹500 at 1.72 → ₹860, the figure printed in the Figma frame.
    expect(renderedText(tree)).toContain('₹860');
    expect(renderedText(tree)).toContain('₹12,450');

    const stakeInput = tree.root
      .findAllByType('TextInput' as never)
      .find(node => node.props?.accessibilityLabel === 'Stake amount');
    act(() => stakeInput?.props.onChangeText('1000'));

    expect(renderedText(tree)).toContain('₹1,720');

    act(() => tree.unmount());
  });
});
