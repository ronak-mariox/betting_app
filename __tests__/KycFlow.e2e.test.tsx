/**
 * End-to-end: drives the real App against the running backend (API_BASE_URL
 * in src/services/api.ts) through sign-up / login and the whole KYC flow.
 * It creates real accounts (prefixed zz_e2e), so it only runs on request:
 *
 *   E2E=1 npx jest KycFlow
 */
import React from 'react';
import {Alert} from 'react-native';
import renderer, {ReactTestRenderer, act} from 'react-test-renderer';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import {API_BASE_URL} from '../src/services/api';
import {makePlayer} from '../e2e/fixtures';

const run = process.env.E2E === '1' ? describe : describe.skip;
jest.setTimeout(60000);

const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const stamp = Date.now().toString(36).slice(-4);

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
        `Timed out waiting for "${expected}". On screen: ${text(tree).slice(0, 400)}`,
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

const api = async (
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

run('KYC end-to-end (live backend)', () => {
  const notices: string[] = [];

  beforeEach(async () => {
    notices.length = 0;
    // Each journey starts signed out (the app restores a saved session otherwise).
    await AsyncStorage.clear();
    // Picker menus ("Camera / Choose from Gallery") pick the gallery; plain notices are recorded.
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
          {base64: PNG_BASE64, type: 'image/png', fileName: 'pan_front.png'},
        ],
      }),
    );
  });

  afterEach(() => jest.restoreAllMocks());

  /** Launches the app without clearing storage, so the saved session is restored. */
  const mountAppSignedIn = async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    return tree;
  };

  const savedToken = async () => {
    const keys = await AsyncStorage.getAllKeys();
    for (const key of keys) {
      const raw = await AsyncStorage.getItem(key);
      if (raw?.includes('accessToken')) {
        return JSON.parse(raw).accessToken as string;
      }
    }
    throw new Error('No saved session');
  };

  const mountApp = async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await waitForText(tree, 'Create Account'); // splash → welcome
    return tree;
  };

  it('sign-up → credentials → KYC 3 steps → submitted → check status → home', async () => {
    const tree = await mountApp();

    await press(tree, 'Create Account');
    await typeInto(tree, {label: 'Username'}, `zz_e2e_app${stamp}`);
    await typeInto(tree, {label: 'Password'}, 'secret123');
    await press(tree, 'Agree to terms and confirm age');
    await press(tree, 'Account Banao');

    await waitForText(tree, 'save');
    await press(tree, 'I have saved my username and password');
    await press(tree, 'App Mein Jao'); // credentials CTA

    // KYC intro (312:2)
    await waitForText(tree, 'Start KYC');
    expect(text(tree)).toContain('Quick 3-Step Process');
    await press(tree, 'Start KYC');

    // Step 1 (312:73) — Continue stays disabled until every field is valid.
    await waitForText(tree, 'Personal details — Step 1 of 3');
    expect(pressable(tree, 'Continue').props.accessibilityState).toEqual({
      disabled: true,
    });
    await typeInto(tree, {placeholder: 'Jaise: Rahul Kumar'}, 'E2E App User');
    await press(tree, 'Date of Birth *');
    const picker = tree.root.findByType('DateTimePicker' as never);
    await act(async () =>
      picker.props.onChange({type: 'set'}, new Date(2000, 4, 10)),
    );
    await typeInto(tree, {placeholder: 'Street, Building, Area'}, 'Sector 62');
    await typeInto(tree, {placeholder: 'Jaise: Mumbai'}, 'Noida');
    await typeInto(tree, {placeholder: 'Jaise: Maharashtra'}, 'Uttar Pradesh');
    await typeInto(tree, {placeholder: '400001'}, '201309');
    expect(text(tree)).toContain('10/05/2000');
    // Mobile is required and must be a valid Indian number.
    expect(pressable(tree, 'Continue').props.accessibilityState).toEqual({
      disabled: true,
    });
    await typeInto(tree, {placeholder: '10 digit mobile number'}, '12345');
    expect(pressable(tree, 'Continue').props.accessibilityState).toEqual({
      disabled: true,
    });
    await typeInto(tree, {placeholder: '10 digit mobile number'}, '9876501234');
    await press(tree, 'Continue');

    // Step 2 (312:211 → 312:339 → 312:534)
    await waitForText(tree, 'Identity document — Step 2 of 3');
    await press(tree, 'Document Type *');
    await waitForText(tree, 'Document Type Choose Karo');
    await pressText(tree, 'PAN Card');
    await typeInto(tree, {placeholder: 'Document number daalo'}, 'abcde1234f');
    await press(tree, 'Upload Karo: Front Side');
    await waitForText(tree, 'pan_front.png');
    expect(text(tree)).toContain('Upload ho gaya ✓');
    await press(tree, 'Review Details');

    // Step 3 (312:678 → 312:843)
    await waitForText(tree, 'Review your information — Step 3 of 3');
    const review = text(tree);
    for (const value of [
      'E2E App User',
      '+91 9876501234',
      '10/05/2000',
      'Noida, Uttar Pradesh',
      '201309',
      'PAN Card',
      '••••••234F',
      'pan_front.png',
    ]) {
      expect(review).toContain(value);
    }
    expect(pressable(tree, 'Submit KYC').props.accessibilityState).toEqual({
      disabled: true,
    });
    await press(tree, 'I confirm my KYC details are correct');
    await press(tree, 'Submit KYC');

    // Submitted (312:1011)
    await waitForText(tree, 'KYC Submit Ho Gaya! 🎉');
    expect(text(tree)).toContain('Under Review');
    expect(text(tree)).toMatch(/KYC[0-9A-F]{6}/);
    await press(tree, 'Check Status');
    await waitForText(tree, 'Under Review');
    expect(notices).toContain('KYC status: Under Review');

    // Under review the app stays closed: "App Mein Jao" is disabled (312:1012).
    expect(pressable(tree, 'App Mein Jao').props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(text(tree)).toContain('KYC verify hone ke baad hi app khulega');

    // Relaunching doesn't get round it — the gate comes back after the splash.
    act(() => tree.unmount());
    const relaunched = await mountAppSignedIn();
    await waitForText(relaunched, 'KYC Submit Ho Gaya! 🎉');
    expect(
      pressable(relaunched, 'App Mein Jao').props.accessibilityState,
    ).toEqual({disabled: true});

    // Staff verify it; Check Status unlocks the button and it opens Home.
    const admin = await api('POST', '/auth/login', {
      username: 'mithu8178',
      password: 'superadmin@123',
    });
    const me = await api('GET', '/auth/me', undefined, await savedToken());
    // The KYC form filled the account profile the panels show.
    expect(me.user.name).toBe('E2E App User');
    expect(me.user.phone).toBe('+91 98765 01234');
    expect(me.user.city).toBe('Noida');
    await api(
      'PATCH',
      `/accounts/${me.user._id}`,
      {kyc: 'Verified'},
      admin.accessToken,
    );
    await press(relaunched, 'Check Status');
    await waitForText(relaunched, 'KYC Verified Ho Gaya! ✅');
    await press(relaunched, 'App Mein Jao');
    await waitForText(relaunched, 'My Bets'); // bottom nav = Home
    expect(text(relaunched)).not.toContain('KYC Verified Ho Gaya');
    act(() => relaunched.unmount());
  });

  it('login (not submitted) → KYC intro → Continue Later → Profile → KYC Verification', async () => {
    const username = `zz_e2e_login${stamp}`;
    await api('POST', '/auth/register', {username, password: 'secret123'});

    const tree = await mountApp();
    await press(tree, 'Login');
    await waitForText(tree, 'Login Karo');
    await typeInto(tree, {index: 0}, username);
    await typeInto(tree, {index: 1}, 'secret123');
    await press(tree, 'Login Karo');

    await waitForText(tree, 'Start KYC');
    await press(tree, 'Continue Later');
    await waitForText(tree, 'My Bets');

    await press(tree, 'Profile');
    await waitForText(tree, 'KYC Verification');
    await press(tree, 'KYC Verification');
    await waitForText(tree, 'Start KYC');
    act(() => tree.unmount());
  });

  it('rejected user logs in → sees reason → can resubmit', async () => {
    const username = `zz_e2e_rej${stamp}`;
    const reg = await api('POST', '/auth/register', {
      username,
      password: 'secret123',
    });
    await api(
      'POST',
      '/kyc',
      {
        fullName: 'Rejected User',
        phone: '9812345670',
        dob: '1999-01-01',
        address: 'Street 1',
        city: 'Pune',
        state: 'MH',
        postalCode: '411001',
        documentType: 'Voter ID',
        documentNumber: 'VOT12345',
        front: {name: 'voter.png', data: `data:image/png;base64,${PNG_BASE64}`},
      },
      reg.accessToken,
    );
    const admin = await api('POST', '/auth/login', {
      username: 'mithu8178',
      password: 'superadmin@123',
    });
    await api(
      'PATCH',
      `/accounts/${reg.user._id}`,
      {kyc: 'Rejected', kycRejectionReason: 'Name mismatch'},
      admin.accessToken,
    );

    const tree = await mountApp();
    await press(tree, 'Login');
    await waitForText(tree, 'Login Karo');
    await typeInto(tree, {index: 0}, username);
    await typeInto(tree, {index: 1}, 'secret123');
    await press(tree, 'Login Karo');

    await waitForText(tree, 'KYC Reject Ho Gaya');
    expect(text(tree)).toContain('Name mismatch');
    await press(tree, 'KYC Dobara Karo');
    await waitForText(tree, 'Personal details — Step 1 of 3');
    act(() => tree.unmount());
  });

  it.each([
    ['Not Submitted', 'Start KYC'], // → KYC intro
    ['Pending', 'KYC Submit Ho Gaya'], // → locked on the status screen
    ['Verified', 'My Bets'], // → straight to Home
  ] as const)(
    'a player whose KYC is %s lands on the right screen after login',
    async (kyc, expected) => {
      const player = await makePlayer({kyc});
      const tree = await mountApp();
      await press(tree, 'Login');
      await waitForText(tree, 'Login Karo');
      await typeInto(tree, {index: 0}, player.username);
      await typeInto(tree, {index: 1}, player.password);
      await press(tree, 'Login Karo');
      await waitForText(tree, expected);
      if (kyc === 'Pending') {
        // Under review: no way into the app from here.
        expect(
          pressable(tree, 'App Mein Jao').props.accessibilityState,
        ).toEqual({disabled: true});
        expect(text(tree)).not.toContain('My Bets');
      }
      if (kyc === 'Verified') {
        // Profile → KYC Verification shows their real status screen.
        await press(tree, 'Profile');
        await press(tree, 'KYC Verification');
        await waitForText(tree, 'KYC Verified Ho Gaya! ✅');
      }
      act(() => tree.unmount());
    },
  );
});
