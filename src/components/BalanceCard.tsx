import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, scale, spacing, type} from '../theme';
import {Button} from './Button';
import {Card} from './Card';
import {Icon} from './Icon';

type BalanceCardProps = {
  balance: string;
  /** Secondary line — "+₹725 won today". */
  meta: string;
  /** Drives the eye button's label — the caller masks `balance` itself. */
  balanceHidden?: boolean;
  onToggleVisibility?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
};

/**
 * Wallet screen balance panel — 24 radius, 153.82° blue gradient, 176 tall,
 * with a 160px decorative circle bleeding off the top-right.
 */
export const BalanceCard = ({
  balance,
  meta,
  balanceHidden = false,
  onToggleVisibility,
  onDeposit,
  onWithdraw,
}: BalanceCardProps) => (
  <Card
    variant="gradient"
    gradient="walletBalance"
    style={styles.card}
    contentStyle={styles.content}>
    <View style={styles.decorCircle} pointerEvents="none" />

    <View style={styles.inner}>
      <View style={styles.labelRow}>
        <Text style={type.balanceLabel}>Total Balance</Text>
        <Pressable
          onPress={onToggleVisibility}
          hitSlop={spacing.lg}
          accessibilityRole="button"
          accessibilityState={{expanded: !balanceHidden}}
          accessibilityLabel={
            balanceHidden ? 'Show wallet balance' : 'Hide wallet balance'
          }>
          <Icon name="eyeXs" />
        </Pressable>
      </View>

      <Text style={[type.balance, styles.amount]}>{balance}</Text>
      <Text style={[type.balanceMeta, styles.meta]}>{meta}</Text>

      <View style={styles.actions}>
        <Button
          variant="glass"
          icon="plusMd"
          label="Deposit"
          onPress={onDeposit}
          style={styles.action}
          labelStyle={type.buttonLg}
        />
        <Button
          variant="glassSoft"
          icon="minusMd"
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
    height: scale(175.965),
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
    // Figma: 160px circle at x 278 / y -80 on the 358-wide card.
    width: scale(160),
    height: scale(160),
    borderRadius: radius.pill,
    top: scale(-80),
    left: scale(278),
    backgroundColor: colors.textPrimary,
    opacity: 0.1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    paddingTop: spacing.xs, // 4
  },
  meta: {
    paddingTop: spacing.xs, // 4
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
    paddingTop: spacing.xl, // 16
  },
  action: {
    flex: 1,
    height: scale(43.991), // 44 — taller than the Home wallet buttons
    borderRadius: radius.md, // 16
    gap: spacing.md, // 8
  },
});
