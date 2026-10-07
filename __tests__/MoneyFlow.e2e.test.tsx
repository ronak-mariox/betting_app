/**
 * End-to-end: drives the real App against the running backend. It makes
 * its own players (and a live match, if there is none), so it runs on any
 * data — an empty database included:
 * home feed → bet → My Bets → cash out → withdraw → deposit → agent approves
 * (via the panel API) → wallet shows it. Only runs on request:
 *
 *   E2E=1 npx jest MoneyFlow
 */
import React from 'react';
import {Alert} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import renderer, {ReactTestRenderer, act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import {api, ensureLiveMatch, makePlayer, tokenFor} from '../e2e/fixtures';

/** Alert titles shown so far in the current test (see beforeEach). */
const notices: string[] = [];

const run = process.env.E2E === '1' ? describe : describe.skip;
jest.setTimeout(90000);

const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

const text = (tree: ReactTestRenderer) =>
  tree.root
    .findAllByType('Text' as never, {deep: true})
    .flatMap(
      node => node.children.filter(c => typeof c === 'string') as string[],
    )
    .join(' ');

/** Polls (letting timers and network settle) until `expected` is on screen. */
const waitForText = async (
  tree: ReactTestRenderer,
  expected: string,
  timeoutMs = 15000,
) => {
  const started = Date.now();
  while (!text(tree).includes(expected)) {
    if (Date.now() - started > timeoutMs) {
      throw new Error(
        `Timed out waiting for "${expected}". Notices: ${notices.join(' / ')}. On screen: ${text(tree).slice(0, 400)}`,
      );
    }
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  }
};

const pressable = (tree: ReactTestRenderer, label: string) => {
  const node = tree.root
    .findAll(
      n =>
        n.props?.accessibilityLabel === label &&
        typeof n.props?.onPress === 'function',
    )
    .at(0);
  if (!node) {
    throw new Error(
      `No pressable labelled "${label}". On screen: ${text(tree).slice(0, 300)}`,
    );
  }
  return node;
};

const press = async (tree: ReactTestRenderer, label: string) => {
  const node = pressable(tree, label);
  expect(
    node.props.accessibilityState?.disabled ?? node.props.disabled ?? false,
  ).toBe(false);
  await act(async () => {
    await node.props.onPress();
  });
};

const pressText = async (tree: ReactTestRenderer, label: string) => {
  const node = tree.root
    .findAll(
      n =>
        typeof n.props?.onPress === 'function' &&
        n.findAll(c => c.children?.includes?.(label)).length > 0,
    )
    .at(-1);
  if (!node) {
    throw new Error(`Nothing pressable shows "${label}"`);
  }
  await act(async () => {
    await node.props.onPress();
  });
};

const typeInto = async (
  tree: ReactTestRenderer,
  match: {label?: string; placeholder?: string; index?: number},
  value: string,
) => {
  const inputs = tree.root.findAllByType('TextInput' as never);
  const input =
    match.index !== undefined
      ? inputs[match.index]
      : inputs.find(n =>
          match.label
            ? n.props.accessibilityLabel === match.label
            : n.props.placeholder === match.placeholder,
        );
  if (!input) {
    throw new Error(`No input for ${JSON.stringify(match)}`);
  }
  await act(async () => input.props.onChangeText(value));
};

const staffToken = tokenFor;

run('Money + betting end-to-end (live backend)', () => {
  /** A verified player with money, and one who hasn't done KYC. */
  let rich: Awaited<ReturnType<typeof makePlayer>>;
  let fresh: Awaited<ReturnType<typeof makePlayer>>;

  beforeAll(async () => {
    await ensureLiveMatch();
    rich = await makePlayer({kyc: 'Verified', balance: 10000});
    fresh = await makePlayer({balance: 2000});
  });

  beforeEach(async () => {
    notices.length = 0;
    await AsyncStorage.clear();
    // Picker menus pick the gallery (which returns a 1×1 PNG); plain notices are recorded.
    jest
      .spyOn(Alert, 'alert')
      .mockImplementation((title, _message, buttons) => {
        const gallery = buttons?.find(b => b.text === 'Choose from Gallery');
        if (gallery) {
          gallery.onPress?.();
        } else {
          notices.push(String(title));
        }
      });
    (launchImageLibrary as jest.Mock).mockImplementation((_opts, callback) =>
      callback({
        assets: [
          {
            base64:
              'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            type: 'image/png',
            fileName: 'upi_payment.png',
          },
        ],
      }),
    );
  });

  afterEach(() => jest.restoreAllMocks());

  const waitForNotice = async (tree: ReactTestRenderer, expected: string) => {
    const started = Date.now();
    while (!notices.some(n => n.includes(expected))) {
      if (Date.now() - started > 15000) {
        throw new Error(
          `No notice "${expected}". Notices: ${notices.join(' / ')}`,
        );
      }
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    }
  };

  const loginAs = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await waitForText(tree, 'Create Account');
    await press(tree, 'Login');
    await typeInto(tree, {index: 0}, username);
    await typeInto(tree, {index: 1}, password);
    await press(tree, 'Login Karo');
    return tree;
  };

  it('verified player: bet → My Bets → cash out → withdraw → deposit → agent approves → wallet', async () => {
    // Where the account stands before the journey.
    const amit = await staffToken(rich.username, rich.password);
    const before = await api('GET', '/player/wallet', undefined, amit);
    const openBefore = (
      await api('GET', '/player/bets', undefined, amit)
    ).bets.filter((b: {status: string}) => b.status === 'Pending').length;
    const feed = (await api('GET', '/player/matches', undefined, amit)).matches;
    const live = feed.find((m: {status: string}) => m.status === 'Live');
    // Whichever market is open first — the one the match screen opens on.
    const matchOdds = live.markets[0];
    const pick = matchOdds.runners[1];

    const tree = await loginAs(rich);

    // Home: real balance, live rail and match feed
    await waitForText(tree, rupees(before.balance));
    await waitForText(tree, 'Live Now');
    expect(text(tree)).toContain(matchOdds.runners[0].odds.toFixed(2));

    // Open the live match and bet ₹1,000 on the second selection
    await press(tree, live.name);
    await waitForText(tree, 'Max stake');
    await press(tree, `${pick.name} at ${pick.odds.toFixed(2)}`);
    await waitForText(tree, 'Bet Slip');
    // Available = balance − open bets − pending withdrawals
    expect(text(tree)).toContain(rupees(before.available));
    await typeInto(tree, {label: 'Stake amount'}, '1000');
    expect(text(tree)).toContain(rupees(1000 * pick.odds));
    await press(tree, 'Confirm Bet');
    await waitForNotice(tree, 'Bet lag gaya');

    // My Bets: the new bet joins the open ones
    await press(tree, 'Go back');
    await press(tree, 'My Bets');
    await waitForText(tree, `Open (${openBefore + 1})`);
    expect(text(tree)).toContain(pick.name);

    // Cash it out
    const placed = (await api('GET', '/player/bets', undefined, amit)).bets[0];
    const reference = `BET${placed._id.slice(-6).toUpperCase()}`;
    const cashOutButton = tree.root
      .findAll(
        n =>
          String(n.props?.accessibilityLabel ?? '').startsWith(
            `Cash out ${reference}`,
          ) && typeof n.props?.onPress === 'function',
      )
      .at(0)!;
    const offerLabel = String(cashOutButton.props.accessibilityLabel);
    const offer = Number(offerLabel.replace(/.*₹/, '').replace(/,/g, ''));
    await act(async () => cashOutButton.props.onPress());
    await waitForText(tree, 'Cash Out Offer');
    await press(tree, `Confirm cash out of ${rupees(offer)}`);
    await waitForNotice(tree, 'Cash out ho gaya');
    await waitForText(tree, `Open (${openBefore})`);
    const afterCashOut = before.balance + offer - 1000;

    // Wallet shows the settled cash-out
    await press(tree, 'Wallet');
    await waitForText(tree, rupees(afterCashOut));
    expect(text(tree)).toContain('Cash Out •');

    // Withdraw ₹1,000 to UPI
    await press(tree, 'Withdraw');
    await waitForText(tree, 'Available:');
    await typeInto(tree, {label: 'Withdrawal amount'}, '1000');
    await typeInto(tree, {label: 'UPI ID'}, 'amit@upi');
    await press(tree, 'Continue');
    await press(tree, 'Confirm withdraw');
    await waitForText(tree, 'Withdrawal Requested!');
    expect(text(tree)).toContain('amit@upi');
    expect(text(tree)).toMatch(/WIT[0-9A-F]{8}/);
    await press(tree, 'Back to Wallet');

    // Deposit ₹2,000 via PhonePe
    await waitForText(tree, 'Recent Transactions');
    await press(tree, 'Deposit');
    await typeInto(tree, {label: 'Deposit amount'}, '2000');
    await press(tree, 'Pay ₹2,000 via PhonePe');
    await typeInto(tree, {label: 'Transaction ID'}, 'UTRAPP2000');
    await press(tree, 'Upload Karo: Payment ka Screenshot');
    await waitForText(tree, 'upi_payment.png');
    await press(tree, 'I have paid ₹2,000');
    await waitForText(tree, 'Deposit Submitted!');
    expect(text(tree)).toContain('UTRAPP2000');

    // The agent approves both from the panel
    const agent = await staffToken('agent01', 'agent@123');
    const pending = await api(
      'GET',
      '/wallet/requests?status=Pending',
      undefined,
      agent,
    );
    // The two this journey just filed: the newest with each reference (the
    // list is newest first, and an earlier run may have left older ones).
    type Pending = {
      _id: string;
      user: {username: string};
      reference: string;
    };
    const amitRequests = ['amit@upi', 'UTRAPP2000'].map(wanted =>
      pending.items.find(
        (r: Pending) =>
          r.user.username === rich.username && r.reference === wanted,
      ),
    );
    expect(amitRequests.every(Boolean)).toBe(true);
    // The screenshot picked on the phone reaches the reviewer with the request
    const {proof} = await api(
      'GET',
      `/wallet/requests/${amitRequests[1]._id}/proof`,
      undefined,
      agent,
    );
    expect(proof.name).toBe('upi_payment.png');
    expect(proof.data).toMatch(/^data:image\/png;base64,iVBOR/);
    for (const r of amitRequests) {
      const approved = await api(
        'POST',
        `/wallet/requests/${r._id}/approve`,
        undefined,
        agent,
      );
      expect(approved.request?.status).toBe('Approved');
    }

    // Back in the app the wallet reflects both
    await press(tree, 'Back to Wallet');
    const expected = afterCashOut - 1000 + 2000;
    await waitForText(tree, rupees(expected));
    expect(text(tree)).toContain('Deposit • PhonePe');
    expect(text(tree)).toContain('Withdrawal • UPI');

    // Home agrees
    await press(tree, 'Home');
    await waitForText(tree, rupees(expected));

    act(() => tree.unmount());
  });

  it('unverified player: withdrawal is blocked with a KYC prompt', async () => {
    const tree = await loginAs(fresh);
    // No KYC yet, so login lands on the KYC intro — skip to the app.
    await waitForText(tree, 'Start KYC');
    await pressText(tree, 'Continue Later');
    const rahul = await staffToken(fresh.username, fresh.password);
    const wallet = await api('GET', '/player/wallet', undefined, rahul);
    await waitForText(tree, rupees(wallet.balance));
    await press(tree, 'Withdraw');
    await waitForText(tree, 'KYC verified hona zaroori hai');
    await typeInto(tree, {label: 'Withdrawal amount'}, '1000');
    await typeInto(tree, {label: 'UPI ID'}, 'rahul@upi');
    expect(pressable(tree, 'Continue').props.accessibilityState).toEqual({
      disabled: true,
    });
    act(() => tree.unmount());
  });
});
