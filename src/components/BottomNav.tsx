import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, hairline, radius, scale, spacing, type} from '../theme';
import {Icon, IconName} from './Icon';

export type NavTab = {
  key: string;
  label: string;
  icon: IconName;
  /** Red dot over the icon — the Live tab has one. */
  showDot?: boolean;
};

export const NAV_TABS: NavTab[] = [
  {key: 'home', label: 'Home', icon: 'navHome'},
  {key: 'live', label: 'Live', icon: 'navLive', showDot: true},
  {key: 'bets', label: 'My Bets', icon: 'navBets'},
  {key: 'wallet', label: 'Wallet', icon: 'navWallet'},
  {key: 'profile', label: 'Profile', icon: 'navProfile'},
];

type BottomNavProps = {
  tabs?: NavTab[];
  activeKey: string;
  onChange: (key: string) => void;
};

/**
 * Five equal tabs on #0D1B2A with a hairline top border. Active tint #1E88E5,
 * inactive #4A6070 — the icon colour is re-tinted from the exported SVG so a
 * tab change recolours the glyph without needing a second export.
 */
export const BottomNav = ({
  tabs = NAV_TABS,
  activeKey,
  onChange,
}: BottomNavProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, {paddingBottom: insets.bottom}]}>
      {tabs.map(tab => {
        const active = tab.key === activeKey;
        const tint = active ? colors.primary : colors.textDim;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            accessibilityLabel={tab.label}
            android_ripple={{color: colors.borderOdds, borderless: true}}
            style={({pressed}) => [styles.tab, pressed && styles.pressed]}>
            <View>
              <Icon name={tab.icon} color={tint} />
              {tab.showDot ? <View style={styles.dot} /> : null}
            </View>
            <Text style={[type.navLabel, {color: tint}]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgBase,
    borderTopWidth: hairline,
    borderTopColor: colors.borderNav,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs, // 2
    paddingVertical: spacing.lg, // 12
  },
  dot: {
    position: 'absolute',
    // Figma: 8px dot at x 16 / y -3.86 relative to the 20px icon.
    top: scale(-3.86),
    left: scale(16),
    width: scale(7.994),
    height: scale(7.994),
    borderRadius: radius.pill,
    backgroundColor: colors.live,
  },
  pressed: {
    opacity: 0.7,
  },
});
