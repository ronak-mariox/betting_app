import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  Icon,
} from '../components';
import {betSlip, formatRupees, walletBalance} from '../data/betSlip';
import {colors, hairline, radius, scale, spacing, type} from '../theme';

type BetSlipSheetProps = {
  visible: boolean;
  /** Live wallet balance in rupees; falls back to the mock figure. */
  balance?: number;
  /** The odds button that opened the slip; falls back to the mock selection. */
  selection?: string;
  odds?: number;
  onClose: () => void;
  onConfirm?: (stake: number) => void;
};

/**
 * Bet slip — Figma node 7:3760.
 * Stake drives the "Potential Win" figure live (stake × odds), and the CTA
 * disables when the stake is empty or exceeds the wallet balance.
 */
export const BetSlipSheet = ({
  visible,
  balance = walletBalance,
  selection = betSlip.selection,
  odds = betSlip.odds,
  onClose,
  onConfirm,
}: BetSlipSheetProps) => {
  const [stake, setStake] = useState(String(betSlip.defaultStake));

  const stakeValue = Number(stake) || 0;
  const potentialWin = stakeValue * odds;
  const canConfirm = stakeValue > 0 && stakeValue <= balance;

  const summary = [
    {label: 'Stake', value: formatRupees(stakeValue)},
    {
      label: 'Potential Win',
      value: formatRupees(potentialWin),
      color: colors.success,
    },
    {label: 'Wallet Balance', value: formatRupees(balance)},
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={type.sheetTitle}>Bet Slip</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close bet slip"
            style={({pressed}) => [styles.close, pressed && styles.pressed]}>
            <Icon name="close" />
          </Pressable>
        </View>

        {/* Selection */}
        <Card
          borderColor={colors.borderSheet}
          style={styles.block}
          contentStyle={styles.cardPad}>
          <View style={styles.rowBetween}>
            <Text style={type.statText}>{betSlip.league}</Text>
            {betSlip.isLive ? <Badge label="LIVE" /> : null}
          </View>

          <Text style={[type.matchTitle, styles.matchTitle]}>
            {betSlip.match}
          </Text>

          <View style={[styles.rowBetween, styles.selectionRow]}>
            <View style={styles.flex}>
              <Text style={type.slipLabel}>Selection</Text>
              <Text style={type.selectionValue} numberOfLines={1}>
                {selection}
              </Text>
            </View>
            <View>
              <Text style={[type.slipLabel, styles.alignRight]}>Odds</Text>
              <Text
                style={[
                  type.oddsValueLg,
                  styles.alignRight,
                  styles.oddsWhite,
                ]}>
                {odds.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stake */}
        <Text style={[type.fieldLabel, styles.stakeLabel]}>
          Stake Amount (₹)
        </Text>
        <TextInput
          value={stake}
          onChangeText={next => setStake(next.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          style={[type.stakeInput, styles.stakeInput]}
          accessibilityLabel="Stake amount"
        />

        <View style={styles.quickStakes}>
          {betSlip.quickStakes.map(option => (
            <Chip
              key={option.label}
              tone="stake"
              label={option.label}
              active={stakeValue === option.value}
              onPress={() => setStake(String(option.value))}
              style={styles.flex}
            />
          ))}
        </View>

        {/* Summary */}
        <Card
          borderColor={colors.borderTile}
          style={styles.block}
          contentStyle={styles.cardPad}>
          {summary.map((item, index) => (
            <View
              key={item.label}
              style={[styles.rowBetween, index > 0 && styles.summarySpacing]}>
              <Text style={type.statText}>{item.label}</Text>
              <Text style={[type.summaryValue, !!item.color && {color: item.color}]}>
                {item.value}
              </Text>
            </View>
          ))}
        </Card>

        <Button
          variant="primary"
          size="lg"
          label="Confirm Bet"
          disabled={!canConfirm}
          onPress={() => onConfirm?.(stakeValue)}
          style={styles.block}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing.xxl, // 20
    paddingBottom: scale(32),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    width: scale(32),
    height: scale(32),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  block: {
    marginTop: spacing.xl, // 16
  },
  cardPad: {
    padding: scale(16.701),
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchTitle: {
    paddingTop: spacing.md, // 8
  },
  selectionRow: {
    paddingTop: spacing.lg, // 12
  },
  flex: {
    flex: 1,
  },
  alignRight: {
    textAlign: 'right',
  },
  oddsWhite: {
    color: colors.textPrimary, // the slip shows the odds in white, not cyan
  },
  stakeLabel: {
    paddingTop: spacing.xl, // 16
    paddingBottom: spacing.md, // 8
  },
  stakeInput: {
    height: scale(55.994),
    paddingHorizontal: scale(16.701),
    paddingVertical: 0,
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.primary, // active-field border in the design
  },
  quickStakes: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.lg, // 12
  },
  summarySpacing: {
    paddingTop: spacing.md, // 8
  },
});
