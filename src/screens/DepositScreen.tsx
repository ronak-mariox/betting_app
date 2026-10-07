import React, {useMemo, useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import type {ImagePickerResponse} from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import {
  BackHeader,
  Button,
  Card,
  Chip,
  DocUploadCard,
  Icon,
  PaymentMethodRow,
} from '../components';
import {
  depositHeader,
  minDeposit as defaultMinDeposit,
  paymentMethods,
  paymentProof,
  qrImage,
  quickAmounts,
  upiId,
} from '../data/deposit';
import {copyToClipboard, notify} from '../utils/actions';
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

/** The payment screenshot, as a data URI ready to send. */
export type PaymentProof = {name: string; data: string};

/** Sharp enough to read the amount and UTR, small enough to upload quickly. */
const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.7 as const,
  includeBase64: true,
};

const MAX_PROOF_BYTES = 5 * 1024 * 1024;

type DepositScreenProps = {
  /** Platform limits, from the wallet API. */
  minDeposit?: number;
  maxDeposit?: number;
  onBack?: () => void;
  /**
   * "I've Paid": files the deposit request, with the transaction id and the
   * payment screenshot, for approval on the panel. Resolves to the request's
   * reference, or null if it failed.
   */
  onSubmit?: (request: {
    amount: number;
    method: string;
    reference: string;
    proof: PaymentProof;
  }) => Promise<string | null>;
  /** "Back to Wallet" on the confirmation step. */
  onDone?: () => void;
};

const rupees = (amount: number) =>
  `₹${Math.round(amount).toLocaleString('en-IN')}`;

/** Same rule as the backend: a UTR / transaction id is 6 to 40 letters and digits. */
const TXN_ID_MIN = 6;
const TXN_ID_MAX = 40;
const toTxnId = (raw: string) =>
  raw
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, TXN_ID_MAX);

/**
 * Deposit — the three Figma frames are steps of one flow, so they share the
 * header and the entered amount rather than being separate screens.
 */
