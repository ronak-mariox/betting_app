import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  BackHeader,
  Button,
  Card,
  Chip,
  Icon,
  InfoCallout,
  MethodToggle,
} from '../components';
import {
  minWithdrawal,
  quickAmounts,
  upiLogos,
  withdrawCopy,
  withdrawHeader,
  withdrawMethods,
} from '../data/withdraw';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

/** 8:1112 → 8:1218 → 8:1280 */
type WithdrawStep = 'form' | 'confirm' | 'done';

type WithdrawScreenProps = {
  onBack?: () => void;
  /** "Back to Wallet" on the confirmation step, with the withdrawn amount. */
  onDone?: (amount: number) => void;
};

const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** Deterministic stand-in for a server-issued reference. */
const refIdFor = (amount: number) => `WIT${13693845 + (amount % 1000)}`;

/**
 * Withdraw — the three Figma frames are steps of one flow, so the amount,
 * method and destination entered on step 1 carry through to the confirmation.
 */
export const WithdrawScreen = ({onBack, onDone}: WithdrawScreenProps) => {
  const [step, setStep] = useState<WithdrawStep>('form');
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState(withdrawMethods[0].id);
  const [upiId, setUpiId] = useState('');

  const value = Number(amount) || 0;
  const isUpi = methodId === 'upi';
  const canContinue =
    value >= minWithdrawal &&
    value <= withdrawHeader.available &&
    (!isUpi || upiId.trim().length > 0);

  const goBack = () => {
    if (step === 'confirm') {
      setStep('form');
    } else if (step === 'done') {
      onDone?.(value);
    } else {
      onBack?.();
    }
  };

  return (
    <View style={styles.screen}>
      <BackHeader
        title={withdrawHeader.title}
        subtitle={`Available: ${rupees(withdrawHeader.available)}`}
        onBack={goBack}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        {step === 'form' ? (
          <>
            <View>
              <Text style={[type.fieldLabel, styles.label]}>Amount (₹)</Text>
              <TextInput
                value={amount}
                onChangeText={next => setAmount(next.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder={`Min ${rupees(minWithdrawal)}`}
                placeholderTextColor={colors.onPrimary50}
                style={[
                  type.amountInput,
                  styles.amountInput,
                  amount.length > 0 && styles.amountInputActive,
                ]}
                accessibilityLabel="Withdrawal amount"
              />

              <View style={styles.quickRow}>
                {quickAmounts.map(option => (
                  <Chip
                    key={option.label}
                    tone="amount"
                    label={option.label}
                    active={value === option.value}
                    onPress={() => setAmount(String(option.value))}
                    style={styles.flex}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text style={type.fieldLabel}>Withdrawal Method</Text>
              <View style={styles.methodWrap}>
                <MethodToggle
                  options={withdrawMethods}
                  value={methodId}
                  onChange={setMethodId}
                />
              </View>

              {isUpi ? (
                <Card style={styles.upiCard} contentStyle={styles.upiPad}>
                  <Text style={[type.fieldLabel, styles.upiLabel]}>
                    {withdrawCopy.upiLabel}
                  </Text>
                  <TextInput
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder={withdrawCopy.upiPlaceholder}
                    placeholderTextColor={colors.textDim}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[type.input, styles.upiInput]}
                    accessibilityLabel="UPI ID"
                  />
                  <Text style={[type.helperText, styles.helper]}>
                    {withdrawCopy.upiHelper}
                  </Text>
                  <View style={styles.logos}>
                    {upiLogos.map((logo, index) => (
                      <Image
                        key={index}
                        source={logo}
                        style={styles.logo}
                        resizeMode="contain"
                      />
                    ))}
                  </View>
                </Card>
              ) : null}
            </View>

            <InfoCallout tone="warning" body={withdrawCopy.warning} />

            <Button
              variant="primary"
              size="lg"
              label="Continue"
              disabled={!canContinue}
              onPress={() => setStep('confirm')}
            />
          </>
        ) : null}

        {step === 'confirm' ? (
          <>
            <Card contentStyle={styles.confirmPad}>
              <Text style={type.cardTitle}>Confirm Withdrawal</Text>

              <View style={styles.confirmRows}>
                {[
                  {label: 'Amount', value: rupees(value)},
                  {label: 'Method', value: isUpi ? 'UPI' : 'Bank'},
                  {label: 'To', value: isUpi ? upiId : 'Bank account'},
                  {
                    label: 'Processing Time',
                    value: withdrawCopy.processingTime,
                  },
                ].map((row, index, rows) => (
                  <View
                    key={row.label}
                    style={[
                      styles.confirmRow,
                      index < rows.length - 1 && styles.confirmDivider,
                    ]}>
                    <Text style={type.confirmLabel}>{row.label}</Text>
                    <Text style={type.confirmValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </Card>

            <View style={styles.actions}>
              <Pressable
                onPress={() => setStep('form')}
                accessibilityRole="button"
                accessibilityLabel="Edit withdrawal"
                style={({pressed}) => [
                  styles.action,
                  styles.edit,
                  pressed && styles.pressed,
                ]}>
                <Text style={[type.sheetButton, styles.editLabel]}>Edit</Text>
              </Pressable>

              <Pressable
                onPress={() => setStep('done')}
                accessibilityRole="button"
                accessibilityLabel="Confirm withdraw"
                style={({pressed}) => [styles.action, pressed && styles.pressed]}>
                <LinearGradient
                  useAngle
                  angle={gradients.ctaPrimaryConfirm.angle}
                  colors={[...gradients.ctaPrimaryConfirm.colors]}
                  locations={[...gradients.ctaPrimaryConfirm.locations]}
                  style={styles.actionFill}>
                  <Text style={[type.sheetButton, styles.confirmCta]}>
                    Confirm Withdraw
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </>
        ) : null}

        {step === 'done' ? (
          <View style={styles.doneWrap}>
            <View style={styles.checkCircle}>
              <Icon name="check" />
            </View>

            <Text style={[type.successTitle, styles.doneTitle]}>
              Withdrawal Requested!
            </Text>
            <Text style={[type.successSub, styles.doneSub]}>
              {`${rupees(value)} will be credited within 24 hours`}
            </Text>

            <Card style={styles.summary} contentStyle={styles.summaryPad}>
              {[
                {label: 'Amount', value: rupees(value)},
                {label: 'Status', value: 'Processing'},
                {label: 'Ref ID', value: refIdFor(value)},
              ].map((row, index, rows) => (
                <View
                  key={row.label}
                  style={[
                    styles.summaryRow,
                    index < rows.length - 1 && styles.summaryDivider,
                  ]}>
                  <Text style={type.statText}>{row.label}</Text>
                  <Text style={type.summaryValue}>{row.value}</Text>
                </View>
              ))}
            </Card>

            <Button
              variant="primary"
              size="lg"
              label="Back to Wallet"
              onPress={() => onDone?.(value)}
              style={styles.fullWidth}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    gap: spacing.xl, // 16
    paddingHorizontal: spacing.gutter, // 16
    paddingBottom: scale(32),
  },
  flex: {
    flex: 1,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    paddingBottom: spacing.md, // 8
  },

  /* --- Step 1 --------------------------------------------------------- */
  amountInput: {
    height: scale(55.994),
    paddingHorizontal: scale(16.701),
    paddingVertical: 0,
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  amountInputActive: {
    borderColor: colors.primary, // the frame shows a filled field focused
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.lg, // 12
  },
  methodWrap: {
    paddingTop: spacing.lg, // 12
  },
  upiCard: {
    marginTop: spacing.xl, // 16
  },
  upiPad: {
    padding: scale(16.701),
  },
  upiLabel: {
    paddingBottom: spacing.xs, // 4
  },
  upiInput: {
    height: scale(47.999),
    paddingHorizontal: scale(16.701),
    paddingVertical: 0,
    borderRadius: radius.sm, // 14
    backgroundColor: colors.bgBase,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  helper: {
    paddingTop: spacing.lg, // 12
  },
  logos: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.lg, // 12
  },
  logo: {
    width: scale(32),
    height: scale(32),
  },

  /* --- Step 2 --------------------------------------------------------- */
  confirmPad: {
    padding: scale(20.701),
  },
  confirmRows: {
    paddingTop: spacing.xl, // 16
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg, // 12
    paddingBottom: scale(12.701),
  },
  confirmDivider: {
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderCard,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg, // 12
  },
  action: {
    flex: 1,
    height: scale(55.994),
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  actionFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edit: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderNeutral,
  },
  editLabel: {
    color: colors.textLabel,
  },
  confirmCta: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.75,
  },

  /* --- Step 3 --------------------------------------------------------- */
  doneWrap: {
    alignItems: 'center',
    paddingVertical: scale(32),
  },
  checkCircle: {
    width: scale(95.999),
    height: scale(95.999),
    borderRadius: radius.pill,
    backgroundColor: colors.chipSuccessStrong,
    borderWidth: Math.max(hairline, scale(1.402)),
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl, // 24
  },
  doneTitle: {
    marginBottom: spacing.md, // 8
  },
  doneSub: {
    marginBottom: spacing.xxxl, // 24
  },
  summary: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl, // 16
  },
  summaryPad: {
    paddingHorizontal: scale(16.701),
    paddingVertical: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + spacing.xxs, // 10
  },
  summaryDivider: {
    borderBottomWidth: hairline,
    borderBottomColor: colors.borderTile,
  },
});
