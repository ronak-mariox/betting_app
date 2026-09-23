import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';
import {Button} from './Button';
import {Card} from './Card';
import {Icon} from './Icon';

export type WalletStat = {
  label: string;
  value: string;
  /** Defaults to white; wins are #00C853 and losses #FF5252. */
  color?: string;
};

type WalletCardProps = {
  balance: string;
  hint: string;
  stats: WalletStat[];
  /** Drives the eye button's label — the caller masks `balance` itself. */
  balanceHidden?: boolean;
  onPressBalance?: () => void;
  onToggleVisibility?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
};

/**
 * Wallet balance panel — 24 radius, 146.62° blue gradient, 236 tall, with the
 * decorative 128px white circle bleeding off the top-right corner.
 */
export const WalletCard = ({
  balance,
  hint,
  stats,
  balanceHidden = false,
  onPressBalance,
  onToggleVisibility,
  onDeposit,
  onWithdraw,
}: WalletCardProps) => (
  <Card
    variant="gradient"
    gradient="wallet"
    style={styles.card}
    contentStyle={styles.content}>
    {/* Sits outside the padded body so its offsets are card-relative. */}
    <View style={styles.decorCircle} pointerEvents="none" />

    <View style={styles.inner}>
    <View style={styles.labelRow}>
      <Text style={type.walletLabel}>Wallet Balance</Text>
      <Pressable
        onPress={onToggleVisibility}
        hitSlop={spacing.lg}
        accessibilityRole="button"
        accessibilityState={{expanded: !balanceHidden}}
        accessibilityLabel={
          balanceHidden ? 'Show wallet balance' : 'Hide wallet balance'
        }>
        <Icon name="eye" />
      </Pressable>
    </View>

    <Pressable onPress={onPressBalance} style={styles.balanceBlock}>
      <Text style={type.balance}>{balance}</Text>
      <Text style={[type.walletHint, styles.hint]}>{hint}</Text>
    </Pressable>

    <View style={styles.statsRow}>
      {stats.map(stat => (
        <View key={stat.label} style={styles.stat}>
          <Text style={type.statLabel}>{stat.label}</Text>
          <Text
            style={[
              type.statValue,
              {color: stat.color ?? colors.textPrimary},
            ]}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>

    <View style={styles.actions}>
      <Button
        variant="glass"
        icon="plus"
        label="Deposit"
        onPress={onDeposit}
        style={styles.action}
      />
      <Button
        variant="glassSoft"
        icon="minus"
        label="Withdraw"
        onPress={onWithdraw}
        style={styles.action}
      />
    </View>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    height: scale(235.923),
    borderRadius: radius.lg, // 24
  },
  content: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: spacing.xxl, // 20
  },
  decorCircle: {
    position: 'absolute',
    // Figma: 128px circle at x 294 / y -63.86 relative to the 358-wide card.
    width: scale(128),
    height: scale(128),
    borderRadius: radius.pill,
    top: scale(-63.86),
    left: scale(294),
    backgroundColor: colors.textPrimary,
    opacity: 0.1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceBlock: {
    paddingTop: spacing.xs, // 4
  },
  hint: {
    paddingTop: spacing.xxs, // 2
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.xl, // 16
  },
  stat: {
    flex: 1, // three equal 100.67 columns
    height: scale(50.97),
    justifyContent: 'center',
    paddingVertical: spacing.md, // 8
    borderRadius: radius.sm, // 14
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.xl, // 16
  },
  action: {
    flex: 1,
  },
});
