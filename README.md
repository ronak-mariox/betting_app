# BetPro — React Native

Implementation of the **Betting App** Figma file
([`DDn4Wt7skvLstgchpGybDV`](https://www.figma.com/design/DDn4Wt7skvLstgchpGybDV/Betting-App?node-id=6-9)).

Seven screens and surfaces are built:

| Screen | Figma node | File |
| ------ | ---------- | ---- |
| Splash | `6:9` | [SplashScreen.tsx](src/screens/SplashScreen.tsx) |
| Welcome | `7:30` | [WelcomeScreen.tsx](src/screens/WelcomeScreen.tsx) |
| Login | `62:214` | [LoginScreen.tsx](src/screens/LoginScreen.tsx) |
| Home | `7:243` | [HomeScreen.tsx](src/screens/HomeScreen.tsx) |
| Search overlay | `9:1520` → `9:2504` | [SearchOverlay.tsx](src/components/SearchOverlay.tsx) |
| Match detail | `7:3616` | [MatchScreen.tsx](src/screens/MatchScreen.tsx) |
| Bet slip | `7:3759` | [BetSlipSheet.tsx](src/screens/BetSlipSheet.tsx) |
| My Bets | `7:4096` open · `7:4313` settled · `7:4747` post-cash-out | [MyBetsScreen.tsx](src/screens/MyBetsScreen.tsx) |
| Cash out | `7:4461` | [CashOutSheet.tsx](src/screens/CashOutSheet.tsx) |
| Live matches | `8:19` | [LiveScreen.tsx](src/screens/LiveScreen.tsx) |
| Wallet | `8:512` | [WalletScreen.tsx](src/screens/WalletScreen.tsx) |
| Deposit | `8:749` amount · `8:896` pay · `8:1045` submitted | [DepositScreen.tsx](src/screens/DepositScreen.tsx) |
| Withdraw | `8:1112` form · `8:1218` confirm · `8:1280` requested | [WithdrawScreen.tsx](src/screens/WithdrawScreen.tsx) |
| Profile | `8:1346` + `9:1070` logout sheet | [ProfileScreen.tsx](src/screens/ProfileScreen.tsx) |
| Edit Profile | `9:2` | [EditProfileScreen.tsx](src/screens/EditProfileScreen.tsx) |
| Refer & Earn | `9:92` | [ReferralScreen.tsx](src/screens/ReferralScreen.tsx) |
| Notifications | `9:340` | [NotificationsScreen.tsx](src/screens/NotificationsScreen.tsx) |
| Settings | `9:451` | [SettingsScreen.tsx](src/screens/SettingsScreen.tsx) |
| Help & Support | `9:613`/`9:695` FAQs · `9:783` Contact · `9:889` Ticket | [HelpScreen.tsx](src/screens/HelpScreen.tsx) |

They are wired into a flow in [App.tsx](App.tsx):

```
Splash ─▶ Welcome ─▶ Login ─▶ Home ─(match card)─▶ Match ─(odds)─▶ Bet slip
             ▲          │       │
             └──(back)──┘       └──(search icon)──▶ Search overlay

                      bottom nav ├─▶ Home
                                 ├─▶ Live ──(match card)──▶ Match
                                 ├─▶ My Bets ─(cash out)──▶ Cash out sheet
                                 ├─▶ Wallet ├─(Deposit)──▶ Deposit (3 steps)
                                 │          └─(Withdraw)─▶ Withdraw (3 steps)
                                 └─▶ Profile ─┬─▶ Edit Profile
                                              ├─▶ Refer & Earn
                                              ├─▶ Notifications
                                              ├─▶ Help & Support (3 tabs)
                                              ├─▶ Settings
                                              └─(Logout)─▶ confirmation sheet
```

Deposit and Withdraw are each one flow of three steps rather than three
screens. What you enter on the first step carries through: "Scan QR to pay
₹1,000", "Your ₹1,000 deposit is being verified", and on the withdraw side the
confirmation echoes the amount, method and UPI ID you actually typed.

Three of the four My Bets frames are states of one screen, not separate
screens: `7:4096` is the Open tab, `7:4313` the Settled tab, and `7:4747` is
what Open looks like after a bet is cashed out. Confirming the `7:4461` sheet
settles the bet locally, so the tab count drops 3 → 2 and reproduces `7:4747`
exactly.

The search overlay and bet slip are not routes: Figma stacks the overlay above
the Home content with the nav still visible, and the bet slip over a scrim, so
each is rendered by its parent screen.

This is deliberate local state rather than a navigation library — swap the
`route` state in `App.tsx` for React Navigation when real routing is needed.

---

## Getting started

This repo contains the **JavaScript side only** — the `android/` and `ios/`
native projects are not checked in. Generate them once with the RN CLI
(the app name must be `betpro` to match [app.json](app.json)):

```bash
npx @react-native-community/cli@latest init betpro --version 0.76.5 --directory .tmp-native
mv .tmp-native/android .tmp-native/ios .
rm -rf .tmp-native
npx react-native-asset          # links fonts (see below)
```

Then:

```bash
npm install
npm run pods        # iOS only
npm run android     # or: npm run ios
```

Checks:

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm test            # render smoke tests for both screens
```

### Fonts

The design uses **Poppins** in five weights. Drop these TTFs into
[src/assets/fonts/](src/assets/fonts/) and run `npx react-native-asset`:

```
Poppins-Regular.ttf  Poppins-Medium.ttf  Poppins-SemiBold.ttf
Poppins-Bold.ttf     Poppins-ExtraBold.ttf
```

Every text style declares `fontWeight` next to `fontFamily`, so the UI still
renders with correct weighting on the system font before the TTFs are linked.

### Icons

The 16 icons are the **exact SVGs exported from Figma**, kept in
[src/assets/icons/](src/assets/icons/). `npm run icons` inlines them verbatim
into `src/assets/icons/index.ts` so `react-native-svg`'s `<SvgXml>` can render
them on both platforms with no Metro transformer or native linking. Re-run it
after re-exporting from Figma.

`<Icon>` defaults to the size each glyph was exported at, so no icon is ever
stretched by a shared rule.

Payment-brand logos and the deposit QR are raster exports and live in
[src/assets/images/](src/assets/images/), loaded with `require()` and given
explicit dimensions. Their sources are larger than their display size (64px
logos at 32pt, a 512px QR at 176pt) so they stay sharp on 2× and 3× screens.

---

## Architecture

```
App.tsx                    splash → home hand-off
src/
  theme/                   all design tokens — nothing else hard-codes a value
    colors.ts              palette + the 7 gradient definitions
    layout.ts              responsive scale(), spacing, radius, shadows
    typography.ts          named text styles, each annotated with its Figma spec
  components/              reusable, presentational, all functional
    Header.tsx             greeting + name + icon actions over a gradient
    Card.tsx               the rounded-surface primitive (surface/live/gradient)
    Button.tsx             8 variants × 3 sizes, with a disabled state
    BackHeader.tsx         back button + title/subtitle bar
    TextField.tsx          input, md (56, labelled) or sm (48, search)
    Chip.tsx               pill tab + ChipBar; tab/stake/segment/amount tones
    BetCard.tsx            My Bets row — open and settled variants
    BalanceCard.tsx        wallet balance panel
    TransactionRow.tsx     wallet transaction line
    PaymentMethodRow.tsx   selectable payment option with radio
    MethodToggle.tsx       two-up icon + label selector
    MenuRow.tsx            profile menu row — icon well, label, chevron
    Toggle.tsx             44 × 24 switch
    SettingsGroup.tsx      bordered group + row, with a tinted heading
    BottomSheet.tsx        modal sheet over a scrim, with grab handle
    InfoCallout.tsx        gold tip box
    Scoreboard.tsx         head-to-head score panel
    StatComparisonRow.tsx  labelled two-tone proportional bar
    SearchOverlay.tsx      full-bleed search + trending list
    Badge.tsx  Icon.tsx  SectionHeader.tsx  BottomNav.tsx
    WalletCard.tsx  LiveMatchCard.tsx  MatchCard.tsx  FeatureCard.tsx
    BetOddsButton.tsx  PromoCard.tsx  ReferralCard.tsx
  screens/                 composition only
  data/                    copy transcribed from the Figma frames
```

`Header`, `Card` and `Button` are the three primitives everything else is built
from — `MatchCard`, `LiveMatchCard`, `WalletCard`, `PromoCard`, `ReferralCard`
and `FeatureCard` are all `Card` compositions, and every CTA on every screen is
one `Button` variant.

### Button variants

| Variant | Appearance | Used by |
| ------- | ---------- | ------- |
| `primary` | 170.7° blue gradient | Login / "Login Karo" |
| `outline` | 8% blue fill, 40% blue hairline | Create Account |
| `glass` | 20% white | Deposit |
| `glassSoft` | 12% white, 85% white label | Withdraw |
| `success` | solid `#00C853` | Claim Now |
| `tint` | 15% cyan well, cyan label | Invite |
| `icon` | 40×40 `#14253D` square | bell, search, back |
| `ghost` | bare label (+ chevron) | See All / View All |

Sizes: `sm` (12/16 bold), `md` (40 tall), `lg` (56 tall, 16/24 bold).
`disabled` drops to 40% opacity and blocks presses — that's the state Figma
draws the login CTA in, since its form is empty.

---

## Design tokens

### Colours ([colors.ts](src/theme/colors.ts))

| Token | Hex | Used for |
| ----- | --- | -------- |
| `bgDeep` | `#07111F` | splash gradient edges, screen background |
| `bgBase` | `#0D1B2A` | header top, bottom nav, odds buttons |
| `surface` | `#14253D` | cards, header icon buttons |
| `primary` | `#1E88E5` | brand blue, active nav tab |
| `accent` | `#4FC3F7` | links, scores, home-win odds |
| `textPrimary` | `#FFFFFF` | headings, team names |
| `textMuted` | `#6B8AA0` | secondary copy, league names |
| `textDim` | `#4A6070` | tertiary copy, inactive nav |
| `live` | `#FF3D71` | LIVE badge, notification dots |
| `success` | `#00C853` | wins, "Claim Now" |
| `danger` | `#FF5252` | losses |
| `gold` | `#FFD54F` | bonus headline, filled star |
| `oddsAway` | `#FF8A65` | away-win odds |
| `textLabel` | `#A8BFCF` | form field labels |
| `bgVoid` | `#030A13` | letterbox behind the phone frame |

Feature-tile icon wells are the accent colours at 13% alpha (`wellGold`,
`wellSuccess`, `wellAccent`, `wellLive`); the login tip box is gold at 5% fill
with a 15% border.

Borders are all hairlines (Figma authors them at `0.701px`):
`borderCard` 7% white, `borderHairline` 5%, `borderOdds` 10%, `borderNav` 8%,
`borderLive` 30% pink, `borderAccent` 20% cyan.

### Gradients

CSS angles are preserved exactly via `react-native-linear-gradient`'s
`useAngle` + `angle`, which shares the CSS convention (0° = up, clockwise).

| Token | Angle | Stops |
| ----- | ----- | ----- |
| `splash` | 141.77° | `#07111F` 8.5% → `#0D1B2A` 50% → `#07111F` 91.5% |
| `header` | 180° | `#0D1B2A` → `#07111F` |
| `logo` | 135° | `#1E88E5` → `#4FC3F7` |
| `wallet` | 146.62° | `#1E88E5` → `#0D6CC4` 50% → `#1565C0` |
| `bonus` | 159.48° | `#1B3A2D` → `#0F2419` |
| `referral` | 168.41° | `#1A1A3E` → `#0D0D2A` |
| `ctaPrimary` | 170.7° | `#1E88E5` → `#0D6CC4` |
| `progress` | 90° | `#1E88E5` → `#4FC3F7` |

### Type scale ([typography.ts](src/theme/typography.ts))

`weight size/lineHeight`:

| Style | Spec | Where |
| ----- | ---- | ----- |
| `splashTitle` | ExtraBold 36/40, tracking −0.9 | splash "BetPro" |
| `welcomeTitle` | ExtraBold 30/36 | welcome "BetPro" |
| `welcomeTagline` | Regular 14/22.75 | welcome tagline |
| `screenTitle` | Bold 18/22.5 | "Login Karo" |
| `fieldLabel` | Medium 12/16 | "Username", "Password" |
| `calloutTitle` | SemiBold 12/16 | login tip heading |
| `featureTitle` | SemiBold 14/20 | feature tiles |
| `splashTagline` | Medium 14/20, tracking 1.4 | "PREMIUM BETTING" |
| `userName` | Bold 18/28 | "Rahul Kumar" |
| `greeting` | Medium 12/16 | "Good evening 👋" |
| `balance` | ExtraBold 30/36 | "₹12,450" |
| `sectionTitle` | SemiBold 14/20 | "Live Now", "Matches" |
| `link` | Medium 12/16 | "See All", "View All" |
| `teamName` | Bold 14/20 | match card teams |
| `score` | ExtraBold 20/25 | "186/4" |
| `league` | Medium 11/16.5 | "IPL 2025 • Match 38" |
| `oddsLabel` | SemiBold 9/13.5, tracking 0.225 | "HOME WIN" |
| `oddsValue` | ExtraBold 16/16 | "1.72" |
| `oddsPayout` | Medium 8/8 | "₹100 → ₹172" |
| `navLabel` | Medium 10/15 | bottom nav |

### Spacing & radius ([layout.ts](src/theme/layout.ts))

Spacing steps `2 · 4 · 6 · 8 · 12 · 16 · 20 · 24`, with a `gutter` of **16**
used by every Home section. Radii: **14** (buttons, odds, icon wells),
**16** (cards), **24** (wallet card, logo tile), `pill` for badges.

---

## Responsive behaviour

The Figma frame is 390 × 844 (iPhone 14). `scale()` in
[layout.ts](src/theme/layout.ts) maps every authored pixel onto the real device
width, snapped to the pixel grid via `PixelRatio.roundToNearestPixel` and
clamped to `0.85–1.3` so tablets don't get comically large cards.
`fontScale()` applies half that factor, keeping copy readable on a 320pt SE
without ballooning on a 430pt Pro Max.

Anything that should genuinely stretch uses Flexbox instead of a scaled number:
the three wallet stat columns, the Deposit/Withdraw pair, the odds pair, the
five nav tabs and both team columns are all `flex: 1`. The live rail is a
horizontal `FlatList`.

## Android & iOS

- Safe areas via `react-native-safe-area-context` — the header pads by
  `insets.top`, the bottom nav by `insets.bottom`.
- Press feedback is platform-appropriate: `android_ripple` on Android, opacity
  on iOS, both wired through `Pressable`.
- The splash logo shadow uses `shadowOffset`/`shadowRadius` on iOS and
  `elevation` on Android.
- Hairline borders resolve to `1 / PixelRatio.get()` so they stay 1 physical
  pixel on every density.
- Interactive elements carry `accessibilityRole` / `accessibilityLabel`; nav
  tabs report `accessibilityState.selected`.

## Known deviations

- The splash glow is a `react-native-svg` `RadialGradient` matching the Figma
  stops. Figma additionally applies a 64px Gaussian blur, which RN can't do
  without a native blur dependency — since the gradient already fades to fully
  transparent at the circle's edge, the difference isn't visible.
- The "Live Now" pill reads **4** while the rail holds 5 cards; that's how the
  Figma frame is authored, so it's kept as an explicit `liveCount` constant in
  [home.ts](src/data/home.ts) rather than derived from the array.
- The Withdraw frames print **Available: ₹14,282** while the Wallet frame shows
  a **₹13,282** total balance. Both are transcribed as authored rather than
  reconciled — see the note in [withdraw.ts](src/data/withdraw.ts).

## Static states rendered as real behaviour

Figma can only draw one state per frame. Where a frame clearly depicts a state
of a live control, it's implemented as that state rather than as fixed styling:

| Figma frame | Implemented as |
| ----------- | -------------- |
| Login CTA at 40% opacity | `disabled` until both fields are filled |
| Bet slip "Potential Win ₹860" | `stake × odds`, recomputed as you type |
| Bet slip `₹500` chip highlighted | selected quick-stake, driven by the stake value |
| Match screen "Match Winner" tab active | selected market tab state |
| Match stats bar split | segment flex from each stat's value |
| My Bets "Potential" figures | `stake × odds` — matches every frame's printed value |
| Cash-out "72%" and its bar | `offer ÷ potential`, so the bar always agrees with the figure |
| `7:4747` Open (2) list | the result of confirming the `7:4461` sheet |
| Deposit CTA at 40% ("Pay ₹—") | `disabled` until the amount clears the ₹100 minimum |
| "Scan QR to pay ₹1,000" | the amount entered on the previous step |
| Deposit summary Amount/Method | carried through from steps 1 and 2 |
| Withdraw "Continue" at 40% | `disabled` until the amount clears ₹500 **and** a UPI ID is entered — the frame shows ₹1,000 filled with a blank UPI ID |
| Withdraw confirm "To: Mithu@YBl" | the UPI ID entered on step 1 |
| Settings switches all on | real switch state, toggleable |
| `9:695` expanded FAQ answer | accordion state on the `9:613` list |
| Notification blue dots | unread state, cleared by "Mark all read" |
| Ticket "Submit" at 40% | `disabled` until a category and description are given |

Each is covered by a test asserting both states, so the default render still
matches the frame exactly.
