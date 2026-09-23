import React, {useMemo, useState} from 'react';
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
  PaymentMethodRow,
} from '../components';
import {
  depositHeader,
  minDeposit,
  paymentMethods,
  qrImage,
  quickAmounts,
  upiId,
} from '../data/deposit';
import {copyToClipboard} from '../utils/actions';
import {
  colors,
  gradients,
  hairline,
  radius,
  scale,
  spacing,
  type,
} from '../theme';

/** 8:749 → 8:896 → 8:1045 */
type DepositStep = 'amount' | 'pay' | 'done';

type DepositScreenProps = {
  onBack?: () => void;
  /** "Back to Wallet" on the confirmation step, with the deposited amount. */
  onDone?: (amount: number) => void;
};

const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** Deterministic stand-in for a server-issued reference. */
const refIdFor = (amount: number) => `DEP${13568936 + (amount % 1000)}`;

/**
 * Deposit — the three Figma frames are steps of one flow, so they share the
 * header and the entered amount rather than being separate screens.
 */
export const DepositScreen = ({onBack, onDone}: DepositScreenProps) => {
  const [step, setStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState(paymentMethods[0].id);
  const [txnId, setTxnId] = useState('');

  const value = Number(amount) || 0;
  const canPay = value >= minDeposit;
  const method = useMemo(
    () => paymentMethods.find(m => m.id === methodId)!,
    [methodId],
  );

  const goBack = () => {
    if (step === 'pay') {
      setStep('amount');
    } else if (step === 'done') {
      onDone?.(value);
    } else {
      onBack?.();
    }
  };

  return (
    <View style={styles.screen}>
      <BackHeader
        title={depositHeader.title}
        subtitle={depositHeader.subtitle}
        onBack={goBack}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}>
        {step === 'amount' ? (
          <>
            <View>
              <Text style={[type.fieldLabel, styles.label]}>Amount (₹)</Text>
              <TextInput
                value={amount}
                onChangeText={next => setAmount(next.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder={`Min ${rupees(minDeposit)}`}
                placeholderTextColor={colors.onPrimary50}
                style={[type.amountInput, styles.amountInput]}
                accessibilityLabel="Deposit amount"
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
              <Text style={type.fieldLabel}>Select Payment Method</Text>
              <View style={styles.methods}>
                {paymentMethods.map(item => (
                  <PaymentMethodRow
                    key={item.id}
                    method={item}
                    selected={item.id === methodId}
                    onSelect={setMethodId}
                  />
                ))}
              </View>
            </View>

            <Button
              variant="primary"
              size="lg"
              label={`Pay ${value ? rupees(value) : '₹—'} via ${method.name}`}
              disabled={!canPay}
              onPress={() => setStep('pay')}
            />
          </>
        ) : null}

        {step === 'pay' ? (
          <>
            <Card contentStyle={styles.payCard}>
              <View style={styles.brandRow}>
                {method.logo ? (
                  <Image
                    source={method.logo}
                    style={styles.brandLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <Icon name={method.icon!} />
                )}
                <Text style={type.cardTitle}>{method.name}</Text>
              </View>

              <Text style={[type.statText, styles.qrCaption]}>
                {`Scan QR to pay ${rupees(value)}`}
              </Text>

              <View style={styles.qrFrame}>
                <Image
                  source={qrImage}
                  style={styles.qr}
                  resizeMode="contain"
                  accessibilityLabel="Payment QR code"
                />
              </View>

              <View style={styles.upiRow}>
                <Text style={type.linkStrong}>{upiId}</Text>
                <Pressable
                  onPress={() => copyToClipboard(upiId, 'UPI ID copy ho gaya')}
                  hitSlop={spacing.lg}
                  accessibilityRole="button"
                  accessibilityLabel="Copy UPI ID">
                  <Icon name="copy" />
                </Pressable>
              </View>
            </Card>

            <Card contentStyle={styles.txnCard}>
              <Text style={[type.fieldLabel, styles.label]}>
                Transaction ID (optional)
              </Text>
              <TextInput
                value={txnId}
                onChangeText={setTxnId}
                placeholder="Enter UTR/Transaction ID"
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                style={[type.input, styles.txnInput]}
                accessibilityLabel="Transaction ID"
              />
            </Card>

            <Pressable
              onPress={() => setStep('done')}
              accessibilityRole="button"
              accessibilityLabel={`I have paid ${rupees(value)}`}
              style={({pressed}) => [styles.payCta, pressed && styles.pressed]}>
              <LinearGradient
                useAngle
                angle={gradients.ctaSuccessDeposit.angle}
                colors={[...gradients.ctaSuccessDeposit.colors]}
                locations={[...gradients.ctaSuccessDeposit.locations]}
                style={styles.payCtaFill}>
                <Text style={[type.buttonXl, styles.payCtaLabel]}>
                  {`I've Paid ${rupees(value)}`}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => setStep('amount')}
              hitSlop={spacing.md}
              accessibilityRole="button">
              <Text style={type.changeMethod}>← Change Method</Text>
            </Pressable>
          </>
        ) : null}

        {step === 'done' ? (
          <View style={styles.doneWrap}>
            <View style={styles.checkCircle}>
              <Icon name="check" />
            </View>

            <Text style={[type.successTitle, styles.doneTitle]}>
              Deposit Submitted!
            </Text>
            <Text style={[type.successSub, styles.doneSub]}>
              {`Your ${rupees(value)} deposit is being verified`}
            </Text>

            <Card style={styles.summary} contentStyle={styles.summaryPad}>
              {[
                {label: 'Amount', value: rupees(value)},
                {label: 'Method', value: method.name},
                {label: 'Status', value: 'Pending Verification'},
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
  amountInput: {
    height: scale(55.994),
    paddingHorizontal: scale(16.701),
    paddingVertical: 0,
    borderRadius: radius.md, // 16
    backgroundColor: colors.surface,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.md, // 8
    paddingTop: spacing.lg, // 12
  },
  methods: {
    gap: spacing.md, // 8
    paddingTop: spacing.lg, // 12
  },

  /* --- Step 2 --------------------------------------------------------- */
  payCard: {
    alignItems: 'center',
    padding: scale(20.701),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
  },
  brandLogo: {
    width: scale(32),
    height: scale(32),
  },
  qrCaption: {
    paddingTop: spacing.lg, // 12
  },
  qrFrame: {
    width: scale(175.997),
    height: scale(175.997),
    marginTop: spacing.xl, // 16
    padding: spacing.lg, // 12
    borderRadius: radius.md, // 16
    backgroundColor: colors.textPrimary, // white plate behind the QR
    alignItems: 'center',
    justifyContent: 'center',
  },
  qr: {
    width: '100%',
    height: '100%',
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md, // 8
    alignSelf: 'stretch',
    marginTop: spacing.xl, // 16
    paddingHorizontal: spacing.xl, // 16
    paddingVertical: spacing.md, // 8
    borderRadius: radius.sm, // 14
    backgroundColor: colors.bgBase,
  },
  txnCard: {
    padding: scale(16.701),
  },
  txnInput: {
    height: scale(47.999),
    paddingHorizontal: scale(16.701),
    paddingVertical: 0,
    borderRadius: radius.sm, // 14
    backgroundColor: colors.bgBase,
    borderWidth: hairline,
    borderColor: colors.borderInput,
  },
  payCta: {
    height: scale(55.994),
    borderRadius: radius.md, // 16
    overflow: 'hidden',
  },
  payCtaFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payCtaLabel: {
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.75,
  },

  /* --- Step 3 --------------------------------------------------------- */
  doneWrap: {
    alignItems: 'center',
    paddingTop: scale(32),
    paddingBottom: scale(64),
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
