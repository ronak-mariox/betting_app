import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Badge,
  Bet,
  BottomSheet,
  Card,
  Icon,
  potentialWin,
  statusStyles,
} from '../components';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

type CashOutSheetProps = {
  /** Null closes the sheet; a bet opens it with that bet's figures. */
  bet: Bet | null;
  onClose: () => void;
  onConfirm: (bet: Bet) => void;
};

const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

/**
 * Cash-out confirmation — Figma node 7:4461.
 * The offer bar and percentage are the offer as a share of the potential win
 * (₹1,332 of ₹1,850 → 72%, the figure printed in the frame).
 */
export const CashOutSheet = ({bet, onClose, onConfirm}: CashOutSheetProps) => {
  if (!bet) {
    return <BottomSheet visible={false} onClose={onClose} />;
  }

  const offer = bet.cashOut ?? 0;
  const potential = potentialWin(bet);
  const ratio = potential > 0 ? offer / potential : 0;
  const status = statusStyles[bet.status];

  const stats = [
    {label: 'Stake', value: rupees(bet.stake), color: colors.textPrimary},
    {label: 'Odds', value: bet.odds.toFixed(2), color: colors.textPrimary},
    {label: 'Potential', value: rupees(potential), color: status.color},
  ];

  return (
    <BottomSheet visible onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={type.sheetTitle}>Cash Out</Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close cash out"
            style={({pressed}) => [styles.close, pressed && styles.pressed]}>
            <Icon name="close" />
          </Pressable>
        </View>

        {/* Bet summary — same layout as the list card, without the CTA */}
        <Card style={styles.block} contentStyle={styles.cardPad}>
          <View style={styles.rowBetween}>
            <Text style={type.league}>{bet.reference ?? bet.id}</Text>
            <Badge
              variant="status"
              label={status.label}
              color={status.color}
              backgroundColor={status.backgroundColor}
            />
          </View>
          <Text style={[type.matchTitle, styles.match]}>{bet.match}</Text>
          <Text style={[type.selectionLabel, styles.selection]}>
            Selection: <Text style={type.selectionName}>{bet.selection}</Text>
          </Text>
          <View style={styles.stats}>
            {stats.map(stat => (
              <View key={stat.label} style={styles.stat}>
                <Text style={type.betStatLabel}>{stat.label}</Text>
                <Text style={[type.betStatValue, {color: stat.color}]}>
                  {stat.value}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Offer */}
        <LinearGradient
          useAngle
          angle={gradients.offer.angle}
          colors={[...gradients.offer.colors]}
          locations={[...gradients.offer.locations]}
          style={styles.offer}>
          <Text style={type.offerLabel}>Cash Out Offer</Text>
          <Text style={[type.offerAmount, styles.offerAmount]}>
            {rupees(offer)}
          </Text>
          <Text style={[type.offerLabel, styles.offerSub]}>
            {`vs potential win of ${rupees(potential)}`}
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.track}>
              <View style={[styles.fill, {width: `${ratio * 100}%`}]} />
            </View>
            <Text style={type.offerPercent}>
              {`${Math.round(ratio * 100)}%`}
            </Text>
          </View>
        </LinearGradient>

        {/* Explanatory note */}
        <Card
          borderColor={colors.borderTile}
          style={styles.block}
          contentStyle={styles.cardPad}>
          <Text style={type.noteText}>
            By cashing out now you guarantee{' '}
            <Text style={type.noteHighlight}>{rupees(offer)}</Text> regardless
            of match outcome. The offer follows the live odds, so it can change.
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Keep bet"
            style={({pressed}) => [
              styles.action,
              styles.keep,
              pressed && styles.pressed,
            ]}>
            <Text style={[type.sheetButton, styles.keepLabel]}>Keep Bet</Text>
          </Pressable>

          <Pressable
            onPress={() => onConfirm(bet)}
            accessibilityRole="button"
            accessibilityLabel={`Confirm cash out of ${rupees(offer)}`}
            style={({pressed}) => [styles.action, pressed && styles.pressed]}>
            <LinearGradient
              useAngle
              angle={gradients.ctaSuccess.angle}
              colors={[...gradients.ctaSuccess.colors]}
              locations={[...gradients.ctaSuccess.locations]}
              style={styles.confirmFill}>
              <Text style={[type.sheetButton, styles.confirmLabel]}>
                {`Cash Out ${rupees(offer)}`}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
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
  match: {
    paddingTop: spacing.md, // 8
  },
  selection: {
    paddingTop: spacing.xs, // 4
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    marginTop: spacing.lg, // 12
    paddingTop: scale(12.701),
    borderTopWidth: hairline,
    borderTopColor: colors.borderCard,
  },
  stat: {
    flex: 1,
  },
  offer: {
    marginTop: spacing.xl, // 16
    padding: scale(20.701),
    borderRadius: radius.md, // 16
    borderWidth: hairline,
    borderColor: colors.offerBorder,
  },
  offerAmount: {
    paddingTop: spacing.xs, // 4
  },
  offerSub: {
    paddingTop: spacing.xs, // 4
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
    paddingTop: spacing.lg, // 12
  },
  track: {
    flex: 1,
    height: scale(5.99),
    borderRadius: radius.pill,
    backgroundColor: colors.glassCircle,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.success,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
    marginTop: spacing.xl, // 16
  },
  action: {
    flex: 1,
    height: scale(55.994),
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  keep: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderNeutral,
  },
  keepLabel: {
    color: colors.textLabel,
  },
  confirmFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLabel: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.75,
  },
});