export const DepositScreen = ({
  minDeposit = defaultMinDeposit,
  maxDeposit = Infinity,
  onBack,
  onSubmit,
  onDone,
}: DepositScreenProps) => {
  const [step, setStep] = useState<DepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState(paymentMethods[0].id);
  const [txnId, setTxnId] = useState('');
  const [txnTouched, setTxnTouched] = useState(false);
  const [proof, setProof] = useState<PaymentProof | null>(null);
  /** True once "I've Paid" was tried without a screenshot. */
  const [proofMissing, setProofMissing] = useState(false);
  const [refId, setRefId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /** The agent matches the payment by this id, so the request can't go without it. */
  const txnValid = txnId.length >= TXN_ID_MIN;
  const txnError = !txnTouched
    ? null
    : txnId.length === 0
    ? 'Transaction ID daalna zaroori hai'
    : !txnValid
    ? `Transaction ID kam se kam ${TXN_ID_MIN} characters ka hota hai`
    : null;

  const pickProof = () => {
    const onResult = (result: ImagePickerResponse) => {
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        notify(result.errorMessage ?? 'Photo select nahi ho paya');
        return;
      }
      const asset = result.assets?.[0];
      if (!asset?.base64) {
        return;
      }
      if ((asset.base64.length * 3) / 4 > MAX_PROOF_BYTES) {
        notify('Photo 5MB se chhoti honi chahiye');
        return;
      }
      setProof({
        name: asset.fileName ?? 'payment_screenshot.jpg',
        data: `data:${asset.type ?? 'image/jpeg'};base64,${asset.base64}`,
      });
      setProofMissing(false);
    };

    Alert.alert(paymentProof.title, undefined, [
      {
        text: 'Choose from Gallery',
        onPress: () => launchImageLibrary(PICKER_OPTIONS, onResult),
      },
      {text: 'Camera', onPress: () => launchCamera(PICKER_OPTIONS, onResult)},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const canSubmit = txnValid && proof !== null;

  const submit = async () => {
    setTxnTouched(true);
    setProofMissing(proof === null);
    if (!txnValid || !proof) {
      return;
    }
    setSubmitting(true);
    const reference = await onSubmit?.({
      amount: value,
      method: method.name,
      reference: txnId,
      proof,
    });
    setSubmitting(false);
    if (reference) {
      setRefId(reference);
      setStep('done');
    }
  };

  const value = Number(amount) || 0;
  const overMax = value > maxDeposit;
  const canPay = value >= minDeposit && !overMax;
  const method = useMemo(
    () => paymentMethods.find(m => m.id === methodId)!,
    [methodId],
  );

  const goBack = () => {
    if (step === 'pay') {
      setStep('amount');
    } else if (step === 'done') {
      onDone?.();
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
              label={
                overMax
                  ? `Maximum ${rupees(maxDeposit)} per deposit`
                  : `Pay ${value ? rupees(value) : '₹—'} via ${method.name}`
              }
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
                Transaction ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={txnId}
                onChangeText={next => setTxnId(toTxnId(next))}
                onBlur={() => setTxnTouched(true)}
                placeholder="Enter UTR/Transaction ID"
                placeholderTextColor={colors.textDim}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={TXN_ID_MAX}
                style={[
                  type.input,
                  styles.txnInput,
                  txnError ? styles.txnInputError : null,
                ]}
                accessibilityLabel="Transaction ID"
              />
              <Text
                style={[
                  type.statText,
                  styles.txnHint,
                  txnError ? styles.txnErrorText : null,
                ]}>
                {txnError ??
                  'Payment ke baad UPI app mein jo UTR / Transaction ID dikhta hai woh yahan daalo'}
              </Text>
            </Card>

            <Card contentStyle={styles.txnCard}>
              <Text style={type.fieldLabel}>
                {paymentProof.label} <Text style={styles.required}>*</Text>
              </Text>
              <DocUploadCard
                title={paymentProof.title}
                hint={paymentProof.hint}
                cta={paymentProof.cta}
                uploadedLabel={paymentProof.uploaded}
                fileName={proof?.name ?? null}
                onPick={pickProof}
                onRemove={() => setProof(null)}
              />
              <Text
                style={[
                  type.statText,
                  styles.txnHint,
                  proofMissing ? styles.txnErrorText : null,
                ]}>
                {proofMissing ? paymentProof.missing : paymentProof.help}
              </Text>
            </Card>

            <Pressable
              onPress={submit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={`I have paid ${rupees(value)}`}
              accessibilityState={{disabled: submitting || !canSubmit}}
              style={({pressed}) => [
                styles.payCta,
                !canSubmit && styles.payCtaOff,
                pressed && styles.pressed,
              ]}>
              <LinearGradient
                useAngle
                angle={gradients.ctaSuccessDeposit.angle}
                colors={[...gradients.ctaSuccessDeposit.colors]}
                locations={[...gradients.ctaSuccessDeposit.locations]}
                style={styles.payCtaFill}>
                <Text style={[type.buttonXl, styles.payCtaLabel]}>
                  {submitting ? 'Submitting…' : `I've Paid ${rupees(value)}`}
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
              {`Your ${rupees(value)} deposit is waiting for approval`}
            </Text>

            <Card style={styles.summary} contentStyle={styles.summaryPad}>
              {[
                {label: 'Amount', value: rupees(value)},
                {label: 'Method', value: method.name},
                {label: 'Status', value: 'Pending Verification'},
                {label: 'Ref ID', value: refId},
                {label: 'Screenshot', value: 'Attached ✓'},
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
              onPress={() => onDone?.()}
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
  required: {
    color: colors.danger,
  },
  txnInputError: {
    borderColor: colors.danger,
  },
  txnHint: {
    paddingTop: spacing.md, // 8
  },
  txnErrorText: {
    color: colors.danger,
  },
  payCtaOff: {
    opacity: 0.5,
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
